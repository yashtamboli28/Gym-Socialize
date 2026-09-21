import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import os from 'os';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import prisma from './server/db.js';
import {
  isCloudinaryConfigured,
  uploadVideoToCloudinary,
} from './server/cloudinary.js';

// Setup file upload handling with Multer (stores temporarily in OS temp directory)
const uploadDir = path.join(os.tmpdir(), 'prarena_uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.warn('Could not create temp upload dir:', e);
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `pr-video-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB video limit
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ================= API ROUTES =================

  // Health and System Configuration Status
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const prCount = await prisma.pR.count();
      res.json({
        status: 'ok',
        database: 'connected',
        prCount,
        cloudinary: isCloudinaryConfigured() ? 'configured' : 'missing_credentials',
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'degraded',
        error: err.message,
        cloudinary: isCloudinaryConfigured() ? 'configured' : 'missing_credentials',
      });
    }
  });

  app.get('/api/config/status', (_req: Request, res: Response) => {
    const configured = isCloudinaryConfigured();
    res.json({
      cloudinaryConfigured: configured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
      message: configured
        ? 'Cloudinary is ready for permanent video uploads.'
        : 'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing. Video uploads will require credentials or demo mode.',
    });
  });

  // POST /api/prs - Submit PR with video upload to Cloudinary and persistence in PostgreSQL through Prisma
  app.post(
    '/api/prs',
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const uploadedFile = files?.['video']?.[0] || files?.['file']?.[0];

        const {
          userId,
          exercise,
          weight,
          reps,
          unit = 'kg',
          videoUrl: providedVideoUrl,
          thumbnailUrl: providedThumbnailUrl,
          gymId,
          notes,
          verificationStatus,
          submittedAt,
          isDemo: isDemoFlag,
        } = req.body;

        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }
        if (!exercise) {
          return res.status(400).json({ error: 'exercise is required' });
        }
        if (weight === undefined || weight === null || weight === '') {
          return res.status(400).json({ error: 'weight is required' });
        }
        if (reps === undefined || reps === null || reps === '') {
          return res.status(400).json({ error: 'reps is required' });
        }

        const isDemo =
          isDemoFlag === true ||
          isDemoFlag === 'true' ||
          (!uploadedFile && typeof providedVideoUrl === 'string' && providedVideoUrl.includes('commondatastorage'));

        let permanentVideoUrl = '';
        let generatedThumbnailUrl = providedThumbnailUrl || '';

        // 1. Upload video to Cloudinary BEFORE creating database record
        if (uploadedFile) {
          // Verify Cloudinary credentials are valid
          if (!isCloudinaryConfigured()) {
            // Delete temp file
            if (fs.existsSync(uploadedFile.path)) {
              fs.unlinkSync(uploadedFile.path);
            }
            return res.status(400).json({
              error:
                'Cloudinary credentials missing. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.',
              requiresCloudinary: true,
            });
          }

          try {
            console.log(`[Cloudinary] Uploading video for user ${userId}, exercise: ${exercise}...`);
            const uploadResult = await uploadVideoToCloudinary(uploadedFile.path, {
              folder: 'prarena_videos',
              publicId: `pr_${userId}_${Date.now()}`,
              originalFilename: uploadedFile.originalname,
            });

            permanentVideoUrl = uploadResult.secure_url;
            generatedThumbnailUrl = uploadResult.thumbnail_url || generatedThumbnailUrl;
            console.log(`[Cloudinary] Video uploaded successfully: ${permanentVideoUrl}`);
          } catch (uploadError: any) {
            console.error('[Cloudinary] Upload failed:', uploadError);
            return res.status(502).json({
              error: `Cloudinary upload failed: ${uploadError.message || 'Unknown error'}`,
            });
          }
        } else if (providedVideoUrl) {
          // A URL was provided (e.g., demo proof video or existing Cloudinary URL)
          if (providedVideoUrl.startsWith('blob:')) {
            return res.status(400).json({
              error: 'Blob URLs cannot be saved as permanent video URLs. Please upload the video file directly.',
            });
          }
          permanentVideoUrl = providedVideoUrl;
        } else {
          return res.status(400).json({
            error: 'No video file or valid video URL was provided.',
          });
        }

        // 2. Save that secure_url in PostgreSQL through Prisma
        const numericWeight = parseFloat(weight);
        const numericReps = parseInt(reps, 10);
        const status = isDemo
          ? 'DEMO'
          : verificationStatus || 'PENDING';

        const prRecord = await prisma.pR.create({
          data: {
            userId: String(userId),
            exercise: String(exercise),
            weight: isNaN(numericWeight) ? 0 : numericWeight,
            reps: isNaN(numericReps) ? 1 : numericReps,
            unit: String(unit || 'kg'),
            videoUrl: permanentVideoUrl,
            thumbnailUrl: generatedThumbnailUrl || null,
            gymId: gymId ? String(gymId) : null,
            notes: notes ? String(notes) : null,
            verificationStatus: status,
            isVerified: status === 'VERIFIED',
            submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
          },
        });

        console.log(`[DB] Saved PR record ${prRecord.id} to PostgreSQL through Prisma with videoUrl: ${prRecord.videoUrl}`);

        return res.status(201).json({
          success: true,
          pr: prRecord,
          videoUrl: prRecord.videoUrl,
          id: prRecord.id,
        });
      } catch (err: any) {
        console.error('[PR Submission Error]:', err);
        return res.status(500).json({
          error: `Failed to save PR record to database: ${err.message || 'Internal error'}`,
        });
      }
    }
  );

  // GET /api/users/:id/prs - Fetch user's PRs from PostgreSQL through Prisma
  app.get('/api/users/:id/prs', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const prs = await prisma.pR.findMany({
        where: { userId: id },
        orderBy: { submittedAt: 'desc' },
      });

      // Send as array, and also support .prs property by assigning to array
      res.json(prs);
    } catch (err: any) {
      console.error(`[Error fetching PRs for user ${req.params.id}]:`, err);
      res.status(500).json({
        error: `Database query failed: ${err.message || 'Internal error'}`,
      });
    }
  });

  // GET /api/prs - Fetch all PRs from PostgreSQL through Prisma
  app.get('/api/prs', async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const where = userId ? { userId: String(userId) } : {};
      const prs = await prisma.pR.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
      });
      res.json(prs);
    } catch (err: any) {
      console.error('[Error fetching PRs]:', err);
      res.status(500).json({
        error: `Database query failed: ${err.message || 'Internal error'}`,
      });
    }
  });

  // GET /api/prs/:id - Fetch single PR by ID
  app.get('/api/prs/:id', async (req: Request, res: Response) => {
    try {
      const pr = await prisma.pR.findUnique({
        where: { id: req.params.id },
      });
      if (!pr) {
        return res.status(404).json({ error: 'PR record not found' });
      }
      res.json(pr);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

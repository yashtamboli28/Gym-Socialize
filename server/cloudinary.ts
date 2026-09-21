import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

// Check if Cloudinary credentials are fully provided
export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return !!(
    cloudName &&
    cloudName.trim() !== '' &&
    apiKey &&
    apiKey.trim() !== '' &&
    apiSecret &&
    apiSecret.trim() !== ''
  );
}

// Get configured Cloudinary instance
export function configureCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary credentials are not configured. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your environment variables.'
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
}

/**
 * Uploads a video file or stream/buffer to Cloudinary
 * Returns the secure_url and metadata
 */
export async function uploadVideoToCloudinary(
  filePathOrBuffer: string | Buffer,
  options: {
    folder?: string;
    publicId?: string;
    originalFilename?: string;
  } = {}
): Promise<{
  secure_url: string;
  public_id: string;
  duration?: number;
  format?: string;
  thumbnail_url?: string;
}> {
  const cld = configureCloudinary();
  const folder = options.folder || 'prarena_videos';

  if (typeof filePathOrBuffer === 'string') {
    // Uploading from local temporary file path
    const result: UploadApiResponse = await cld.uploader.upload(filePathOrBuffer, {
      resource_type: 'video',
      folder,
      public_id: options.publicId,
      overwrite: true,
      eager: [{ format: 'jpg', resource_type: 'video' }], // Generate a preview frame
    });

    // Clean up temporary local file if it exists
    if (fs.existsSync(filePathOrBuffer)) {
      try {
        fs.unlinkSync(filePathOrBuffer);
      } catch {
        // Ignore deletion errors
      }
    }

    const secureUrl = result.secure_url;
    // Generate thumbnail URL by replacing video extension with .jpg or using eager
    const thumbnailUrl =
      result.eager?.[0]?.secure_url ||
      secureUrl.replace(/\.[^/.]+$/, '.jpg');

    return {
      secure_url: secureUrl,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
      thumbnail_url: thumbnailUrl,
    };
  } else {
    // Uploading from Buffer
    return new Promise((resolve, reject) => {
      const uploadStream = cld.uploader.upload_stream(
        {
          resource_type: 'video',
          folder,
          public_id: options.publicId,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned empty result'));

          const secureUrl = result.secure_url;
          const thumbnailUrl =
            result.eager?.[0]?.secure_url ||
            secureUrl.replace(/\.[^/.]+$/, '.jpg');

          resolve({
            secure_url: secureUrl,
            public_id: result.public_id,
            duration: result.duration,
            format: result.format,
            thumbnail_url: thumbnailUrl,
          });
        }
      );

      uploadStream.end(filePathOrBuffer);
    });
  }
}

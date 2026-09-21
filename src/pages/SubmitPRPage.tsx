import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Clock,
  ArrowLeft,
  Info,
  ShieldAlert,
  Cloud,
  Database,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { submitPRToBackend, checkConfigStatus } from '../services/api';
import { ExerciseType, WeightUnit } from '../types';

export const SubmitPRPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [exercise, setExercise] = useState<ExerciseType>('Bench Press');
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(1);
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [gymId, setGymId] = useState<string>(currentUser?.gymId || 'gym-1');
  const [notes, setNotes] = useState<string>('');

  // Video State & Cloud Persistence
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submittedPRId, setSubmittedPRId] = useState<string>('');
  const [selectedDemoVideo, setSelectedDemoVideo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [persistedVideoUrl, setPersistedVideoUrl] = useState<string>('');
  const [persistedPRRecord, setPersistedPRRecord] = useState<any>(null);

  // Cloudinary configuration status
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState<boolean | null>(null);
  const [cloudName, setCloudName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkConfigStatus()
      .then((status) => {
        setCloudinaryConfigured(status.cloudinaryConfigured);
        if (status.cloudName) setCloudName(status.cloudName);
      })
      .catch((e) => {
        console.warn('Could not verify Cloudinary config:', e);
        setCloudinaryConfigured(false);
      });
  }, []);

  const EXERCISES: ExerciseType[] = [
    'Bench Press',
    'Squat',
    'Deadlift',
    'Overhead Press',
    'Barbell Row',
  ];

  const DEMO_PROOF_VIDEOS = [
    {
      title: 'Competition Barbell Squat',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Heavy Raw Deadlift',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Paused Bench Press',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    },
  ];

  const gyms = storage.getGyms();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: 150MB limit
    if (file.size > 150 * 1024 * 1024) {
      setErrorMessage('Video file size exceeds 150MB limit.');
      return;
    }

    setErrorMessage('');
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    setSelectedDemoVideo('');
  };

  const handleSelectDemoVideo = (item: (typeof DEMO_PROOF_VIDEOS)[0]) => {
    setSelectedDemoVideo(item.url);
    setVideoPreviewUrl(item.url);
    setVideoFile(null);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsUploading(true);
    setErrorMessage('');
    setUploadProgress(10);

    try {
      const isDemo = !!selectedDemoVideo;
      
      // Submit video and PR data to backend
      // Required Architecture:
      // Backend receives video -> uploads to Cloudinary -> Cloudinary returns secure_url ->
      // Backend saves secure_url in PostgreSQL through Prisma -> Returns saved PR record
      const result = await submitPRToBackend(
        {
          userId: currentUser.id,
          exercise,
          weight: Number(weight),
          reps: Number(reps),
          unit,
          videoFile: videoFile,
          videoUrl: selectedDemoVideo || undefined,
          gymId,
          notes,
          isDemo,
        },
        (pct) => setUploadProgress(pct)
      );

      if (result.success && result.pr) {
        // Save PR in client storage cache with the real Cloudinary videoUrl
        const savedPR = storage.recordPersistedPR(result.pr);
        setSubmittedPRId(savedPR.id);
        setPersistedVideoUrl(result.pr.videoUrl || result.videoUrl);
        setPersistedPRRecord(result.pr);
        setCurrentStep(4);
      } else {
        throw new Error('Server did not return a valid saved PR record.');
      }
    } catch (err: any) {
      console.error('[SubmitPRPage] Submission error:', err);
      setErrorMessage(
        err.message || 'Failed to upload video to Cloudinary or save record in PostgreSQL.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-2 transition"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Submit Personal Record</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Prove your lift with video. Once verified by our officiating panel, your PR joins the official leaderboard.
          </p>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { step: 1, label: 'Exercise' },
          { step: 2, label: 'Stats' },
          { step: 3, label: 'Video Proof' },
          { step: 4, label: 'Verification' },
        ].map((s) => (
          <div key={s.step} className="flex flex-col gap-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep >= s.step ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                currentStep >= s.step ? 'text-emerald-400' : 'text-neutral-500'
              }`}
            >
              Step {s.step}: {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Exercise */}
      {currentStep === 1 && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Select Exercise Category</h2>
            <p className="text-xs text-neutral-400">
              Choose the primary strength movement you performed for this record.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXERCISES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setExercise(ex)}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                  exercise === ex
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      exercise === ex
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{ex}</span>
                    <span className="text-[11px] text-neutral-400">Official Standard</span>
                  </div>
                </div>
                {exercise === ex && <CheckCircle2 size={18} className="text-emerald-400" />}
              </button>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition"
            >
              Continue to Weight & Reps →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Weight, Reps, Gym, Date */}
      {currentStep === 2 && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Enter Performance Stats</h2>
            <p className="text-xs text-neutral-400">
              Provide exact barbell load, executed repetitions, and affiliated gym.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Weight */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Weight Lifted</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="600"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-2xl font-numeric font-bold text-white focus:outline-none focus:border-emerald-500"
                />
                {/* Unit Switch */}
                <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
                  {(['kg', 'lb'] as WeightUnit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition uppercase ${
                        unit === u
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reps */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Repetitions</label>
              <input
                type="number"
                min="1"
                max="50"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-2xl font-numeric font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Gym & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Gym Location</label>
              <select
                value={gymId}
                onChange={(e) => setGymId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Date of Lift</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Optional Athlete Notes (Equipment, stance, cues)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. SBD knee sleeves used, competition command paused bench, 20kg bar + 4x25kg plates..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition"
            >
              Continue to Video Proof →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Upload Proof Video */}
      {currentStep === 3 && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Upload Proof Video</h2>
              <p className="text-xs text-neutral-400">
                Upload a clear video showing the complete lift from setup to rerack.
              </p>
            </div>

            {/* Cloudinary Status Pill */}
            {cloudinaryConfigured === true ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start">
                <Cloud size={14} />
                <span>Cloudinary Connected</span>
                {cloudName && <span className="text-[10px] text-neutral-400">({cloudName})</span>}
              </div>
            ) : cloudinaryConfigured === false ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold self-start">
                <AlertCircle size={14} />
                <span>Cloudinary Unconfigured</span>
              </div>
            ) : null}
          </div>

          {/* Cloudinary Warning if not configured */}
          {cloudinaryConfigured === false && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertCircle size={16} />
                <span>Cloudinary Credentials Missing</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Cloudinary credentials (<code className="text-amber-300">CLOUDINARY_CLOUD_NAME</code>,{' '}
                <code className="text-amber-300">CLOUDINARY_API_KEY</code>,{' '}
                <code className="text-amber-300">CLOUDINARY_API_SECRET</code>) are not configured in environment secrets.
                Direct file uploads require these credentials to generate permanent Cloudinary video URLs.
                You may test the UI workflow with one of the pre-recorded <strong>DEMO ONLY</strong> videos below.
              </p>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <AlertCircle size={16} />
                <span>Upload & Persistence Error</span>
              </div>
              <p className="text-rose-200 text-[11px] leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Verification Protocol Banner */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldAlert size={16} />
              <span>Official Video Requirements:</span>
            </div>
            <ul className="space-y-1 text-neutral-300 text-[11px] list-disc pl-5">
              <li>Both lifter and barbell weights must remain in frame during the entire attempt.</li>
              <li>Camera angle must clearly show depth (Squat) or chest contact (Bench).</li>
              <li>No editing or cuts during the active movement.</li>
              <li>Supported formats: MP4, MOV, WebM (Max 150MB).</li>
            </ul>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center bg-neutral-950/60 cursor-pointer transition group ${
              videoFile
                ? 'border-emerald-500/80 bg-emerald-950/10'
                : 'border-neutral-700 hover:border-emerald-500'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 flex items-center justify-center mx-auto mb-3 transition">
              <Upload size={22} />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              {videoFile ? videoFile.name : 'Click to select or drag video file here'}
            </p>
            <p className="text-xs text-neutral-500">
              {videoFile
                ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB selected • Will be uploaded directly to Cloudinary`
                : 'MP4, WebM, or MOV up to 150MB'}
            </p>
          </div>

          {/* Preset Demo Videos for Immediate Verification Testing */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400">
                Or pick a pre-recorded demo lift:
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Demo Only — Not Permanent
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_PROOF_VIDEOS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleSelectDemoVideo(item)}
                  className={`p-2.5 rounded-xl border text-left transition text-xs flex flex-col gap-1.5 ${
                    selectedDemoVideo === item.url
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileVideo size={16} className="shrink-0 text-amber-400" />
                    <span className="truncate font-semibold">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">[DEMO ONLY]</span>
                </button>
              ))}
            </div>

            {selectedDemoVideo && (
              <p className="text-[11px] text-amber-300 mt-2 bg-amber-950/30 p-2.5 rounded-xl border border-amber-900/50">
                ℹ️ <strong>Demo Mode Selected:</strong> This uses a sample clip for demonstration purposes and is clearly marked as DEMO.
              </p>
            )}
          </div>

          {/* Video Preview if selected */}
          {videoPreviewUrl && (
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400">
                  Local Video Preview:
                </span>
                <span className="text-[10px] text-neutral-500">
                  {videoFile ? 'Local file selected' : 'Sample video selected'}
                </span>
              </div>
              <video
                src={videoPreviewUrl}
                controls
                className="w-full max-h-56 rounded-lg bg-black object-contain"
              />
            </div>
          )}

          {/* Progress bar if uploading */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="flex justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                  <span>Uploading to Cloudinary & saving to PostgreSQL...</span>
                </span>
                <span className="font-semibold text-emerald-400 font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-neutral-500">
                Cloudinary is processing video encoding and Prisma is persisting the record with permanent URL.
              </p>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={isUploading}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              disabled={(!videoFile && !selectedDemoVideo) || isUploading}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 font-bold text-sm transition flex items-center gap-2 shadow-lg"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading & Persisting...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Submitted & Pending Verification */}
      {currentStep === 4 && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                STATUS: PENDING VERIFICATION
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Database size={12} />
                <span>PERSISTED IN POSTGRESQL</span>
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              PR & Proof Video Successfully Saved!
            </h2>
            <p className="text-sm text-neutral-300 max-w-md mx-auto mt-2 leading-relaxed">
              Your lift and video proof are permanently stored in the database. When you reload or view your profile, this video remains permanently accessible.
            </p>
          </div>

          {/* Persisted Video Player */}
          {persistedVideoUrl && (
            <div className="max-w-md mx-auto bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Cloud size={14} className="text-emerald-400" />
                  Stored Video Proof
                </span>
                <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[160px]">
                  {persistedVideoUrl.includes('cloudinary') ? 'Cloudinary Hosted' : 'Permanent Video'}
                </span>
              </div>
              <video
                src={persistedVideoUrl}
                controls
                className="w-full max-h-52 rounded-xl bg-black object-contain"
              />
              <div className="pt-1">
                <span className="text-[10px] text-neutral-500 block truncate">
                  URL: {persistedVideoUrl}
                </span>
              </div>
            </div>
          )}

          <div className="bg-neutral-950/80 max-w-md mx-auto p-4 rounded-2xl border border-neutral-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-neutral-400">Exercise:</span>
              <span className="text-white font-semibold">{exercise}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Submitted Weight:</span>
              <span className="font-numeric text-emerald-400 text-base font-bold">
                {weight} {unit} × {reps} {reps === 1 ? 'rep' : 'reps'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Database Record ID:</span>
              <span className="font-mono text-neutral-300 text-[11px]">{submittedPRId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Assigned Officiation Queue:</span>
              <span className="text-neutral-300">National Referee Desk</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/profile/${currentUser?.id}`)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
            >
              View My PRs on Profile →
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition"
            >
              Open Verifier Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

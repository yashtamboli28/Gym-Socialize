export type UserRole = 'USER' | 'VERIFIER' | 'ADMIN';

export type ExerciseType = 'Bench Press' | 'Squat' | 'Deadlift' | 'Overhead Press' | 'Barbell Row';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type WeightUnit = 'kg' | 'lb';

export interface WorkoutStreak {
  current: number;
  longest: number;
  lastCompletedDate?: string;
  workoutDays: string[]; // ISO dates
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  age: number;
  gender?: string;
  city: string;
  gymId: string;
  gymName?: string;
  profilePicture: string;
  bio: string;
  role: UserRole;
  streak: WorkoutStreak;
  followersCount: number;
  followingCount: number;
  following?: string[]; // user IDs this user follows
  totalVerifiedPRs: number;
  challengesCompleted: number;
  achievements?: string[]; // achievement IDs
  createdAt: string;
}

export interface Gym {
  id: string;
  name: string;
  city: string;
  location: string;
  coverImage: string;
  logo: string;
  memberCount: number;
  description: string;
  verifiedLiftsCount: number;
  verifiedTotalWeightKg: number;
  totalWeightKg?: number;
  topLifters: {
    userId: string;
    name: string;
    username: string;
    profilePicture: string;
    bestLift: string;
    weightKg: number;
  }[];
}

export interface PRSubmission {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userProfilePicture: string;
  gymId: string;
  gymName: string;
  exercise: ExerciseType;
  weight: number;
  reps: number;
  unit: WeightUnit;
  videoUrl: string;
  thumbnailUrl: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  notes?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  aiAssistedMetrics?: {
    formScore: number;
    depthConfidence: number;
    lockoutConfirmed: boolean;
    tempoSeconds: number;
  };
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userUsername: string;
  userProfilePicture: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userProfilePicture: string;
  gymId?: string;
  gymName?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  prId?: string;
  prDetails?: {
    exercise: ExerciseType;
    weight: number;
    reps: number;
    unit: WeightUnit;
    isVerified: boolean;
  };
  likesCount: number;
  commentsCount: number;
  likedBy: string[]; // user IDs
  comments: PostComment[];
  createdAt: string;
}

export type ChallengeType = 'INDIVIDUAL' | 'GYM' | 'FRIENDS';

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  description: string;
  exercise: ExerciseType;
  targetWeightKg?: number;
  targetReps?: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  rules: string[];
  participantCount: number;
  bannerUrl: string;
  joined?: boolean;
  userProgress?: number; // 0 to 100
}

export interface Competition {
  id: string;
  title: string;
  subtitle: string;
  exercise: ExerciseType;
  gymA: {
    id: string;
    name: string;
    city: string;
    logo: string;
    verifiedLifts: number;
    totalWeightKg: number;
    participantsCount: number;
  };
  gymB: {
    id: string;
    name: string;
    city: string;
    logo: string;
    verifiedLifts: number;
    totalWeightKg: number;
    participantsCount: number;
  };
  durationDays: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  iconName: string;
  category: 'PR' | 'STREAK' | 'COMPETITION' | 'COMMUNITY';
  requirement: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

export type NotificationType =
  | 'PR_APPROVED'
  | 'PR_REJECTED'
  | 'NEW_FOLLOWER'
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'CHALLENGE_INVITE'
  | 'COMPETITION_UPDATE';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  meta?: {
    prId?: string;
    postId?: string;
    senderName?: string;
    senderAvatar?: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  submissionId: string;
  userId: string;
  userName: string;
  userUsername: string;
  userProfilePicture: string;
  gymId: string;
  gymName: string;
  exercise: ExerciseType;
  weight: number;
  reps: number;
  unit: WeightUnit;
  oneRepMaxKg: number;
  videoUrl: string;
  verifiedAt: string;
  verifiedBy?: string;
  isVerified: boolean;
  user?: {
    id: string;
    name: string;
    username: string;
    profilePicture: string;
    city: string;
  };
  gym?: {
    id: string;
    name: string;
    city: string;
  };
}

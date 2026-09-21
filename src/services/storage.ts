import {
  User,
  Gym,
  PRSubmission,
  Post,
  Challenge,
  Competition,
  Achievement,
  Notification,
  ExerciseType,
  LeaderboardEntry,
  WorkoutStreak,
} from '../types';
import {
  SEED_USERS,
  SEED_GYMS,
  SEED_PRS,
  SEED_POSTS,
  SEED_CHALLENGES,
  SEED_COMPETITIONS,
  SEED_ACHIEVEMENTS,
  SEED_NOTIFICATIONS,
} from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'prarena_users_v1',
  GYMS: 'prarena_gyms_v1',
  PRS: 'prarena_prs_v1',
  POSTS: 'prarena_posts_v1',
  CHALLENGES: 'prarena_challenges_v1',
  COMPETITIONS: 'prarena_competitions_v1',
  ACHIEVEMENTS: 'prarena_achievements_v1',
  NOTIFICATIONS: 'prarena_notifications_v1',
  FOLLOWS: 'prarena_follows_v1',
  CURRENT_USER_ID: 'prarena_current_user_id_v1',
};

// Safe localStorage helper
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse ${key} from storage`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage`, e);
  }
}

export class StorageService {
  private users: User[];
  private gyms: Gym[];
  private prs: PRSubmission[];
  private posts: Post[];
  private challenges: Challenge[];
  private competitions: Competition[];
  private achievements: Achievement[];
  private notifications: Notification[];
  private follows: { followerId: string; followingId: string }[];

  constructor() {
    this.users = loadFromStorage<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    this.gyms = loadFromStorage<Gym[]>(STORAGE_KEYS.GYMS, SEED_GYMS);
    this.prs = loadFromStorage<PRSubmission[]>(STORAGE_KEYS.PRS, SEED_PRS);
    this.posts = loadFromStorage<Post[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
    this.challenges = loadFromStorage<Challenge[]>(STORAGE_KEYS.CHALLENGES, SEED_CHALLENGES);
    this.competitions = loadFromStorage<Competition[]>(STORAGE_KEYS.COMPETITIONS, SEED_COMPETITIONS);
    this.achievements = loadFromStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, SEED_ACHIEVEMENTS);
    this.notifications = loadFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    this.follows = loadFromStorage<{ followerId: string; followingId: string }[]>(STORAGE_KEYS.FOLLOWS, [
      { followerId: 'user-1', followingId: 'user-2' },
      { followerId: 'user-1', followingId: 'user-3' },
      { followerId: 'user-2', followingId: 'user-1' },
      { followerId: 'user-3', followingId: 'user-1' },
    ]);

    // Initial save to sync
    this.persistAll();
  }

  private persistAll() {
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    saveToStorage(STORAGE_KEYS.GYMS, this.gyms);
    saveToStorage(STORAGE_KEYS.PRS, this.prs);
    saveToStorage(STORAGE_KEYS.POSTS, this.posts);
    saveToStorage(STORAGE_KEYS.CHALLENGES, this.challenges);
    saveToStorage(STORAGE_KEYS.COMPETITIONS, this.competitions);
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveToStorage(STORAGE_KEYS.FOLLOWS, this.follows);
  }

  public resetToDefaults() {
    localStorage.clear();
    this.users = [...SEED_USERS];
    this.gyms = [...SEED_GYMS];
    this.prs = [...SEED_PRS];
    this.posts = [...SEED_POSTS];
    this.challenges = [...SEED_CHALLENGES];
    this.competitions = [...SEED_COMPETITIONS];
    this.achievements = [...SEED_ACHIEVEMENTS];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.follows = [
      { followerId: 'user-1', followingId: 'user-2' },
      { followerId: 'user-1', followingId: 'user-3' },
      { followerId: 'user-2', followingId: 'user-1' },
      { followerId: 'user-3', followingId: 'user-1' },
    ];
    this.persistAll();
  }

  // ================= USERS =================
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username.toLowerCase() === username.toLowerCase().replace('@', ''));
  }

  public searchUsers(query: string): User[] {
    if (!query) return [];
    const q = query.toLowerCase();
    return this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        (u.gymName && u.gymName.toLowerCase().includes(q))
    );
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'totalVerifiedPRs' | 'challengesCompleted' | 'followersCount' | 'followingCount' | 'streak'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      streak: {
        current: 1,
        longest: 1,
        lastCompletedDate: new Date().toISOString().split('T')[0],
        workoutDays: [new Date().toISOString().split('T')[0]],
      },
      followersCount: 0,
      followingCount: 0,
      totalVerifiedPRs: 0,
      challengesCompleted: 0,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.persistAll();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates };
    this.persistAll();
    return this.users[index];
  }

  // ================= FOLLOWS =================
  public isFollowing(followerId: string, followingId: string): boolean {
    return this.follows.some((f) => f.followerId === followerId && f.followingId === followingId);
  }

  public toggleFollow(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false;
    const existingIndex = this.follows.findIndex(
      (f) => f.followerId === followerId && f.followingId === followingId
    );

    const follower = this.getUserById(followerId);
    const target = this.getUserById(followingId);

    if (existingIndex >= 0) {
      this.follows.splice(existingIndex, 1);
      if (follower) follower.followingCount = Math.max(0, follower.followingCount - 1);
      if (target) target.followersCount = Math.max(0, target.followersCount - 1);
      this.persistAll();
      return false;
    } else {
      this.follows.push({ followerId, followingId });
      if (follower) follower.followingCount += 1;
      if (target) {
        target.followersCount += 1;
        // Notification
        this.addNotification({
          userId: followingId,
          type: 'NEW_FOLLOWER',
          title: 'New Follower',
          message: `${follower?.name || 'A lifter'} started following your progress.`,
          link: `/profile/${followerId}`,
          meta: {
            senderName: follower?.name,
            senderAvatar: follower?.profilePicture,
          },
        });
      }
      this.persistAll();
      return true;
    }
  }

  public getFollowers(userId: string): User[] {
    const followerIds = this.follows.filter((f) => f.followingId === userId).map((f) => f.followerId);
    return this.users.filter((u) => followerIds.includes(u.id));
  }

  public getFollowing(userId: string): User[] {
    const followingIds = this.follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
    return this.users.filter((u) => followingIds.includes(u.id));
  }

  // ================= GYMS =================
  public getGyms(): Gym[] {
    return [...this.gyms];
  }

  public getGymById(id: string): Gym | undefined {
    return this.gyms.find((g) => g.id === id);
  }

  public joinGym(userId: string, gymId: string): User | undefined {
    const gym = this.getGymById(gymId);
    if (!gym) return undefined;
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const oldGym = user.gymId ? this.getGymById(user.gymId) : null;
    if (oldGym && oldGym.id !== gymId) {
      oldGym.memberCount = Math.max(0, oldGym.memberCount - 1);
    }
    gym.memberCount += 1;
    user.gymId = gym.id;
    user.gymName = gym.name;
    this.persistAll();
    return user;
  }

  public createGym(gymData: Partial<Gym> & { name: string; city: string }): Gym {
    const newGym: Gym = {
      id: `gym-${Date.now()}`,
      name: gymData.name,
      city: gymData.city,
      location: gymData.location || `${gymData.city} City`,
      coverImage:
        gymData.coverImage ||
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
      logo:
        gymData.logo ||
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop',
      memberCount: 1,
      description: gymData.description || 'Community barbell and fitness club.',
      verifiedLiftsCount: 0,
      verifiedTotalWeightKg: 0,
      totalWeightKg: 0,
      topLifters: [],
    };
    this.gyms.push(newGym);
    this.persistAll();
    return newGym;
  }

  // ================= PRs & VERIFICATION =================
  public getPRs(): PRSubmission[] {
    return [...this.prs].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public getPRById(id: string): PRSubmission | undefined {
    return this.prs.find((p) => p.id === id);
  }

  public getUserPRs(userId: string): PRSubmission[] {
    return this.prs.filter((p) => p.userId === userId);
  }

  public getPRsByUserId(userId: string): PRSubmission[] {
    return this.getUserPRs(userId);
  }

  public getPendingPRs(): PRSubmission[] {
    return this.prs
      .filter((p) => p.verificationStatus === 'PENDING')
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public submitPR(submission: {
    userId: string;
    exercise: ExerciseType;
    weight: number;
    reps: number;
    unit: 'kg' | 'lb';
    videoUrl: string;
    thumbnailUrl?: string;
    notes?: string;
    gymId?: string;
  }): PRSubmission {
    const user = this.getUserById(submission.userId);
    const gymId = submission.gymId || user?.gymId || 'gym-1';
    const gym = this.getGymById(gymId);

    const newPR: PRSubmission = {
      id: `pr-${Date.now()}`,
      userId: submission.userId,
      userName: user?.name || 'Athlete',
      userUsername: user?.username || 'athlete',
      userProfilePicture: user?.profilePicture || '',
      gymId,
      gymName: gym?.name || 'Affiliated Gym',
      exercise: submission.exercise,
      weight: submission.weight,
      reps: submission.reps,
      unit: submission.unit,
      videoUrl: submission.videoUrl,
      thumbnailUrl: submission.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      verificationStatus: 'PENDING',
      notes: submission.notes,
      submittedAt: new Date().toISOString(),
      aiAssistedMetrics: {
        formScore: Math.floor(Math.random() * 8) + 91,
        depthConfidence: Math.floor(Math.random() * 6) + 93,
        lockoutConfirmed: true,
        tempoSeconds: +(Math.random() * 2 + 2.5).toFixed(1),
      },
    };

    this.prs.unshift(newPR);

    // Also optionally auto-create a social feed post as "Pending PR Submitted"
    this.createPost({
      userId: submission.userId,
      gymId,
      content: `Submitted a new ${submission.weight} ${submission.unit} ${submission.exercise} for verification! Awaiting review from the officiating panel. 🏋️‍♂️`,
      prId: newPR.id,
      mediaUrl: newPR.thumbnailUrl,
      mediaType: 'photo',
      prDetails: {
        exercise: newPR.exercise,
        weight: newPR.weight,
        reps: newPR.reps,
        unit: newPR.unit,
        isVerified: false,
      },
    });

    this.persistAll();
    return newPR;
  }

  public approvePR(prId: string, verifierName: string = 'Official Verifier'): PRSubmission | undefined {
    const pr = this.getPRById(prId);
    if (!pr) return undefined;

    pr.verificationStatus = 'APPROVED';
    pr.verifiedAt = new Date().toISOString();
    pr.verifiedBy = verifierName;

    // Update user stats
    const user = this.getUserById(pr.userId);
    if (user) {
      user.totalVerifiedPRs = (user.totalVerifiedPRs || 0) + 1;
    }

    // Update gym stats
    const gym = this.getGymById(pr.gymId);
    if (gym) {
      gym.verifiedLiftsCount += 1;
      gym.verifiedTotalWeightKg += pr.unit === 'lb' ? Math.round(pr.weight * 0.453592) : pr.weight;
    }

    // Update linked post if exists
    const linkedPost = this.posts.find((p) => p.prId === prId);
    if (linkedPost && linkedPost.prDetails) {
      linkedPost.prDetails.isVerified = true;
    }

    // Update competitions if gym is active
    this.competitions.forEach((comp) => {
      if (comp.status === 'ACTIVE' && comp.exercise === pr.exercise) {
        if (comp.gymA.id === pr.gymId) {
          comp.gymA.verifiedLifts += 1;
          comp.gymA.totalWeightKg += pr.unit === 'lb' ? Math.round(pr.weight * 0.453592) : pr.weight;
        } else if (comp.gymB.id === pr.gymId) {
          comp.gymB.verifiedLifts += 1;
          comp.gymB.totalWeightKg += pr.unit === 'lb' ? Math.round(pr.weight * 0.453592) : pr.weight;
        }
      }
    });

    // Send notification
    this.addNotification({
      userId: pr.userId,
      type: 'PR_APPROVED',
      title: 'PR Officially Verified! ✓',
      message: `Your ${pr.weight} ${pr.unit} ${pr.exercise} has been approved by ${verifierName} and is now official on the leaderboard!`,
      link: `/profile/${pr.userId}`,
      meta: {
        prId: pr.id,
        senderName: verifierName,
      },
    });

    this.persistAll();
    return pr;
  }

  public rejectPR(prId: string, verifierName: string, reason: string): PRSubmission | undefined {
    const pr = this.getPRById(prId);
    if (!pr) return undefined;

    pr.verificationStatus = 'REJECTED';
    pr.verifiedAt = new Date().toISOString();
    pr.verifiedBy = verifierName;
    pr.rejectionReason = reason;

    // Send rejection notification with explanation
    this.addNotification({
      userId: pr.userId,
      type: 'PR_REJECTED',
      title: 'PR Verification Update',
      message: `Your ${pr.weight} ${pr.unit} ${pr.exercise} was not approved: "${reason}". You may re-film and submit again!`,
      link: `/submit-pr`,
      meta: {
        prId: pr.id,
        senderName: verifierName,
      },
    });

    this.persistAll();
    return pr;
  }

  // ================= LEADERBOARDS =================
  // IMPORTANT: Only APPROVED/VERIFIED PRs appear on leaderboard!
  public getLeaderboard(
    exerciseOrFilters:
      | ExerciseType
      | {
          exercise: ExerciseType;
          category?: 'Global' | 'Country' | 'City' | 'Gym' | 'Friends';
          timeFilter?: 'All Time' | 'This Month' | 'This Week';
          currentUserId?: string;
          gymId?: string;
          city?: string;
          gender?: string;
        },
    options?: {
      gymId?: string;
      friendsOnly?: boolean;
      currentUserId?: string;
      gender?: string;
      city?: string;
      timeFilter?: 'All Time' | 'This Month' | 'This Week';
    }
  ): LeaderboardEntry[] {
    let exercise: ExerciseType;
    let gymId: string | undefined;
    let city: string | undefined;
    let gender: string | undefined;
    let currentUserId: string | undefined;
    let friendsOnly = false;
    let timeFilter: 'All Time' | 'This Month' | 'This Week' | undefined;

    if (typeof exerciseOrFilters === 'string') {
      exercise = exerciseOrFilters;
      gymId = options?.gymId;
      city = options?.city;
      gender = options?.gender;
      currentUserId = options?.currentUserId;
      friendsOnly = !!options?.friendsOnly;
      timeFilter = options?.timeFilter;
    } else {
      exercise = exerciseOrFilters.exercise;
      gymId = exerciseOrFilters.gymId;
      city = exerciseOrFilters.city;
      gender = exerciseOrFilters.gender;
      currentUserId = exerciseOrFilters.currentUserId;
      friendsOnly = exerciseOrFilters.category === 'Friends';
      timeFilter = exerciseOrFilters.timeFilter;
    }

    const approvedPRs = this.prs.filter(
      (p) => p.verificationStatus === 'APPROVED' && p.exercise === exercise
    );

    // Apply time filter
    const now = new Date();
    const filteredByTime = approvedPRs.filter((p) => {
      if (!timeFilter || timeFilter === 'All Time') return true;
      const date = new Date(p.submittedAt);
      if (timeFilter === 'This Week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }
      if (timeFilter === 'This Month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo;
      }
      return true;
    });

    // Group by user to pick their single highest lift for this exercise
    const userBestMap = new Map<string, PRSubmission>();
    filteredByTime.forEach((pr) => {
      const weightInKg = pr.unit === 'lb' ? pr.weight * 0.453592 : pr.weight;
      const existing = userBestMap.get(pr.userId);
      if (!existing) {
        userBestMap.set(pr.userId, pr);
      } else {
        const existingKg = existing.unit === 'lb' ? existing.weight * 0.453592 : existing.weight;
        if (weightInKg > existingKg) {
          userBestMap.set(pr.userId, pr);
        }
      }
    });

    // Convert to entries
    let entries: LeaderboardEntry[] = [];
    userBestMap.forEach((pr) => {
      const user = this.getUserById(pr.userId);
      const gym = this.getGymById(pr.gymId);
      if (!user) return;

      if (gender && user.gender && user.gender.toLowerCase() !== gender.toLowerCase()) {
        return;
      }

      const weightInKg = pr.unit === 'lb' ? Math.round(pr.weight * 0.453592) : pr.weight;
      // 1RM estimation (Epley formula: w * (1 + r/30))
      const oneRepMaxKg = Math.round(weightInKg * (1 + pr.reps / 30));

      entries.push({
        rank: 0,
        submissionId: pr.id,
        userId: user.id,
        userName: user.name,
        userUsername: user.username,
        userProfilePicture: user.profilePicture,
        gymId: gym?.id || pr.gymId || 'gym-1',
        gymName: gym?.name || pr.gymName || 'Local Gym',
        exercise: pr.exercise,
        weight: pr.weight,
        reps: pr.reps,
        unit: pr.unit,
        oneRepMaxKg,
        videoUrl: pr.videoUrl,
        verifiedAt: pr.verifiedAt || pr.submittedAt,
        verifiedBy: pr.verifiedBy || 'Official Verifier',
        isVerified: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          profilePicture: user.profilePicture,
          city: user.city,
        },
        gym: {
          id: gym?.id || 'gym-1',
          name: gym?.name || 'Local Gym',
          city: gym?.city || user.city,
        },
      });
    });

    // Filters
    if (city) {
      entries = entries.filter(
        (e) => e.user?.city.toLowerCase() === city!.toLowerCase()
      );
    }
    if (gymId) {
      entries = entries.filter((e) => e.gymId === gymId);
    }
    if (friendsOnly && currentUserId) {
      const friendIds = this.getFollowing(currentUserId).map((u) => u.id);
      friendIds.push(currentUserId);
      entries = entries.filter((e) => friendIds.includes(e.userId));
    }

    // Sort descending by 1RM / weight
    entries.sort((a, b) => b.oneRepMaxKg - a.oneRepMaxKg);

    // Assign rank
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }

  // ================= FEED & POSTS =================
  public getFeed(filter: 'all' | 'friends' | 'gym' = 'all', currentUserId?: string): Post[] {
    let posts = [...this.posts];

    if (filter === 'friends' && currentUserId) {
      const followingIds = this.getFollowing(currentUserId).map((u) => u.id);
      followingIds.push(currentUserId);
      posts = posts.filter((p) => followingIds.includes(p.userId));
    } else if (filter === 'gym' && currentUserId) {
      const user = this.getUserById(currentUserId);
      if (user?.gymId) {
        posts = posts.filter((p) => p.gymId === user.gymId);
      }
    }

    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPosts(): Post[] {
    return [...this.posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getPostsByUserId(userId: string): Post[] {
    return this.posts
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createPost(postData: {
    userId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'photo' | 'video';
    gymId?: string;
    prId?: string;
    prDetails?: Post['prDetails'];
  }): Post {
    const user = this.getUserById(postData.userId);
    const gymId = postData.gymId || user?.gymId;
    const gym = gymId ? this.getGymById(gymId) : undefined;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: postData.userId,
      userName: user?.name || 'Lifter',
      userUsername: user?.username || 'lifter',
      userProfilePicture: user?.profilePicture || '',
      gymId,
      gymName: gym?.name,
      content: postData.content,
      mediaUrl: postData.mediaUrl,
      mediaType: postData.mediaType,
      prId: postData.prId,
      prDetails: postData.prDetails,
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    this.posts.unshift(newPost);
    this.persistAll();
    return newPost;
  }

  public toggleLike(postId: string, userId: string): { liked: boolean; count: number } {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return { liked: false, count: 0 };

    const idx = post.likedBy.indexOf(userId);
    let liked = false;
    if (idx >= 0) {
      post.likedBy.splice(idx, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
      liked = false;
    } else {
      post.likedBy.push(userId);
      post.likesCount += 1;
      liked = true;

      // Notify author if not self
      if (post.userId !== userId) {
        const liker = this.getUserById(userId);
        this.addNotification({
          userId: post.userId,
          type: 'POST_LIKE',
          title: 'Post Liked',
          message: `${liker?.name || 'A lifter'} liked your workout post.`,
          link: '/feed',
          meta: {
            postId: post.id,
            senderName: liker?.name,
            senderAvatar: liker?.profilePicture,
          },
        });
      }
    }

    this.persistAll();
    return { liked, count: post.likesCount };
  }

  public addComment(postId: string, userId: string, content: string): Post | undefined {
    const post = this.posts.find((p) => p.id === postId);
    const user = this.getUserById(userId);
    if (!post || !user || !content.trim()) return undefined;

    const newComment = {
      id: `c-${Date.now()}`,
      postId,
      userId,
      userName: user.name,
      userUsername: user.username,
      userProfilePicture: user.profilePicture,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    post.comments.push(newComment);
    post.commentsCount = post.comments.length;

    if (post.userId !== userId) {
      this.addNotification({
        userId: post.userId,
        type: 'POST_COMMENT',
        title: 'New Comment',
        message: `${user.name} commented: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
        link: '/feed',
        meta: {
          postId: post.id,
          senderName: user.name,
          senderAvatar: user.profilePicture,
        },
      });
    }

    this.persistAll();
    return post;
  }

  // ================= CHALLENGES =================
  public getChallenges(): Challenge[] {
    return [...this.challenges];
  }

  public joinChallenge(challengeId: string, userId: string): boolean {
    const ch = this.challenges.find((c) => c.id === challengeId);
    if (!ch) return false;
    ch.joined = true;
    ch.participantCount += 1;
    ch.userProgress = 10;
    this.persistAll();
    return true;
  }

  // ================= COMPETITIONS =================
  public getCompetitions(): Competition[] {
    return [...this.competitions];
  }

  // ================= ACHIEVEMENTS =================
  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  // ================= STREAK =================
  public logWorkoutToday(userId: string): WorkoutStreak | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const todayStr = new Date().toISOString().split('T')[0];
    if (user.streak.lastCompletedDate === todayStr) {
      return user.streak; // already logged today
    }

    const lastDate = user.streak.lastCompletedDate ? new Date(user.streak.lastCompletedDate) : null;
    const today = new Date(todayStr);

    let isConsecutive = false;
    if (lastDate) {
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        isConsecutive = true;
      }
    }

    const nextCurrent = isConsecutive ? user.streak.current + 1 : 1;
    const nextLongest = Math.max(user.streak.longest, nextCurrent);

    const workoutDays = Array.from(new Set([...user.streak.workoutDays, todayStr]));

    user.streak = {
      current: nextCurrent,
      longest: nextLongest,
      lastCompletedDate: todayStr,
      workoutDays,
    };

    this.persistAll();
    return user.streak;
  }

  // ================= NOTIFICATIONS =================
  public getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId || n.userId === 'all');
  }

  public addNotification(notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    this.persistAll();
  }

  public markAsRead(notificationId: string): void {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      this.persistAll();
    }
  }

  public markAllAsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.persistAll();
  }
}

export const storage = new StorageService();

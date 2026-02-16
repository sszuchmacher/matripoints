export type TaskCategory =
  | "chores"
  | "groceries"
  | "errands"
  | "home"
  | "kids"
  | "custom";

export type Recurrence = "daily" | "weekly" | "monthly" | null;

export interface Profile {
  id: string;
  coupleId: string;
  displayName: string;
  avatarEmoji: string;
  createdAt: string;
}

export interface Couple {
  id: string;
  name: string;
  inviteCode: string;
  pointsEnabled: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  coupleId: string;
  title: string;
  category: TaskCategory;
  assignedTo: string | null;
  completedBy: string | null;
  completedAt: string | null;
  isRecurring: boolean;
  recurrence: Recurrence;
  pointsValue: number;
  createdBy: string;
  createdAt: string;
}

export interface PointsLog {
  id: string;
  coupleId: string;
  profileId: string;
  taskId: string;
  points: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  profileId: string;
  badgeType: string;
  earnedAt: string;
}

export interface Wish {
  id: string;
  profileId: string;
  coupleId: string;
  title: string;
  description: string;
  createdAt: string;
}

export const CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; icon: string; color: string }
> = {
  chores: { label: "Chores", icon: "broom", color: "#6C5CE7" },
  groceries: { label: "Groceries", icon: "cart", color: "#00CEC9" },
  errands: { label: "Errands", icon: "run-fast", color: "#FD79A8" },
  home: { label: "Home", icon: "home", color: "#FDCB6E" },
  kids: { label: "Kids", icon: "baby-face-outline", color: "#E17055" },
  custom: { label: "Other", icon: "dots-horizontal", color: "#636E72" },
};

export const BADGE_DEFINITIONS: Record<
  string,
  { title: string; description: string; emoji: string; threshold: number; category?: TaskCategory }
> = {
  dish_destroyer: {
    title: "Dish Destroyer",
    description: "Complete 10 chores tasks",
    emoji: "🧹",
    threshold: 10,
    category: "chores",
  },
  errand_express: {
    title: "Errand Express",
    description: "Complete 10 errands",
    emoji: "🏃",
    threshold: 10,
    category: "errands",
  },
  grocery_guru: {
    title: "Grocery Guru",
    description: "Complete 10 grocery runs",
    emoji: "🛒",
    threshold: 10,
    category: "groceries",
  },
  home_hero: {
    title: "Home Hero",
    description: "Complete 10 home tasks",
    emoji: "🏠",
    threshold: 10,
    category: "home",
  },
  team_player: {
    title: "Team Player",
    description: "Complete 50 tasks total",
    emoji: "🤝",
    threshold: 50,
  },
  centurion: {
    title: "Centurion",
    description: "Earn 100 points in a week",
    emoji: "💯",
    threshold: 100,
  },
  streak_star: {
    title: "Streak Star",
    description: "Complete tasks 7 days in a row",
    emoji: "⭐",
    threshold: 7,
  },
};

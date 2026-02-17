import { create } from "zustand";
import type { Task, Profile, Couple, Badge, Wish } from "../types";
import * as db from "../db/database";
import type { TaskCategory, Recurrence } from "../types";
import { BADGE_DEFINITIONS } from "../types";

interface AppState {
  // Data
  couple: Couple | null;
  profiles: Profile[];
  currentProfileId: string | null;
  tasks: Task[];
  badges: Badge[];
  wishes: Wish[];
  weeklyPoints: { profileId: string; total: number }[];
  teamWeeklyPoints: number;
  completedThisWeek: number;

  // Setup
  isSetupComplete: boolean;

  // Actions
  setupCouple: (coupleName: string, partnerNames: [string, string], avatars: [string, string]) => Promise<void>;
  loadData: () => Promise<void>;
  switchProfile: (profileId: string) => void;

  // Task actions
  addTask: (params: {
    title: string;
    category: TaskCategory;
    assignedTo: string | null;
    isRecurring: boolean;
    recurrence: Recurrence;
    pointsValue: number;
  }) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  uncompleteTask: (taskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;

  // Points
  togglePoints: (enabled: boolean) => Promise<void>;

  // Wishes
  addWish: (title: string, description: string) => Promise<void>;
  removeWish: (wishId: string) => Promise<void>;

  // Badges
  checkAndAwardBadges: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  couple: null,
  profiles: [],
  currentProfileId: null,
  tasks: [],
  badges: [],
  wishes: [],
  weeklyPoints: [],
  teamWeeklyPoints: 0,
  completedThisWeek: 0,
  isSetupComplete: false,

  setupCouple: async (coupleName, partnerNames, avatars) => {
    const couple = await db.createCouple(coupleName);
    const p1 = await db.createProfile(couple.id, partnerNames[0], avatars[0]);
    const p2 = await db.createProfile(couple.id, partnerNames[1], avatars[1]);
    set({
      couple,
      profiles: [p1, p2],
      currentProfileId: p1.id,
      isSetupComplete: true,
    });
  },

  loadData: async () => {
    const { couple, currentProfileId } = get();
    if (!couple) return;

    const [tasks, weeklyPoints, teamWeeklyPoints, completedThisWeek, wishes] =
      await Promise.all([
        db.getTasks(couple.id),
        db.getWeeklyPoints(couple.id),
        db.getTeamWeeklyPoints(couple.id),
        db.getCompletedTasksThisWeek(couple.id),
        db.getWishes(couple.id),
      ]);

    const allBadges: Badge[] = [];
    for (const profile of get().profiles) {
      const profileBadges = await db.getBadges(profile.id);
      allBadges.push(...profileBadges);
    }

    set({ tasks, weeklyPoints, teamWeeklyPoints, completedThisWeek, wishes, badges: allBadges });
  },

  switchProfile: (profileId) => set({ currentProfileId: profileId }),

  addTask: async (params) => {
    const { couple, currentProfileId } = get();
    if (!couple || !currentProfileId) return;
    await db.createTask({
      coupleId: couple.id,
      createdBy: currentProfileId,
      ...params,
    });
    await get().loadData();
  },

  completeTask: async (taskId) => {
    const { currentProfileId, couple, tasks } = get();
    if (!currentProfileId || !couple) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await db.completeTask(taskId, currentProfileId);

    if (couple.pointsEnabled) {
      await db.addPoints({
        coupleId: couple.id,
        profileId: currentProfileId,
        taskId,
        points: task.pointsValue,
      });
    }

    await get().loadData();
    await get().checkAndAwardBadges();
  },

  uncompleteTask: async (taskId) => {
    await db.uncompleteTask(taskId);
    await get().loadData();
  },

  removeTask: async (taskId) => {
    await db.deleteTask(taskId);
    await get().loadData();
  },

  togglePoints: async (enabled) => {
    const { couple } = get();
    if (!couple) return;
    await db.togglePointsEnabled(couple.id, enabled);
    set({ couple: { ...couple, pointsEnabled: enabled } });
  },

  addWish: async (title, description) => {
    const { couple, currentProfileId } = get();
    if (!couple || !currentProfileId) return;
    await db.createWish({
      profileId: currentProfileId,
      coupleId: couple.id,
      title,
      description,
    });
    await get().loadData();
  },

  removeWish: async (wishId) => {
    await db.deleteWish(wishId);
    await get().loadData();
  },

  checkAndAwardBadges: async () => {
    const { currentProfileId, badges } = get();
    if (!currentProfileId) return;

    const earnedTypes = new Set(
      badges.filter((b) => b.profileId === currentProfileId).map((b) => b.badgeType)
    );

    for (const [badgeType, definition] of Object.entries(BADGE_DEFINITIONS)) {
      if (earnedTypes.has(badgeType)) continue;

      if (definition.category) {
        const count = await db.getCompletedCountByCategory(currentProfileId, definition.category);
        if (count >= definition.threshold) {
          await db.awardBadge(currentProfileId, badgeType);
        }
      } else if (badgeType === "team_player") {
        const count = await db.getTotalCompletedCount(currentProfileId);
        if (count >= definition.threshold) {
          await db.awardBadge(currentProfileId, badgeType);
        }
      }
    }

    // Reload badges
    const allBadges: Badge[] = [];
    for (const profile of get().profiles) {
      const profileBadges = await db.getBadges(profile.id);
      allBadges.push(...profileBadges);
    }
    set({ badges: allBadges });
  },
}));

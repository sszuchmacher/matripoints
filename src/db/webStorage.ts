/**
 * localStorage-backed storage for web platform.
 * Mirrors the same function signatures as database.ts.
 */
import type { Task, Profile, Couple, Badge, Wish, TaskCategory, Recurrence } from "../types";

const KEY = "matripoints_store";

interface Store {
  couple: Couple | null;
  profiles: Profile[];
  tasks: Task[];
  pointsLog: { id: string; coupleId: string; profileId: string; taskId: string; points: number; createdAt: string }[];
  badges: Badge[];
  wishes: Wish[];
}

function load(): Store {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return { couple: null, profiles: [], tasks: [], pointsLog: [], badges: [], wishes: [] };
}

function save(s: Store) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function weekAgo() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export async function createCouple(name: string): Promise<Couple> {
  const s = load();
  const couple: Couple = {
    id: uuid(),
    name,
    inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    pointsEnabled: true,
    createdAt: new Date().toISOString(),
  };
  s.couple = couple;
  save(s);
  return couple;
}

export async function getCouple(id: string): Promise<Couple | null> {
  const s = load();
  return s.couple?.id === id ? s.couple : null;
}

export async function togglePointsEnabled(coupleId: string, enabled: boolean) {
  const s = load();
  if (s.couple?.id === coupleId) { s.couple.pointsEnabled = enabled; save(s); }
}

export async function createProfile(coupleId: string, displayName: string, avatarEmoji = "😊"): Promise<Profile> {
  const s = load();
  const profile: Profile = { id: uuid(), coupleId, displayName, avatarEmoji, createdAt: new Date().toISOString() };
  s.profiles.push(profile);
  save(s);
  return profile;
}

export async function getProfiles(coupleId: string): Promise<Profile[]> {
  return load().profiles.filter((p) => p.coupleId === coupleId);
}

export async function createTask(params: {
  coupleId: string; title: string; category: TaskCategory; assignedTo: string | null;
  isRecurring: boolean; recurrence: Recurrence; pointsValue: number; createdBy: string;
}): Promise<Task> {
  const s = load();
  const task: Task = { id: uuid(), ...params, completedBy: null, completedAt: null, createdAt: new Date().toISOString() };
  s.tasks.push(task);
  save(s);
  return task;
}

export async function getTasks(coupleId: string): Promise<Task[]> {
  return load().tasks.filter((t) => t.coupleId === coupleId).reverse();
}

export async function getIncompleteTasks(coupleId: string): Promise<Task[]> {
  return load().tasks.filter((t) => t.coupleId === coupleId && !t.completedAt).reverse();
}

export async function completeTask(taskId: string, completedBy: string): Promise<void> {
  const s = load();
  const t = s.tasks.find((t) => t.id === taskId);
  if (t) { t.completedBy = completedBy; t.completedAt = new Date().toISOString(); save(s); }
}

export async function uncompleteTask(taskId: string): Promise<void> {
  const s = load();
  const t = s.tasks.find((t) => t.id === taskId);
  if (t) { t.completedBy = null; t.completedAt = null; save(s); }
}

export async function deleteTask(taskId: string): Promise<void> {
  const s = load();
  s.tasks = s.tasks.filter((t) => t.id !== taskId);
  save(s);
}

export async function addPoints(params: {
  coupleId: string; profileId: string; taskId: string; points: number;
}): Promise<void> {
  const s = load();
  s.pointsLog.push({ id: uuid(), ...params, createdAt: new Date().toISOString() });
  save(s);
}

export async function getWeeklyPoints(coupleId: string): Promise<{ profileId: string; total: number }[]> {
  const since = weekAgo();
  const map: Record<string, number> = {};
  for (const p of load().pointsLog.filter((p) => p.coupleId === coupleId && p.createdAt >= since)) {
    map[p.profileId] = (map[p.profileId] ?? 0) + p.points;
  }
  return Object.entries(map).map(([profileId, total]) => ({ profileId, total }));
}

export async function getTotalPoints(profileId: string): Promise<number> {
  return load().pointsLog.filter((p) => p.profileId === profileId).reduce((s, p) => s + p.points, 0);
}

export async function getTeamWeeklyPoints(coupleId: string): Promise<number> {
  const since = weekAgo();
  return load().pointsLog.filter((p) => p.coupleId === coupleId && p.createdAt >= since).reduce((s, p) => s + p.points, 0);
}

export async function getCompletedTasksThisWeek(coupleId: string): Promise<number> {
  const since = weekAgo();
  return load().tasks.filter((t) => t.coupleId === coupleId && t.completedAt && t.completedAt >= since).length;
}

export async function getCompletedTasksTodayByProfile(coupleId: string): Promise<{ profileId: string; count: number }[]> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();
  const map: Record<string, number> = {};
  for (const t of load().tasks.filter((t) => t.coupleId === coupleId && t.completedAt && t.completedAt >= todayStr && t.completedBy)) {
    map[t.completedBy!] = (map[t.completedBy!] ?? 0) + 1;
  }
  return Object.entries(map).map(([profileId, count]) => ({ profileId, count }));
}

export async function getBadges(profileId: string): Promise<Badge[]> {
  return load().badges.filter((b) => b.profileId === profileId);
}

export async function awardBadge(profileId: string, badgeType: string): Promise<void> {
  const s = load();
  if (s.badges.some((b) => b.profileId === profileId && b.badgeType === badgeType)) return;
  s.badges.push({ id: uuid(), profileId, badgeType, earnedAt: new Date().toISOString() });
  save(s);
}

export async function getCompletedCountByCategory(profileId: string, category: TaskCategory): Promise<number> {
  return load().tasks.filter((t) => t.completedBy === profileId && t.category === category && t.completedAt).length;
}

export async function getTotalCompletedCount(profileId: string): Promise<number> {
  return load().tasks.filter((t) => t.completedBy === profileId && t.completedAt).length;
}

export async function createWish(params: { profileId: string; coupleId: string; title: string; description: string }): Promise<Wish> {
  const s = load();
  const wish: Wish = { id: uuid(), ...params, createdAt: new Date().toISOString() };
  s.wishes.push(wish);
  save(s);
  return wish;
}

export async function getWishes(coupleId: string): Promise<Wish[]> {
  return load().wishes.filter((w) => w.coupleId === coupleId).reverse();
}

export async function deleteWish(wishId: string): Promise<void> {
  const s = load();
  s.wishes = s.wishes.filter((w) => w.id !== wishId);
  save(s);
}

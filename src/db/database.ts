import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import type { Task, Profile, Couple, PointsLog, Badge, Wish, TaskCategory, Recurrence } from "../types";
import * as web from "./webStorage";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === "web") return null;
  if (db) return db;
  db = await SQLite.openDatabaseAsync("matripoints.db");
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS couples (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      invite_code TEXT NOT NULL,
      points_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      couple_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar_emoji TEXT NOT NULL DEFAULT '😊',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (couple_id) REFERENCES couples(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      couple_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'chores',
      assigned_to TEXT,
      completed_by TEXT,
      completed_at TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurrence TEXT,
      points_value INTEGER NOT NULL DEFAULT 10,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (couple_id) REFERENCES couples(id),
      FOREIGN KEY (assigned_to) REFERENCES profiles(id),
      FOREIGN KEY (completed_by) REFERENCES profiles(id),
      FOREIGN KEY (created_by) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS points_log (
      id TEXT PRIMARY KEY,
      couple_id TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      points INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (couple_id) REFERENCES couples(id),
      FOREIGN KEY (profile_id) REFERENCES profiles(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      badge_type TEXT NOT NULL,
      earned_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS wishes (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      couple_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (profile_id) REFERENCES profiles(id),
      FOREIGN KEY (couple_id) REFERENCES couples(id)
    );
  `);
}

// --- Couple ---

export async function createCouple(name: string): Promise<Couple> {
  if (Platform.OS === "web") return web.createCouple(name);
  const database = await getDatabase();
  const id = Crypto.randomUUID();
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  await database.runAsync(
    "INSERT INTO couples (id, name, invite_code) VALUES (?, ?, ?)",
    [id, name, inviteCode]
  );
  return { id, name, inviteCode, pointsEnabled: true, createdAt: new Date().toISOString() };
}

export async function getCouple(id: string): Promise<Couple | null> {
  if (Platform.OS === "web") return web.getCouple(id);
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    "SELECT * FROM couples WHERE id = ?",
    [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    pointsEnabled: !!row.points_enabled,
    createdAt: row.created_at,
  };
}

export async function togglePointsEnabled(coupleId: string, enabled: boolean) {
  if (Platform.OS === "web") return web.togglePointsEnabled(coupleId, enabled);
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE couples SET points_enabled = ? WHERE id = ?",
    [enabled ? 1 : 0, coupleId]
  );
}

// --- Profile ---

export async function createProfile(
  coupleId: string,
  displayName: string,
  avatarEmoji: string = "😊"
): Promise<Profile> {
  if (Platform.OS === "web") return web.createProfile(coupleId, displayName, avatarEmoji);
  const database = await getDatabase();
  const id = Crypto.randomUUID();
  await database.runAsync(
    "INSERT INTO profiles (id, couple_id, display_name, avatar_emoji) VALUES (?, ?, ?, ?)",
    [id, coupleId, displayName, avatarEmoji]
  );
  return { id, coupleId, displayName, avatarEmoji, createdAt: new Date().toISOString() };
}

export async function getProfiles(coupleId: string): Promise<Profile[]> {
  if (Platform.OS === "web") return web.getProfiles(coupleId);
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    "SELECT * FROM profiles WHERE couple_id = ?",
    [coupleId]
  );
  return rows.map((r) => ({
    id: r.id,
    coupleId: r.couple_id,
    displayName: r.display_name,
    avatarEmoji: r.avatar_emoji,
    createdAt: r.created_at,
  }));
}

// --- Tasks ---

export async function createTask(params: {
  coupleId: string;
  title: string;
  category: TaskCategory;
  assignedTo: string | null;
  isRecurring: boolean;
  recurrence: Recurrence;
  pointsValue: number;
  createdBy: string;
}): Promise<Task> {
  if (Platform.OS === "web") return web.createTask(params);
  const database = await getDatabase();
  const id = Crypto.randomUUID();
  await database.runAsync(
    `INSERT INTO tasks (id, couple_id, title, category, assigned_to, is_recurring, recurrence, points_value, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      params.coupleId,
      params.title,
      params.category,
      params.assignedTo,
      params.isRecurring ? 1 : 0,
      params.recurrence,
      params.pointsValue,
      params.createdBy,
    ]
  );
  return {
    id,
    coupleId: params.coupleId,
    title: params.title,
    category: params.category,
    assignedTo: params.assignedTo,
    completedBy: null,
    completedAt: null,
    isRecurring: params.isRecurring,
    recurrence: params.recurrence,
    pointsValue: params.pointsValue,
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
  };
}

export async function getTasks(coupleId: string): Promise<Task[]> {
  if (Platform.OS === "web") return web.getTasks(coupleId);
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    "SELECT * FROM tasks WHERE couple_id = ? ORDER BY created_at DESC",
    [coupleId]
  );
  return rows.map(mapTask);
}

export async function getIncompleteTasks(coupleId: string): Promise<Task[]> {
  if (Platform.OS === "web") return web.getIncompleteTasks(coupleId);
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    "SELECT * FROM tasks WHERE couple_id = ? AND completed_at IS NULL ORDER BY created_at DESC",
    [coupleId]
  );
  return rows.map(mapTask);
}

export async function completeTask(taskId: string, completedBy: string): Promise<void> {
  if (Platform.OS === "web") return web.completeTask(taskId, completedBy);
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE tasks SET completed_by = ?, completed_at = datetime('now') WHERE id = ?",
    [completedBy, taskId]
  );
}

export async function deleteTask(taskId: string): Promise<void> {
  if (Platform.OS === "web") return web.deleteTask(taskId);
  const database = await getDatabase();
  await database.runAsync("DELETE FROM tasks WHERE id = ?", [taskId]);
}

export async function uncompleteTask(taskId: string): Promise<void> {
  if (Platform.OS === "web") return web.uncompleteTask(taskId);
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE tasks SET completed_by = NULL, completed_at = NULL WHERE id = ?",
    [taskId]
  );
}

function mapTask(r: any): Task {
  return {
    id: r.id,
    coupleId: r.couple_id,
    title: r.title,
    category: r.category,
    assignedTo: r.assigned_to,
    completedBy: r.completed_by,
    completedAt: r.completed_at,
    isRecurring: !!r.is_recurring,
    recurrence: r.recurrence,
    pointsValue: r.points_value,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}

// --- Points ---

export async function addPoints(params: {
  coupleId: string;
  profileId: string;
  taskId: string;
  points: number;
}): Promise<void> {
  if (Platform.OS === "web") return web.addPoints(params);
  const database = await getDatabase();
  const id = Crypto.randomUUID();
  await database.runAsync(
    "INSERT INTO points_log (id, couple_id, profile_id, task_id, points) VALUES (?, ?, ?, ?, ?)",
    [id, params.coupleId, params.profileId, params.taskId, params.points]
  );
}

export async function getWeeklyPoints(coupleId: string): Promise<{ profileId: string; total: number }[]> {
  if (Platform.OS === "web") return web.getWeeklyPoints(coupleId);
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    `SELECT profile_id, SUM(points) as total FROM points_log
     WHERE couple_id = ? AND created_at >= datetime('now', '-7 days')
     GROUP BY profile_id`,
    [coupleId]
  );
  return rows.map((r) => ({ profileId: r.profile_id, total: r.total }));
}

export async function getTotalPoints(profileId: string): Promise<number> {
  if (Platform.OS === "web") return web.getTotalPoints(profileId);
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    "SELECT COALESCE(SUM(points), 0) as total FROM points_log WHERE profile_id = ?",
    [profileId]
  );
  return row?.total ?? 0;
}

export async function getTeamWeeklyPoints(coupleId: string): Promise<number> {
  if (Platform.OS === "web") return web.getTeamWeeklyPoints(coupleId);
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    `SELECT COALESCE(SUM(points), 0) as total FROM points_log
     WHERE couple_id = ? AND created_at >= datetime('now', '-7 days')`,
    [coupleId]
  );
  return row?.total ?? 0;
}

export async function getCompletedTasksThisWeek(coupleId: string): Promise<number> {
  if (Platform.OS === "web") return web.getCompletedTasksThisWeek(coupleId);
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    `SELECT COUNT(*) as count FROM tasks
     WHERE couple_id = ? AND completed_at >= datetime('now', '-7 days')`,
    [coupleId]
  );
  return row?.count ?? 0;
}

export async function getCompletedTasksTodayByProfile(coupleId: string): Promise<{ profileId: string; count: number }[]> {
  if (Platform.OS === "web") return web.getCompletedTasksTodayByProfile(coupleId);
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    `SELECT completed_by as profile_id, COUNT(*) as count FROM tasks
     WHERE couple_id = ? AND completed_at >= datetime('now', 'start of day') AND completed_by IS NOT NULL
     GROUP BY completed_by`,
    [coupleId]
  );
  return rows.map((r) => ({ profileId: r.profile_id, count: r.count }));
}

// --- Badges ---

export async function getBadges(profileId: string): Promise<Badge[]> {
  if (Platform.OS === "web") return web.getBadges(profileId);
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    "SELECT * FROM badges WHERE profile_id = ?",
    [profileId]
  );
  return rows.map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    badgeType: r.badge_type,
    earnedAt: r.earned_at,
  }));
}

export async function awardBadge(profileId: string, badgeType: string): Promise<void> {
  if (Platform.OS === "web") return web.awardBadge(profileId, badgeType);
  const database = await getDatabase();
  const existing = await database.getFirstAsync<any>(
    "SELECT id FROM badges WHERE profile_id = ? AND badge_type = ?",
    [profileId, badgeType]
  );
  if (existing) return;
  const id = Crypto.randomUUID();
  await database.runAsync(
    "INSERT INTO badges (id, profile_id, badge_type) VALUES (?, ?, ?)",
    [id, profileId, badgeType]
  );
}

export async function getCompletedCountByCategory(
  profileId: string,
  category: TaskCategory
): Promise<number> {
  if (Platform.OS === "web") return web.getCompletedCountByCategory(profileId, category);
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    `SELECT COUNT(*) as count FROM tasks
     WHERE completed_by = ? AND category = ? AND completed_at IS NOT NULL`,
    [profileId, category]
  );
  return row?.count ?? 0;
}

export async function getTotalCompletedCount(profileId: string): Promise<number> {
  if (Platform.OS === "web") return web.getTotalCompletedCount(profileId);
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    "SELECT COUNT(*) as count FROM tasks WHERE completed_by = ? AND completed_at IS NOT NULL",
    [profileId]
  );
  return row?.count ?? 0;
}

// --- Wishes ---

export async function createWish(params: {
  profileId: string;
  coupleId: string;
  title: string;
  description: string;
}): Promise<Wish> {
  if (Platform.OS === "web") return web.createWish(params);
  const database = await getDatabase();
  const id = Crypto.randomUUID();
  await database.runAsync(
    "INSERT INTO wishes (id, profile_id, couple_id, title, description) VALUES (?, ?, ?, ?, ?)",
    [id, params.profileId, params.coupleId, params.title, params.description]
  );
  return {
    id,
    profileId: params.profileId,
    coupleId: params.coupleId,
    title: params.title,
    description: params.description,
    createdAt: new Date().toISOString(),
  };
}

export async function getWishes(coupleId: string): Promise<Wish[]> {
  if (Platform.OS === "web") return web.getWishes(coupleId);
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    "SELECT * FROM wishes WHERE couple_id = ? ORDER BY created_at DESC",
    [coupleId]
  );
  return rows.map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    coupleId: r.couple_id,
    title: r.title,
    description: r.description,
    createdAt: r.created_at,
  }));
}

export async function deleteWish(wishId: string): Promise<void> {
  if (Platform.OS === "web") return web.deleteWish(wishId);
  const database = await getDatabase();
  await database.runAsync("DELETE FROM wishes WHERE id = ?", [wishId]);
}

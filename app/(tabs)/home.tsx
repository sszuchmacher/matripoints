import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useStore } from "../../src/store/useStore";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/constants/theme";

export default function HomeScreen() {
  const couple = useStore((s) => s.couple);
  const profiles = useStore((s) => s.profiles);
  const currentProfileId = useStore((s) => s.currentProfileId);
  const tasks = useStore((s) => s.tasks);
  const teamWeeklyPoints = useStore((s) => s.teamWeeklyPoints);
  const weeklyPoints = useStore((s) => s.weeklyPoints);
  const completedThisWeek = useStore((s) => s.completedThisWeek);
  const loadData = useStore((s) => s.loadData);
  const switchProfile = useStore((s) => s.switchProfile);

  const currentProfile = profiles.find((p) => p.id === currentProfileId);
  const partnerProfile = profiles.find((p) => p.id !== currentProfileId);

  const todayTasks = tasks.filter((t) => !t.completedAt);
  const completedToday = tasks.filter(
    (t) =>
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
  );

  const partnerCompletedToday = completedToday.filter(
    (t) => t.completedBy === partnerProfile?.id
  ).length;

  useEffect(() => {
    loadData();
  }, []);

  if (!couple || !currentProfile) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey {currentProfile.displayName} {currentProfile.avatarEmoji}</Text>
            <Text style={styles.teamName}>{couple.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              if (partnerProfile) {
                switchProfile(partnerProfile.id);
              }
            }}
          >
            <Text style={styles.switchEmoji}>{partnerProfile?.avatarEmoji}</Text>
            <Text style={styles.switchLabel}>Switch</Text>
          </TouchableOpacity>
        </View>

        {/* Team Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>This Week Together</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedThisWeek}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            {couple.pointsEnabled && (
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{teamWeeklyPoints}</Text>
                <Text style={styles.statLabel}>Team Points</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayTasks.length}</Text>
              <Text style={styles.statLabel}>To Do</Text>
            </View>
          </View>
        </View>

        {/* Gratitude Nudge */}
        {partnerCompletedToday > 0 && partnerProfile && (
          <View style={styles.gratitudeCard}>
            <Text style={styles.gratitudeEmoji}>💛</Text>
            <Text style={styles.gratitudeText}>
              {partnerProfile.displayName} completed {partnerCompletedToday} task
              {partnerCompletedToday !== 1 ? "s" : ""} today — say thanks!
            </Text>
          </View>
        )}

        {/* Today's Tasks Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Up Next</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/tasks")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {todayTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>All caught up! Nice teamwork.</Text>
            </View>
          ) : (
            todayTasks.slice(0, 5).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskPreview}
                onPress={() => router.push("/(tabs)/tasks")}
              >
                <View style={styles.taskDot} />
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                {task.assignedTo && (
                  <Text style={styles.taskAssignee}>
                    {profiles.find((p) => p.id === task.assignedTo)?.avatarEmoji}
                  </Text>
                )}
                {couple.pointsEnabled && (
                  <Text style={styles.taskPoints}>+{task.pointsValue}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Weekly Individual Points */}
        {couple.pointsEnabled && weeklyPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Scores</Text>
            <View style={styles.scoresRow}>
              {profiles.map((profile) => {
                const pts =
                  weeklyPoints.find((w) => w.profileId === profile.id)?.total ?? 0;
                return (
                  <View key={profile.id} style={styles.scoreCard}>
                    <Text style={styles.scoreEmoji}>{profile.avatarEmoji}</Text>
                    <Text style={styles.scoreName}>{profile.displayName}</Text>
                    <Text style={styles.scorePoints}>{pts} pts</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  teamName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switchButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  switchEmoji: {
    fontSize: 24,
  },
  switchLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statsTitle: {
    fontSize: FontSize.sm,
    color: Colors.white + "CC",
    fontWeight: "600",
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.white,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.white + "BB",
    marginTop: 2,
  },
  gratitudeCard: {
    backgroundColor: "#FFF8E7",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#FFEAA7",
  },
  gratitudeEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  gratitudeText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  taskPreview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  taskAssignee: {
    fontSize: 18,
    marginLeft: Spacing.sm,
  },
  taskPoints: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  scoresRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  scoreEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  scoreName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  scorePoints: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.primary,
  },
});

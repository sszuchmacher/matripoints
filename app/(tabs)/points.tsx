import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../../src/store/useStore";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/constants/theme";
import { BADGE_DEFINITIONS } from "../../src/types";
import { useState } from "react";

export default function PointsScreen() {
  const couple = useStore((s) => s.couple);
  const profiles = useStore((s) => s.profiles);
  const currentProfileId = useStore((s) => s.currentProfileId);
  const weeklyPoints = useStore((s) => s.weeklyPoints);
  const teamWeeklyPoints = useStore((s) => s.teamWeeklyPoints);
  const badges = useStore((s) => s.badges);
  const wishes = useStore((s) => s.wishes);
  const loadData = useStore((s) => s.loadData);
  const addWish = useStore((s) => s.addWish);
  const removeWish = useStore((s) => s.removeWish);

  const [showWishInput, setShowWishInput] = useState(false);
  const [wishTitle, setWishTitle] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWish = async () => {
    if (!wishTitle.trim()) return;
    await addWish(wishTitle.trim(), "");
    setWishTitle("");
    setShowWishInput(false);
  };

  if (!couple) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} />}
      >
        <Text style={styles.title}>Points</Text>

        {/* Team Score - BIG */}
        <View style={styles.teamCard}>
          <Text style={styles.teamLabel}>TEAM SCORE THIS WEEK</Text>
          <Text style={styles.teamScore}>{teamWeeklyPoints}</Text>
          <Text style={styles.teamSubtext}>points together</Text>
        </View>

        {/* Individual Scores */}
        <View style={styles.scoresRow}>
          {profiles.map((profile) => {
            const pts =
              weeklyPoints.find((w) => w.profileId === profile.id)?.total ?? 0;
            return (
              <View key={profile.id} style={styles.individualCard}>
                <Text style={styles.individualEmoji}>{profile.avatarEmoji}</Text>
                <Text style={styles.individualName}>{profile.displayName}</Text>
                <Text style={styles.individualPoints}>{pts}</Text>
                <Text style={styles.individualLabel}>pts this week</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.weeklyNote}>Scores reset every week — fresh start!</Text>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgeGrid}>
            {Object.entries(BADGE_DEFINITIONS).map(([type, def]) => {
              const earned = badges.some(
                (b) => b.badgeType === type && b.profileId === currentProfileId
              );
              return (
                <View
                  key={type}
                  style={[styles.badgeCard, !earned && styles.badgeLocked]}
                >
                  <Text style={styles.badgeEmoji}>
                    {earned ? def.emoji : "🔒"}
                  </Text>
                  <Text
                    style={[
                      styles.badgeTitle,
                      !earned && styles.badgeLockedText,
                    ]}
                  >
                    {def.title}
                  </Text>
                  <Text style={styles.badgeDesc}>{def.description}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Wish Lists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wish List</Text>
            <TouchableOpacity onPress={() => setShowWishInput(!showWishInput)}>
              <Ionicons
                name={showWishInput ? "close" : "add-circle"}
                size={28}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.wishHint}>
            Things you'd love to do — use your points as conversation starters!
          </Text>

          {showWishInput && (
            <View style={styles.wishInputRow}>
              <TextInput
                style={styles.wishInput}
                placeholder="e.g. Gaming night, Spa day..."
                value={wishTitle}
                onChangeText={setWishTitle}
                onSubmitEditing={handleAddWish}
                autoFocus
                placeholderTextColor={Colors.textLight}
              />
              <TouchableOpacity style={styles.wishAddBtn} onPress={handleAddWish}>
                <Text style={styles.wishAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {wishes.length === 0 && !showWishInput ? (
            <View style={styles.emptyWishes}>
              <Text style={styles.emptyText}>
                No wishes yet — add something fun!
              </Text>
            </View>
          ) : (
            wishes.map((wish) => {
              const owner = profiles.find((p) => p.id === wish.profileId);
              return (
                <View key={wish.id} style={styles.wishCard}>
                  <Text style={styles.wishEmoji}>{owner?.avatarEmoji ?? "✨"}</Text>
                  <View style={styles.wishContent}>
                    <Text style={styles.wishTitle}>{wish.title}</Text>
                    <Text style={styles.wishOwner}>
                      {owner?.displayName}'s wish
                    </Text>
                  </View>
                  {wish.profileId === currentProfileId && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert("Remove Wish", "Remove this wish?", [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Remove",
                            style: "destructive",
                            onPress: () => removeWish(wish.id),
                          },
                        ])
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={Colors.textLight}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
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
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  teamCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  teamLabel: {
    fontSize: FontSize.xs,
    color: Colors.white + "BB",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  teamScore: {
    fontSize: FontSize.hero,
    fontWeight: "800",
    color: Colors.white,
  },
  teamSubtext: {
    fontSize: FontSize.sm,
    color: Colors.white + "CC",
    marginTop: 4,
  },
  scoresRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  individualCard: {
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
  individualEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  individualName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  individualPoints: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.primary,
  },
  individualLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  weeklyNote: {
    textAlign: "center",
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
    fontStyle: "italic",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  badgeCard: {
    width: "47%",
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
  badgeLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  badgeTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  badgeLockedText: {
    color: Colors.textLight,
  },
  badgeDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  wishHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontStyle: "italic",
  },
  wishInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  wishInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  wishAddBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
  },
  wishAddText: {
    color: Colors.white,
    fontWeight: "600",
  },
  emptyWishes: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  wishCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
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
  wishEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  wishContent: {
    flex: 1,
  },
  wishTitle: {
    fontSize: FontSize.md,
    fontWeight: "500",
    color: Colors.text,
  },
  wishOwner: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

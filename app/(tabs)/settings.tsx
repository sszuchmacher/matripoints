import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../src/store/useStore";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/constants/theme";

export default function SettingsScreen() {
  const couple = useStore((s) => s.couple);
  const profiles = useStore((s) => s.profiles);
  const currentProfileId = useStore((s) => s.currentProfileId);
  const switchProfile = useStore((s) => s.switchProfile);
  const togglePoints = useStore((s) => s.togglePoints);

  const currentProfile = profiles.find((p) => p.id === currentProfileId);

  if (!couple || !currentProfile) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profileCard}>
            <Text style={styles.profileEmoji}>{currentProfile.avatarEmoji}</Text>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentProfile.displayName}</Text>
              <Text style={styles.profileTeam}>{couple.name}</Text>
            </View>
          </View>
        </View>

        {/* Switch Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Profile</Text>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={[
                styles.profileOption,
                profile.id === currentProfileId && styles.profileOptionActive,
              ]}
              onPress={() => switchProfile(profile.id)}
            >
              <Text style={styles.profileOptionEmoji}>{profile.avatarEmoji}</Text>
              <Text style={styles.profileOptionName}>{profile.displayName}</Text>
              {profile.id === currentProfileId && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Couple Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Couple Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Matripoints</Text>
              <Text style={styles.settingDesc}>
                Enable the points and gamification layer
              </Text>
            </View>
            <Switch
              value={couple.pointsEnabled}
              onValueChange={togglePoints}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={couple.pointsEnabled ? Colors.primary : Colors.textLight}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Invite Code</Text>
              <Text style={styles.settingDesc}>
                Share this code with your partner
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Invite Code", couple.inviteCode, [{ text: "OK" }])
              }
            >
              <Text style={styles.inviteCode}>{couple.inviteCode}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutEmoji}>💜</Text>
            <Text style={styles.aboutName}>Matripoints</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutTagline}>
              Your couple's life, organized together
            </Text>
          </View>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  profileEmoji: {
    fontSize: 48,
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  profileTeam: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileOption: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  profileOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + "15",
  },
  profileOptionEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  profileOptionName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: "500",
    color: Colors.text,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  settingRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSize.md,
    fontWeight: "500",
    color: Colors.text,
  },
  settingDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inviteCode: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 2,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  aboutEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  aboutName: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.primary,
  },
  aboutVersion: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  aboutTagline: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    fontStyle: "italic",
  },
});

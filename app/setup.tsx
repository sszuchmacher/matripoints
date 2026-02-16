import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useStore } from "../src/store/useStore";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/constants/theme";

const AVATAR_OPTIONS = ["😊", "😎", "🥰", "🤗", "😄", "🌟", "💜", "🔥", "🌈", "🎯", "🦋", "🐱"];

export default function SetupScreen() {
  const setupCouple = useStore((s) => s.setupCouple);
  const [step, setStep] = useState(0);
  const [coupleName, setCoupleName] = useState("");
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [partner1Avatar, setPartner1Avatar] = useState("😊");
  const [partner2Avatar, setPartner2Avatar] = useState("😎");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!partner1Name.trim() || !partner2Name.trim()) return;
    setLoading(true);
    await setupCouple(
      coupleName.trim() || `${partner1Name} & ${partner2Name}`,
      [partner1Name.trim(), partner2Name.trim()],
      [partner1Avatar, partner2Avatar]
    );
    await useStore.getState().loadData();
    setLoading(false);
    router.replace("/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>💜</Text>
        <Text style={styles.title}>Matripoints</Text>
        <Text style={styles.subtitle}>Your couple's life, organized together</Text>

        {step === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What should we call your team?</Text>
            <Text style={styles.cardHint}>Optional — we'll use your names if you skip this</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. The Smiths, Team Awesome"
              value={coupleName}
              onChangeText={setCoupleName}
              placeholderTextColor={Colors.textLight}
            />
            <TouchableOpacity style={styles.button} onPress={() => setStep(1)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Partner 1</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={partner1Name}
              onChangeText={setPartner1Name}
              placeholderTextColor={Colors.textLight}
              autoFocus
            />
            <Text style={styles.avatarLabel}>Pick an avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.avatarOption,
                    partner1Avatar === emoji && styles.avatarSelected,
                  ]}
                  onPress={() => setPartner1Avatar(emoji)}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, !partner1Name.trim() && styles.buttonDisabled]}
              onPress={() => partner1Name.trim() && setStep(2)}
              disabled={!partner1Name.trim()}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Partner 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={partner2Name}
              onChangeText={setPartner2Name}
              placeholderTextColor={Colors.textLight}
              autoFocus
            />
            <Text style={styles.avatarLabel}>Pick an avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.avatarOption,
                    partner2Avatar === emoji && styles.avatarSelected,
                  ]}
                  onPress={() => setPartner2Avatar(emoji)}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, !partner2Name.trim() && styles.buttonDisabled]}
              onPress={handleFinish}
              disabled={!partner2Name.trim() || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Setting up..." : "Let's go!"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, step === i && styles.dotActive]}
            />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  logo: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: "center",
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
  },
  avatarLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + "20",
  },
  avatarEmoji: {
    fontSize: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});

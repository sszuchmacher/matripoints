import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useStore } from "../src/store/useStore";
import { getDatabase } from "../src/db/database";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      setDbReady(true);
    } else {
      getDatabase().then(() => setDbReady(true));
    }
  }, []);

  if (!dbReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="setup" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}

import { Redirect } from "expo-router";
import { useStore } from "../src/store/useStore";

export default function Index() {
  const isSetupComplete = useStore((s) => s.isSetupComplete);

  if (!isSetupComplete) {
    return <Redirect href="/setup" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

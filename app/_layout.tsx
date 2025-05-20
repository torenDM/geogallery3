import { Stack } from "expo-router";
import { PointsProvider } from "@/contexts/PointsContext";

export default function Layout() {
  return (
    <PointsProvider>
      <Stack />
    </PointsProvider>
  );
}

import { Stack } from "expo-router";
import { DatabaseProvider } from "@/contexts/DatabaseContext";

// Главный layout приложения: оборачивает все в DatabaseProvider для доступа к БД
export default function Layout() {
  return (
    <DatabaseProvider>
      <Stack />
    </DatabaseProvider>
  );
}

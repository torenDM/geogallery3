import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import { Stack } from "expo-router";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { UserLocationProvider } from "@/contexts/UserLocationContext"; // Новый импорт
import React from "react";

// Главный layout приложения: теперь c UserLocationProvider
export default function Layout() {
  return (
    <DatabaseProvider>
      <UserLocationProvider>
        <Stack />
      </UserLocationProvider>
    </DatabaseProvider>
  );
}
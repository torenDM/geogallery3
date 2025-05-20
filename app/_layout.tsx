import { Stack } from "expo-router";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import React from "react";

// Главный layout приложения: оборачивает все в DatabaseProvider для доступа к БД
export default function Layout() {
  // Оборачиваем всё приложение в провайдер базы данных
  return (
    <DatabaseProvider>
      <Stack />
    </DatabaseProvider>
  );
}

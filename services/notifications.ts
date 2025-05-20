import * as Notifications from "expo-notifications";
import { Marker } from "@/types";

// Активные уведомления для избежания дублей
type ActiveNotifications = Map<number, string>;

export class NotificationManager {
  private active: ActiveNotifications = new Map();

  /**
   * Запрашивает разрешение на уведомления
   */
  async requestPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  /**
   * Отправляет уведомление о приближении к маркеру
   */
  async showNotification(marker: Marker) {
    if (this.active.has(marker.id)) return; // Уже есть уведомление для этой точки

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Вы рядом с точкой!",
        body: marker.label ? `Точка: ${marker.label}` : "Неизвестная точка",
      },
      trigger: null,
    });
    this.active.set(marker.id, id);
  }

  /**
   * Удаляет уведомление для маркера (если пользователь ушёл из зоны)
   */
  async removeNotification(markerId: number) {
    const notifId = this.active.get(markerId);
    if (notifId) {
      await Notifications.cancelScheduledNotificationAsync(notifId);
      this.active.delete(markerId);
    }
  }

  /**
   * Проверяет, есть ли уже уведомление для точки
   */
  hasNotification(markerId: number): boolean {
    return this.active.has(markerId);
  }

  /**
   * Очищает все активные уведомления
   */
  async clearAll() {
    for (const id of this.active.values()) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    this.active.clear();
  }
}

export const notificationManager = new NotificationManager();

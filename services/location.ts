import * as Location from "expo-location";
import { Platform } from "react-native";

/**
 * Запрашивает разрешение на геолокацию
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/**
 * Получает текущее местоположение пользователя
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  const granted = await requestLocationPermissions();
  if (!granted) return null;
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Platform.OS === "ios" ? Location.Accuracy.Balanced : Location.Accuracy.High
    });
  } catch {
    return null;
  }
}

/**
 * Подписывается на обновления геопозиции пользователя
 */
export async function watchPosition(
  onLocation: (location: Location.LocationObject) => void
): Promise<Location.LocationSubscription | null> {
  const granted = await requestLocationPermissions();
  if (!granted) return null;
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 5
    },
    onLocation
  );
}

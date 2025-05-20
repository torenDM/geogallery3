import React, { useState, useEffect, useRef } from "react";
import { View, Modal, TextInput, Button, Platform, Text, StyleSheet, TouchableOpacity, AppState } from "react-native";
import MapViewWrapper from "@/components/MapViewWrapper";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getCurrentLocation, watchPosition } from "@/services/location";
import { notificationManager } from "@/services/notifications";
import { calculateDistance } from "@/utils/geo";
import { PROXIMITY_THRESHOLD, UserLocation } from "@/types";
import * as Notifications from "expo-notifications";

const COLORS = ["#1976d2", "#388e3c", "#d32f2f", "#fbc02d", "#7b1fa2"];
const DEFAULT_ANDROID_COLOR = "#1976d2";

const DEFAULT_REGION = {
  latitude: 58.007468,
  longitude: 56.187654,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};


const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Тестовое уведомление",
      body: "Это проверка уведомлений в GeoGallery!",
    },
    trigger: null,
  });
};

export default function IndexScreen() {
  const { markers, addMarker, reloadMarkers } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputLabel, setInputLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);

  // --- Геолокация
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const locationSub = useRef<any>(null);

  // --- Чтение позиции из параметров роутера (для возврата после удаления)
  const params = useLocalSearchParams<{
    lat?: string; lng?: string; latDelta?: string; lngDelta?: string;
  }>();
  const initialRegion = {
    latitude: params.lat ? parseFloat(params.lat) : mapRegion.latitude,
    longitude: params.lng ? parseFloat(params.lng) : mapRegion.longitude,
    latitudeDelta: params.latDelta ? parseFloat(params.latDelta) : mapRegion.latitudeDelta,
    longitudeDelta: params.lngDelta ? parseFloat(params.lngDelta) : mapRegion.longitudeDelta,
  };

  useEffect(() => {
    setMapRegion(initialRegion);
    // eslint-disable-next-line
  }, [params.lat, params.lng, params.latDelta, params.lngDelta]);

  const router = useRouter();

  // --- Переход на экран маркера с передачей региона
  const handlePointPress = (id: number) => {
    router.push({
      pathname: `/marker/${id}`,
      params: {
        lat: mapRegion.latitude.toString(),
        lng: mapRegion.longitude.toString(),
        latDelta: mapRegion.latitudeDelta.toString(),
        lngDelta: mapRegion.longitudeDelta.toString(),
      }
    });
  };

  // --- Добавление маркера
  const handleLongPress = (lat: number, lng: number) => {
    setNewCoords({ lat, lng });
    setModalVisible(true);
  };

  const handleAddPoint = async () => {
    if (newCoords) {
      const labelValue = inputLabel.trim() === "" ? "Без названия" : inputLabel;
      await addMarker(
        newCoords.lat,
        newCoords.lng,
        labelValue,
        Platform.OS === "android" ? DEFAULT_ANDROID_COLOR : selectedColor
      );
      setModalVisible(false);
      setNewCoords(null);
      setInputLabel("");
      setSelectedColor(COLORS[0]);
      reloadMarkers();
    }
  };

  // --- Геолокация: следим за позицией пользователя
  useEffect(() => {
    let sub: any;
    let isMounted = true;

    async function subscribeLocation() {
      await notificationManager.requestPermission();
      sub = await watchPosition(location => {
        if (!isMounted) return;
        const { latitude, longitude, accuracy } = location.coords;
        const timestamp = location.timestamp;
        setUserLocation({ latitude, longitude, accuracy, timestamp });

        // Проверяем расстояние до каждой точки и отправляем уведомления
        markers.forEach(marker => {
          const distance = calculateDistance(
            latitude,
            longitude,
            marker.latitude,
            marker.longitude
          );
          if (distance <= PROXIMITY_THRESHOLD) {
            notificationManager.showNotification(marker);
          } else {
            notificationManager.removeNotification(marker.id);
          }
        });
      });
    }
    subscribeLocation();

    return () => {
      isMounted = false;
      if (sub) sub.remove();
      notificationManager.clearAll();
    };
    // markers в зависимости чтобы реагировать на обновление точек
    // eslint-disable-next-line
  }, [markers.length]);

  // Если приложение свернули/развернули — очищаем уведомления
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state !== "active") notificationManager.clearAll();
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapViewWrapper
        points={markers}
        onLongPress={handleLongPress}
        onPointPress={handlePointPress}
        initialRegion={initialRegion}
        onRegionChange={region => setMapRegion(region)}
        userLocation={userLocation}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Новая точка</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Название точки"
              placeholderTextColor="#333"
              value={inputLabel}
              onChangeText={setInputLabel}
            />
            {Platform.OS === "ios" && (
              <View style={modalStyles.colorsRow}>
                {COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      modalStyles.colorCircle,
                      { backgroundColor: color, borderWidth: selectedColor === color ? 3 : 1, borderColor: selectedColor === color ? "#333" : "#aaa" }
                    ]}
                  />
                ))}
              </View>
            )}
            <View style={modalStyles.buttonRow}>
              <Button title="Отмена" color="gray" onPress={() => setModalVisible(false)} />
              <Button title="Сохранить" onPress={handleAddPoint} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 14,
    width: "80%",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 14, textAlign: "center" },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 7,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#111"
  },
  colorsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 6,
    marginVertical: 4,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
});

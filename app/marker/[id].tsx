import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Modal, Image, TouchableWithoutFeedback, ScrollView, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDatabase } from "@/contexts/DatabaseContext";
import PhotoList from "@/components/PhotoList";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Marker, MarkerImage } from "@/types";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { calculateDistance } from "@/utils/geo";
import * as Notifications from "expo-notifications";

// --- Читаем регион из params, чтобы потом передать обратно
type RegionParams = {
  lat?: string;
  lng?: string;
  latDelta?: string;
  lngDelta?: string;
};

// Экран подробностей маркера (фото, инфо, удаление)
export default function MarkerScreen() {
  const { id, lat, lng, latDelta, lngDelta } = useLocalSearchParams<RegionParams & { id: string }>();
  const router = useRouter();
  const { markers, addImage, getMarkerImages, deleteImage, deleteMarker } = useDatabase();
  const insets = useSafeAreaInsets();
  const marker = markers.find(p => p.id === Number(id));

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [images, setImages] = useState<MarkerImage[]>([]);

  // Геолокация пользователя из контекста
  const userLocation = useUserLocation();

  // Загрузка изображений маркера при открытии экрана
  useEffect(() => {
    if (id) {
      getMarkerImages(Number(id))
        .then(setImages)
        .catch(() => {
          Alert.alert(
            "Ошибка загрузки",
            "Не удалось загрузить изображения для этой точки."
          );
        });
    }
  }, [id]);

  // Добавление фото к маркеру
  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        const img = await addImage(Number(id), result.assets[0].uri);
        if (img) setImages(prev => [...prev, img]);
        else throw new Error();
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось выбрать или добавить изображение. Проверьте разрешения.");
    }
  };

  // Удаление фото
  const handleDeletePhoto = async (photoId: number) => {
    try {
      await deleteImage(photoId);
      setImages(prev => prev.filter((p) => p.id !== photoId));
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось удалить изображение.");
    }
  };

  // --- Обработчик удаления маркера с передачей позиции карты
  const handleDeleteMarker = async () => {
    Alert.alert(
      "Удалить точку",
      "Удалить этот маркер и все связанные с ним изображения?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMarker(marker.id);
              router.replace({
                pathname: "/",
                params: {
                  lat: lat ?? "",
                  lng: lng ?? "",
                  latDelta: latDelta ?? "",
                  lngDelta: lngDelta ?? ""
                }
              });
            } catch (error) {
              Alert.alert("Ошибка", "Не удалось удалить маркер. Попробуйте еще раз.");
            }
          }
        }
      ]
    );
  };

  // Кнопка для отправки тестового уведомления
  const handleTestNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const request = await Notifications.requestPermissionsAsync();
        if (request.status !== 'granted') {
          Alert.alert(
            "Уведомления отключены",
            "Не удалось отправить уведомление. Проверьте настройки уведомлений на устройстве."
          );
          return;
        }
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Тестовое уведомление",
          body: marker?.label ? `Проверка для точки: ${marker.label}` : "Это проверка уведомлений в GeoGallery!",
        },
        trigger: null, // отправить сразу
      });
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось отправить уведомление.");
    }
  };

  // Если маркер не найден (например, был удалён)
  if (!marker) {
    return (
      <View style={styles.center}>
        <Text>Точка не найдена</Text>
        <Button title="Назад к карте" onPress={() => router.back()} />
      </View>
    );
  }

  // --- Расчёт расстояния до точки ---
  let distanceText = "";
  if (userLocation && marker) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      marker.latitude,
      marker.longitude
    );
    distanceText =
      distance < 1000
        ? `Расстояние: ${distance.toFixed(1)} м`
        : `Расстояние: ${(distance / 1000).toFixed(2)} км`;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.title}>{marker.label}</Text>
        <Text style={styles.coords}>
          Широта: {marker.latitude.toFixed(6)}{"\n"}
          Долгота: {marker.longitude.toFixed(6)}
          {distanceText ? `\n${distanceText}` : ""}
        </Text>
        <PhotoList
          photos={images}
          onDelete={photoId => handleDeletePhoto(photoId)}
          onPreview={setPreviewUri}
        />
        {/* Кнопки действия */}
        <View style={styles.actionButtons}>
          <Button title="Добавить изображение" onPress={handleAddPhoto} />
          <View style={{ height: 8 }} />
          <Button title="Удалить точку" color="#d32f2f" onPress={handleDeleteMarker} />
          <View style={{ height: 8 }} />
          {/* Кнопка тестового уведомления */}
          <Button title="Отправить тестовое уведомление" onPress={handleTestNotification} />
        </View>
      </ScrollView>
      <View style={{ height: 8 }} />
      <View style={{ paddingBottom: insets.bottom + 8, backgroundColor: "transparent" }}>
        <Button
          title="Назад к карте"
          onPress={() =>
            router.replace({
              pathname: "/",
              params: {
                lat: lat ?? "",
                lng: lng ?? "",
                latDelta: latDelta ?? "",
                lngDelta: lngDelta ?? ""
              }
            })
          }
          color="gray"
        />
      </View>

      {/* Предпросмотр изображения */}
      <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <TouchableWithoutFeedback onPress={() => setPreviewUri(null)}>
          <View style={styles.previewBackdrop}>
            <View style={styles.previewContainer}>
              {previewUri && (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.previewHint}>Нажмите для закрытия</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7f7f7" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  coords: { marginBottom: 16, color: "#666", textAlign: "center" },
  actionButtons: {
    marginTop: 16,
    marginHorizontal: 0,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  previewImage: {
    width: "90%",
    height: "70%",
    borderRadius: 14,
    backgroundColor: "#222",
  },
  previewHint: {
    marginTop: 16,
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
});
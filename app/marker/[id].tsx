import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Modal, Image, TouchableWithoutFeedback, ScrollView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePoints } from "@/contexts/PointsContext";
import PhotoList from "@/components/PhotoList";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MarkerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { points, updatePoint } = usePoints();
  const insets = useSafeAreaInsets();
  const point = points.find(p => p.id === id);

  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 1
      });

      if (!result.canceled && result.assets?.length) {
        const newPhoto = {
          id: uuid.v4() as string,
          uri: result.assets[0].uri,
          addedAt: new Date(),
        };
        const updated = {
          ...point!,
          photos: [...point!.photos, newPhoto],
        };
        updatePoint(updated);
      }
    } catch (error) {
      alert("Не удалось выбрать изображение.");
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!point) return;
    const updated = {
      ...point,
      photos: point.photos.filter((p) => p.id !== photoId),
    };
    updatePoint(updated);
  };

  if (!point) {
    return (
      <View style={styles.center}>
        <Text>Точка не найдена</Text>
        <Button title="Назад к карте" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.title}>{point.label}</Text>
        <Text style={styles.coords}>
          Широта: {point.latitude.toFixed(6)}{"\n"}
          Долгота: {point.longitude.toFixed(6)}
        </Text>
        <PhotoList
          photos={point.photos}
          onDelete={handleDeletePhoto}
          onPreview={setPreviewUri}
        />
        <View style={styles.actionButtons}>
          <Button title="Добавить изображение" onPress={handleAddPhoto} />
        </View>
      </ScrollView>
      <View style={{ height: 8 }} />
      <View style={{ paddingBottom: insets.bottom + 8, backgroundColor: "transparent" }}>
        <Button title="Назад к карте" onPress={() => router.back()} color="gray" />
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

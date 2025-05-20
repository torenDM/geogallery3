import React, { useState } from "react";
import { View, Modal, TextInput, Button, Platform, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapViewWrapper from "@/components/MapViewWrapper";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useRouter, useLocalSearchParams } from "expo-router";

const COLORS = ["#1976d2", "#388e3c", "#d32f2f", "#fbc02d", "#7b1fa2"];
const DEFAULT_ANDROID_COLOR = "#1976d2";

// --- Новый: дефолтные значения для карты
const DEFAULT_REGION = {
  latitude: 58.007468,
  longitude: 56.187654,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function IndexScreen() {
  const { markers, addMarker, reloadMarkers } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputLabel, setInputLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);

  // --- Новый: хранить актуальный регион (центр и зум карты)
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);

  const router = useRouter();

  // --- Новый: читаем параметры из роутера (если переход был с сохранённой позиции)
  const params = useLocalSearchParams<{
    lat?: string; lng?: string; latDelta?: string; lngDelta?: string;
  }>();

  // --- Новый: определяем, с какого региона стартовать (params из роутера или дефолт)
  const initialRegion = {
    latitude: params.lat ? parseFloat(params.lat) : mapRegion.latitude,
    longitude: params.lng ? parseFloat(params.lng) : mapRegion.longitude,
    latitudeDelta: params.latDelta ? parseFloat(params.latDelta) : mapRegion.latitudeDelta,
    longitudeDelta: params.lngDelta ? parseFloat(params.lngDelta) : mapRegion.longitudeDelta,
  };

  // --- При каждом изменении initialRegion (например, после возврата), обновлять mapRegion
  React.useEffect(() => {
    setMapRegion(initialRegion);
    // eslint-disable-next-line
  }, [params.lat, params.lng, params.latDelta, params.lngDelta]);

  // Долгое нажатие — добавить маркер
  const handleLongPress = (lat: number, lng: number) => {
    setNewCoords({ lat, lng });
    setModalVisible(true);
  };

  // --- Новый: при клике на маркер, передавать регион в параметры
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

  // Сохраняем новый маркер
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

  return (
    <View style={{ flex: 1 }}>
      <MapViewWrapper
        points={markers}
        onLongPress={handleLongPress}
        onPointPress={handlePointPress}
        initialRegion={initialRegion}
        // --- Новый: callback обновления mapRegion (onRegionChange)
        onRegionChange={region => setMapRegion(region)}
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

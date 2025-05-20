import React, { useState } from "react";
import { View, Modal, TextInput, Button, Platform, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapViewWrapper from "@/components/MapViewWrapper";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useRouter } from "expo-router";

const COLORS = ["#1976d2", "#388e3c", "#d32f2f", "#fbc02d", "#7b1fa2"];
const DEFAULT_ANDROID_COLOR = "#1976d2";

// Главный экран: карта с маркерами, добавление маркера
export default function IndexScreen() {
  const { markers, addMarker, reloadMarkers } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputLabel, setInputLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);

  const router = useRouter();

  // Обработка долгого нажатия по карте (добавление новой точки)
  const handleLongPress = (lat: number, lng: number) => {
    setNewCoords({ lat, lng });
    setModalVisible(true);
  };

  // Сохранение нового маркера
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
        onPointPress={id => router.push(`/marker/${id}`)}
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

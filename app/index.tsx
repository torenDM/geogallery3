import React, { useState } from "react";
import { View, Modal, TextInput, Button, Platform, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapViewWrapper from "@/components/MapViewWrapper";
import { usePoints } from "@/contexts/PointsContext";
import { useRouter } from "expo-router";
import uuid from "react-native-uuid";

const COLORS = ["#1976d2", "#388e3c", "#d32f2f", "#fbc02d", "#7b1fa2"];
const DEFAULT_ANDROID_COLOR = "#1976d2";

export default function IndexScreen() {
    const { points, setPoints } = usePoints();
    const [modalVisible, setModalVisible] = useState(false);
    const [inputLabel, setInputLabel] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);

    const router = useRouter();

    const handleLongPress = (lat: number, lng: number) => {
        setNewCoords({ lat, lng });
        setModalVisible(true);
    };

    const handleAddPoint = () => {
        if (newCoords) {
            const labelValue = inputLabel.trim() === "" ? "Без названия" : inputLabel;
            const newPoint = {
                id: uuid.v4() as string,
                latitude: newCoords.lat,
                longitude: newCoords.lng,
                label: labelValue,
                color: Platform.OS === "android" ? DEFAULT_ANDROID_COLOR : selectedColor,
                createdAt: new Date(),
                photos: [],
            };
            setPoints(prev => [...prev, newPoint]);
            setModalVisible(false);
            setNewCoords(null);
            setInputLabel("");
            setSelectedColor(COLORS[0]);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <MapViewWrapper
                points={points}
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
                            placeholderTextColor="#222"
                            value={inputLabel}
                            onChangeText={setInputLabel}
                        />
                        {Platform.OS === "ios" && (
                            <View style={modalStyles.colorsRow}>
                                {COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        style={[
                                            modalStyles.colorCircle,
                                            { backgroundColor: color },
                                            color === selectedColor && modalStyles.colorCircleSelected,
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
    },
    colorsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginHorizontal: 6,
        borderWidth: 2,
        borderColor: "#eee",
    },
    colorCircleSelected: {
        borderColor: "#333",
        borderWidth: 3,
    },
    buttonRow: { flexDirection: "row", justifyContent: "space-between" },
});


import React, { useRef } from "react";
import MapView, { Marker, Region, Circle } from "react-native-maps";
import { StyleSheet, View, Text, Platform } from "react-native";
import { Marker as MapMarker, UserLocation } from "@/types";

// --- добавлен userLocation
interface Props {
  points: MapMarker[];
  onLongPress: (lat: number, lng: number) => void;
  onPointPress: (id: number) => void;
  initialRegion: Region;
  onRegionChange?: (region: Region) => void;
  userLocation?: UserLocation | null; // новый проп
}

export default function MapViewWrapper({ points, onLongPress, onPointPress, initialRegion, onRegionChange, userLocation }: Props) {
  const mapRef = useRef<MapView>(null);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      onRegionChangeComplete={region => onRegionChange?.(region)}
      onLongPress={e => {
        onLongPress(
          e.nativeEvent.coordinate.latitude,
          e.nativeEvent.coordinate.longitude
        );
      }}
      showsUserLocation={false} // Своё отображение ниже
    >
      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={{
            latitude: point.latitude,
            longitude: point.longitude,
          }}
          onPress={() => onPointPress(point.id)}
          {...(Platform.OS === "android" ? { image: require("@/assets/marker.png") } : {})}
        >
          {Platform.OS === "ios" ? (
            <View
              key={`${point.id}-${point.label}`}
              style={{
                minWidth: 54,
                minHeight: 36,
                paddingVertical: 6,
                paddingHorizontal: 18,
                backgroundColor: point.color,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: "white",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 14,
                  textAlign: "center",
                  includeFontPadding: false,
                  paddingHorizontal: 2,
                }}
                numberOfLines={1}
              >
                {" "}{point.label}{" "}
              </Text>
            </View>
          ) : null}
        </Marker>
      ))}
      {/* --- Новый: отображение текущей позиции пользователя --- */}
      {userLocation && (
        <>
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            pinColor="blue"
            title="Вы здесь"
          />
          {/* Можно добавить круг радиуса для наглядности точности */}
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={userLocation.accuracy || 30}
            strokeColor="rgba(30, 144, 255, 0.4)"
            fillColor="rgba(30, 144, 255, 0.15)"
          />
        </>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
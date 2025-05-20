import React, { useRef } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { StyleSheet, View, Text, Platform } from "react-native";
import { Marker as MapMarker } from "@/types";

// Пропсы: добавлен initialRegion и onRegionChange (новое!)
interface Props {
  points: MapMarker[];
  onLongPress: (lat: number, lng: number) => void;
  onPointPress: (id: number) => void;
  initialRegion: Region;
  onRegionChange?: (region: Region) => void;
}

export default function MapViewWrapper({ points, onLongPress, onPointPress, initialRegion, onRegionChange }: Props) {
  const mapRef = useRef<MapView>(null);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      // --- Новый: слушаем изменения региона (передаём в родителя)
      onRegionChangeComplete={region => onRegionChange?.(region)}
      onLongPress={e => {
        onLongPress(
          e.nativeEvent.coordinate.latitude,
          e.nativeEvent.coordinate.longitude
        );
      }}
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
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
import React from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Text, Platform } from "react-native";
import { PointOfInterest } from "@/types";

interface Props {
  points: PointOfInterest[];
  onLongPress: (lat: number, lng: number) => void;
  onPointPress: (id: string) => void;
}

export default function MapViewWrapper({ points, onLongPress, onPointPress }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 58.007468,
        longitude: 56.187654,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
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

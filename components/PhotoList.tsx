import React from "react";
import { View, Image, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import { Photo } from "@/types";

interface Props {
  photos: Photo[];
  onDelete: (id: string) => void;
  onPreview?: (uri: string) => void;
}

export default function PhotoList({ photos, onDelete, onPreview }: Props) {
  if (photos.length === 0) {
    return <Text style={{ textAlign: "center", color: "#888", marginBottom: 16 }}>Нет изображений</Text>;
  }
  return (
    <FlatList
      data={photos}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 12 }}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <TouchableOpacity onPress={() => onPreview?.(item.uri)}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.delete} onPress={() => onDelete(item.id)}>
            <Text style={styles.deleteText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: { marginRight: 10, alignItems: "center" },
  image: { width: 100, height: 100, borderRadius: 8 },
  delete: { marginTop: 4, backgroundColor: "#f66", borderRadius: 4, padding: 4 },
  deleteText: { color: "white", fontSize: 12 },
});

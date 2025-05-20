import * as SQLite from "expo-sqlite";
import { Marker, MarkerImage } from "@/types";
import { initDatabase } from "@/database/schema";

// Получение экземпляра БД (один раз)
const db = initDatabase();

//
// Операция: получить все маркеры
//
export async function getMarkers(): Promise<Marker[]> {
  const results = await db.getAllAsync<Marker>(
    "SELECT * FROM markers ORDER BY created_at DESC"
  );
  return results;
}

//
// Операция: получить маркер по ID
//
export async function getMarkerById(id: number): Promise<Marker | null> {
  const [marker] = await db.getAllAsync<Marker>(
    "SELECT * FROM markers WHERE id = ?", [id]
  );
  return marker || null;
}

//
// Операция: добавить маркер
//
export async function addMarker(
  latitude: number,
  longitude: number,
  label: string,
  color: string
): Promise<Marker> {
  await db.runAsync(
    "INSERT INTO markers (latitude, longitude, label, color) VALUES (?, ?, ?, ?)",
    [latitude, longitude, label, color]
  );
  // Получаем последний добавленный маркер
  const [marker] = await db.getAllAsync<Marker>(
    "SELECT * FROM markers ORDER BY id DESC LIMIT 1"
  );
  return marker;
}

//
// Операция: удалить маркер (и связанные изображения)
//
export async function deleteMarker(id: number): Promise<void> {
  await db.runAsync("DELETE FROM markers WHERE id = ?", [id]);
}

//
// Операция: получить изображения для маркера
//
export async function getMarkerImages(markerId: number): Promise<MarkerImage[]> {
  const images = await db.getAllAsync<MarkerImage>(
    "SELECT * FROM marker_images WHERE marker_id = ? ORDER BY added_at DESC",
    [markerId]
  );
  return images;
}

//
// Операция: добавить изображение к маркеру
//
export async function addMarkerImage(markerId: number, uri: string): Promise<MarkerImage> {
  await db.runAsync(
    "INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)",
    [markerId, uri]
  );
  const [img] = await db.getAllAsync<MarkerImage>(
    "SELECT * FROM marker_images WHERE marker_id = ? ORDER BY id DESC LIMIT 1",
    [markerId]
  );
  return img;
}

//
// Операция: удалить изображение по ID
//
export async function deleteMarkerImage(id: number): Promise<void> {
  await db.runAsync("DELETE FROM marker_images WHERE id = ?", [id]);
}

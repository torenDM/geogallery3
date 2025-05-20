import React, { createContext, useContext, useState, useEffect } from "react";
import * as operations from "@/database/operations";
import { Marker, MarkerImage } from "@/types";

// Тип контекста базы данных
interface DatabaseContextType {
  markers: Marker[];
  reloadMarkers: () => void;
  addMarker: (lat: number, lng: number, label: string, color: string) => Promise<Marker | undefined>;
  deleteMarker: (id: number) => Promise<void>;
  addImage: (markerId: number, uri: string) => Promise<MarkerImage | undefined>;
  getMarkerImages: (markerId: number) => Promise<MarkerImage[]>;
  deleteImage: (id: number) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Провайдер контекста БД
export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);

  // Загрузка всех маркеров
  const reloadMarkers = async () => {
    try {
      const data = await operations.getMarkers();
      setMarkers(data);
    } catch (error) {
      console.error("Ошибка загрузки маркеров:", error);
    }
  };

  // Добавление маркера
  const addMarker = async (lat: number, lng: number, label: string, color: string) => {
    try {
      const marker = await operations.addMarker(lat, lng, label, color);
      await reloadMarkers();
      return marker;
    } catch (error) {
      console.error("Ошибка добавления маркера:", error);
    }
  };

  // Удаление маркера
  const deleteMarker = async (id: number) => {
    try {
      await operations.deleteMarker(id);
      await reloadMarkers();
    } catch (error) {
      console.error("Ошибка удаления маркера:", error);
    }
  };

  // Добавление изображения к маркеру
  const addImage = async (markerId: number, uri: string) => {
    try {
      const img = await operations.addMarkerImage(markerId, uri);
      return img;
    } catch (error) {
      console.error("Ошибка добавления изображения:", error);
    }
  };

  // Получение изображений для маркера
  const getMarkerImages = async (markerId: number) => {
    try {
      return await operations.getMarkerImages(markerId);
    } catch (error) {
      console.error("Ошибка загрузки изображений:", error);
      return [];
    }
  };

  // Удаление изображения
  const deleteImage = async (id: number) => {
    try {
      await operations.deleteMarkerImage(id);
    } catch (error) {
      console.error("Ошибка удаления изображения:", error);
    }
  };

  // Автоматическая загрузка маркеров при монтировании компонента
  useEffect(() => {
    reloadMarkers();
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        markers,
        reloadMarkers,
        addMarker,
        deleteMarker,
        addImage,
        getMarkerImages,
        deleteImage,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

// Хук для использования контекста
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

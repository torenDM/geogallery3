// Тип для одного маркера
export interface Marker {
  id: number;
  latitude: number;
  longitude: number;
  label: string;
  color: string;
  createdAt?: string;
}

// Тип для изображения, связанного с маркером
export interface MarkerImage {
  id: number;
  markerId: number;
  uri: string;
  createdAt?: string;
}

// Типы для контекста
export interface PointsContextType {
  markers: Marker[];
  setMarkers: React.Dispatch<React.SetStateAction<Marker[]>>;
  reloadMarkers: () => Promise<void>;
}

// Тип для текущей позиции пользователя
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// Пороговое расстояние для уведомления (метры)
export const PROXIMITY_THRESHOLD = 40; // например, 40 м
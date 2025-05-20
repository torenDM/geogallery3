export interface Photo {
  id: string;
  uri: string;
  addedAt: Date;
}

export interface PointOfInterest {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  color: string;
  createdAt: Date;
  photos: Photo[];
}

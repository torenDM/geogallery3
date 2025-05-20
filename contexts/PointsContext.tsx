import React, { createContext, useContext, useState } from "react";
import { PointOfInterest } from "@/types";

interface PointsContextType {
  points: PointOfInterest[];
  setPoints: React.Dispatch<React.SetStateAction<PointOfInterest[]>>;
  updatePoint: (updated: PointOfInterest) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState<PointOfInterest[]>([
    // начальные точки, если нужно
  ]);

  const updatePoint = (updated: PointOfInterest) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  return (
    <PointsContext.Provider value={{ points, setPoints, updatePoint }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error("usePoints must be used within PointsProvider");
  return ctx;
}

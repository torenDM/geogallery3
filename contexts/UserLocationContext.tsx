import React, { createContext, useContext, useEffect, useState } from "react";
import { watchPosition } from "@/services/location";
import { UserLocation } from "@/types";

// Контекст
const UserLocationContext = createContext<UserLocation | null>(null);

// Провайдер
export const UserLocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    let sub: any;
    let mounted = true;
    watchPosition((loc) => {
      if (!mounted) return;
      const { latitude, longitude, accuracy } = loc.coords;
      const timestamp = loc.timestamp;
      setLocation({ latitude, longitude, accuracy, timestamp });
    }).then((s) => (sub = s));
    return () => {
      mounted = false;
      if (sub) sub.remove();
    };
  }, []);

  return (
    <UserLocationContext.Provider value={location}>
      {children}
    </UserLocationContext.Provider>
  );
};

export function useUserLocation() {
  return useContext(UserLocationContext);
}

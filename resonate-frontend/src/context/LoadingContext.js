"use client"
import { FullscreenLoader } from "@/components/layout/FullScreenLoader";
import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}


export function GlobalLoaderWrapper() {
  const { isLoading } = useLoading();
  return isLoading ? <FullscreenLoader /> : null;
}

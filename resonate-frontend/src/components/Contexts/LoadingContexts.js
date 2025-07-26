"use client"
import React, { createContext, useContext, useState } from "react";
import { FullscreenLoader } from "../fullscreen-loader";

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

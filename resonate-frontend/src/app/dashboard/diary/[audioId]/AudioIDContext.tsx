"use client"
import React, { createContext, useContext } from "react";

type AudioIDContextType = { audioid: string }
const AudioIDContext = createContext<AudioIDContextType | undefined>(undefined)

export const useAudioID = () => {
    const context = useContext(AudioIDContext)
    if (!context) throw new Error("useAudioId must be used within AudioIdProvider")
    return context.audioid
}

export const AudioIdProvider: React.FC<{ audioid: string; children: React.ReactNode }> = ({ audioid, children }) => (
    <AudioIDContext.Provider value={{ audioid }}>
        {children}
    </AudioIDContext.Provider>
)

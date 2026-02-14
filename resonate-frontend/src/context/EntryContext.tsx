"use client"
import React, { createContext, useContext, useMemo } from "react";

type EntryIDContextType = { entryId: string }
const EntryIDContext = createContext<EntryIDContextType | undefined>(undefined)

export const useEntryID = () => {
    const context = useContext(EntryIDContext)
    if (!context) throw new Error("useEntryId must be used within EntryIDProvider")
    return context.entryId
}

export const EntryIDProvider: React.FC<React.PropsWithChildren<{ entryId: string }>> = ({ entryId, children }) => {
    const value = useMemo(() => ({ entryId }), [entryId]);

    return (
        <EntryIDContext.Provider value={value}>
            {children}
        </EntryIDContext.Provider>
    )
}
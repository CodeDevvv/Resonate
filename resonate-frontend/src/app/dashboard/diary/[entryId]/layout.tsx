"use client"
import { useParams } from "next/navigation"
import { EntryIDProvider } from "./EntryIDContext"
import { ReactNode } from "react";


const AudioPage = ({ children }: { children: ReactNode }) => {
    const params = useParams()
    const entryId = params.entryId as string

    return (
        <EntryIDProvider entryId={entryId}>
            {children}
        </EntryIDProvider>
    )
}

export default AudioPage
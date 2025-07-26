"use client"
import { useParams } from "next/navigation"
import { AudioIdProvider } from "./AudioIDContext"
import { ReactNode } from "react";


const AudioPage = ({ children }: { children: ReactNode }) => {
    const params = useParams()
    const audioid = params.audioId as string

    return (
        <AudioIdProvider audioid={audioid}>
            {children}
        </AudioIdProvider>
    )
}

export default AudioPage
"use client"

import React, { useEffect, useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const AddEntry = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDialogOpen = searchParams.get("action") === "newEntry"
    const [isLoading, setIsLoading] = useState(false)
    const [isRecording, setIsRecording] = useState(false)

    const handleOpenDialog = (open: boolean) => {
        if (open) {
            router.push(`${pathname}?action=newEntry`);
        } else {
            router.replace(pathname);
        }
    }

    if (!mounted) return null

    return (
        <div>
            <button
                className="fixed bottom-1 right-11 mb-5 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
                style={{ width: "5rem", height: "5rem", fontSize: "10rem" }}
                onClick={() => handleOpenDialog(true)}
                aria-label="Add Entry"
                title="New Entry"
            >
                <Plus size={64} />
            </button>

            <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300" />
                <DialogContent
                    className={`fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-xl h-[650px] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex flex-col bg-background 
        rounded-3xl shadow-2xl border border-border/50 outline-none p-0 overflow-hidden duration-200
        ${isLoading || isRecording ? "[&>button:last-child]:pointer-events-none [&>button:last-child]:opacity-0" : ""}`}
                    onInteractOutside={(e) => { if (isLoading || isRecording) e.preventDefault(); }}
                    onPointerDownOutside={(e) => { if (isLoading || isRecording) e.preventDefault(); }}
                    onEscapeKeyDown={(e) => { if (isLoading || isRecording) e.preventDefault(); }}
                >
                    <div className="flex flex-col h-full w-full">
                        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
                            <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                                <div className="w-2 h-5 bg-primary rounded-full" />
                                Voice Recorder
                            </DialogTitle>
                        </div>

                        <div className="flex-1 w-full p-6 overflow-hidden relative">
                            <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                            <VoiceRecorder isLoading={isLoading} setIsLoading={setIsLoading} setIsRecording={setIsRecording} />
                        </div>
                        {isLoading && (
                            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-sm font-medium text-foreground animate-pulse">
                                        Saving your entry...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddEntry
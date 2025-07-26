import React, { useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useLoading } from "@/components/Contexts/LoadingContexts";
import { Plus } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";

const AddEntry = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { isLoading } = useLoading()
    return (
        <div>
            <button
                className="fixed bottom-1 right-11 mb-5 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
                style={{ width: "5rem", height: "5rem", fontSize: "10rem" }}
                onClick={() => setDialogOpen(true)}
                aria-label="Add Entry"
                title="Create New"
            >
                <Plus size={64} />
            </button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <DialogContent
                    className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-2xl h-[70vh] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex flex-col bg-background rounded-2xl shadow-2xl p-0 overflow-hidden"
                >
                    {isLoading ? (
                        <div className="flex flex-1 justify-center items-center h-full w-full">
                            <span className="sr-only">Loading...</span>
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full w-full">
                            <div className="px-8 pt-8 pb-4 border-b border-border/50 flex items-center gap-2">
                                <DialogTitle className="text-2xl font-bold text-primary">
                                    Voice Recorder
                                </DialogTitle>
                            </div>
                            <div className="flex-1 flex items-center justify-center px-8 pb-8">
                                <VoiceRecorder />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddEntry
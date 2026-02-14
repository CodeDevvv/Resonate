"use client"
import React from 'react'
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSaveEntry } from '@/hooks/use-diary';

type AudioProps = {
    audio: Blob,
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const SaveAudio = ({ audio, isLoading, setIsLoading }: AudioProps) => {
    const router = useRouter()
    const { mutate: saveEntry } = useSaveEntry(setIsLoading)

    const handleSaveEntry = async () => {
        const file = new File([audio], 'audio.wav', { type: 'audio/wav' });
        const formdata = new FormData()
        formdata.append('audio', file)

        saveEntry(formdata, {
            onSuccess: (result) => {
                if (result?.entryId) {
                    router.push(`/dashboard/diary/${result.entryId}`);
                } else {
                    console.error("No entryId found in response", result);
                }
            }
        })
    }

    return (
        <button
            onClick={handleSaveEntry}
            disabled={isLoading}
            className={`
                flex items-center justify-center gap-2 w-full h-full 
                rounded-xl font-medium text-sm transition-all duration-200 shadow-sm
                ${isLoading
                    ? "bg-primary/80 text-primary-foreground cursor-not-allowed opacity-80"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                }
            `}
            aria-label={isLoading ? "Saving recording" : "Save recording"}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                </>
            ) : (
                <>
                    <Save className="w-4 h-4" />
                    <span>Save Entry</span>
                </>
            )}
        </button>
    );
};

export default SaveAudio;

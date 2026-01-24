"use client";
import { Button } from "@/components/ui/button";
import { Pause, Play, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from 'react-hot-toast';
import { confirm } from "../ConfirmDelete";
import { useDeleteEntry } from "../useDiary";
import { useRouter } from "next/navigation";
import { useEntryID } from "./EntryIDContext";
;

const AudioEntry = ({ audioUrl, entryTitle }: { audioUrl: string, entryTitle: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const entryId = useEntryID()
    const router = useRouter()

    const { mutate: deleteEntry, isPending } = useDeleteEntry()

    const handleDeleteEntry = async (entryId: string) => {
        const confirmation = await confirm(
            {
                message: `Are you sure you want to delete? - ${entryTitle}`,
                show: true
            })
        if (confirmation) {
            deleteEntry(entryId, {
                onSuccess: () => {
                    toast.success(`"${entryTitle}" deleted successfully`);
                    router.push('/dashboard/diary')
                }
            })
        }
    };

    const handlePlayPause = () => {
        if (!audioRef.current || !audioUrl) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleReplay = () => {
        if (audioRef.current && audioUrl) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleAudioEnded = () => setIsPlaying(false);
    const handleAudioError = () => {
        setIsPlaying(false);
        toast.error('Failed to play audio');
    };


    return (
        <div className="group flex items-center gap-3 bg-muted rounded-full p-2 pr-6 shadow-sm border border-primary/5 hover:shadow-md transition-all duration-300">
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                preload="metadata"
            />

            <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform shrink-0"
                onClick={handlePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                ) : (
                    <Play className="w-5 h-5 fill-current ml-1" />
                )}
            </Button>

            <div className="flex-1 flex flex-col justify-center min-w-[120px]">
                <div className="flex items-center gap-1 h-4 mb-1 opacity-80">
                    {[1, 2, 3, 2, 4, 2, 1, 2].map((height, i) => (
                        <div
                            key={i}
                            className={`w-1 rounded-full bg-primary/60 transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                            style={{ height: `${height * 20 + 20}%` }}
                        />
                    ))}
                </div>
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest pl-1">
                    Voice Note
                </span>
            </div>

            <div className="flex items-center gap-1 pl-3 border-l border-primary/10">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 hover:bg-primary/10 rounded-full"
                    aria-label="Retake"
                    onClick={handleReplay}
                >
                    <RefreshCw className="w-4 h-4 text-accent" />
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 hover:bg-destructive/10 rounded-full"
                    aria-label="Delete"
                    onClick={() => handleDeleteEntry(entryId)}
                    disabled={isPending}
                >
                    <Trash2 className="w-4 h-4 text-destructive transition-colors" />
                </Button>
            </div>
        </div>
    );
};

export default AudioEntry;

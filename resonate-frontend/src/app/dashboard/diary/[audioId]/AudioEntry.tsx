"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Play, Pause, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';;
import { useAuth } from "@clerk/nextjs";
import { useLoading } from "@/components/Contexts/LoadingContexts";
import { useAudioID } from "./AudioIDContext";
import { useRouter } from "next/navigation";
import { confirm } from "../ConfirmDelete";
import { useApi } from "@/userQueries/userQuery";

const AudioEntry = () => {
    const { setIsLoading } = useLoading();
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const API_URL = useApi()
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { getToken } = useAuth();
    const id = useAudioID()
    const router = useRouter()

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

    const handledelete = async () => {
        const confirmation = await confirm({
            message: "Are you sure you want to delete?",
            show: true,
        })
        if (confirmation) {
            try {
                setIsLoading(true);
                const token = await getToken();
                if (!token) {
                    toast.error("Session Error!");
                    return;
                }

                const response = await axios.delete(`${API_URL}/diary/deleteEntry?id=${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.data.status) {
                    toast.success(response.data.message);
                    router.push("/dashboard/diary")
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error deleting entry:", error);
                toast.error("Failed to delete entry");
            } finally {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = await getToken();
                const response = await axios.post(
                    `${API_URL}/audio/getAudio`,
                    { audio_id: id },
                    {
                        responseType: 'blob',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if (response.headers['content-type'].includes('application/json')) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (typeof reader.result === "string") {
                            const error = JSON.parse(reader.result);
                            setError('Error fetching audio - not found');
                            toast.error(error.message);
                        } else {
                            setError('Error fetching audio - invalid response');
                            toast.error('Invalid error response');
                        }
                    };
                    reader.readAsText(response.data);
                } else {
                    const audioUrl = URL.createObjectURL(response.data);
                    setAudioUrl(audioUrl);
                }
            } catch {
                setError('Error fetching audio - not found');
                toast.error('An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, setIsLoading, getToken, API_URL]);

    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    if (error) {
        return (
            <div className="bg-card rounded-2xl shadow-lg p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="group flex items-center gap-3 bg-muted rounded-full p-2 pr-6 shadow-sm border border-primary/5 hover:shadow-md transition-all duration-300">
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={handleAudioEnded}
                    onError={handleAudioError}
                    preload="metadata"
                />
            )}

            {/* Primary Control: Play/Pause (Prominent & Circular) */}
            <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform shrink-0"
                onClick={handlePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                ) : (
                    <Play className="w-5 h-5 fill-current ml-1" /> // ml-1 to visually center the triangle
                )}
            </Button>

            {/* Center: Fake Waveform Visualizer & Label */}
            <div className="flex-1 flex flex-col justify-center min-w-[120px]">
                <div className="flex items-center gap-1 h-4 mb-1 opacity-80">
                    {/* CSS simulated waveform bars */}
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

            {/* Secondary Actions (Divider separated) */}
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
                    onClick={handledelete}
                >
                    <Trash2 className="w-4 h-4 text-destructive transition-colors" />
                </Button>
            </div>
        </div>
    );
};

export default AudioEntry;

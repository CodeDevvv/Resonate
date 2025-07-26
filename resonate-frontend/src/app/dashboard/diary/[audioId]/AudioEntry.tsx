"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Mic, Play, Pause, RefreshCw, Trash2 } from "lucide-react";
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
        <div className="flex items-center justify-between bg-muted rounded-xl px-6 py-4 shadow-inner">
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={handleAudioEnded}
                    onError={handleAudioError}
                    preload="metadata"
                />
            )}
            <div className="flex items-center space-x-3">
                <Mic className="w-8 h-8 text-primary" />
                <span className="font-semibold text-lg">Audio Entry</span>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6 text-primary" />
                    ) : (
                        <Play className="w-6 h-6 text-primary" />
                    )}
                </Button>
                <Button size="icon" variant="ghost" aria-label="Retake" onClick={handleReplay}>
                    <RefreshCw className="w-6 h-6 text-accent" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={handledelete}>
                    <Trash2 className="w-6 h-6 text-destructive" />
                </Button>
            </div>
        </div>
    );
};

export default AudioEntry;

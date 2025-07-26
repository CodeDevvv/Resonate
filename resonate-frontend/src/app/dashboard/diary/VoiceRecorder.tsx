"use client";
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, Mic, X } from "lucide-react";
import SaveAudio from "./SaveAudio";
import { useLoading } from "@/components/Contexts/LoadingContexts";

const VoiceRecorder: React.FC = () => {
    const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused">("idle");
    const [playbackState, setPlaybackState] = useState<"stopped" | "playing" | "paused">("stopped");
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioFile, setAudioFile] = useState<Blob | null>(null);

    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { isLoading } = useLoading()
    const startRecording = async () => {
        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Initialize MediaRecorder for audio recording
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);
                setAudioFile(audioBlob)
            };

            recorder.start();
            setMediaRecorder(recorder);
            setRecordingDuration(0);
            setRecordingState("recording");

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    // Pause recording
    const pauseRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.pause();
        }

        setRecordingState("paused");

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    // Resume recording
    const resumeRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "paused") {
            mediaRecorder.resume();
        }

        setRecordingState("recording");

        // Restart timer
        timerRef.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    };

    // Stop recording
    const stopRecording = () => {
        // Stop media recorder
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        // Stop media stream to release microphone
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }

        setRecordingState("idle");

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    // Play recorded audio
    const playAudio = () => {
        if (!audioURL) return;

        const audio = new Audio(audioURL);
        audioRef.current = audio;

        audio.onplay = () => setPlaybackState("playing");
        audio.onended = () => setPlaybackState("stopped");
        audio.onerror = () => setPlaybackState("stopped");
        audio.onpause = () => setPlaybackState("paused");

        audio.play().catch(error => {
            console.error("Error playing audio:", error);
            setPlaybackState("stopped");
        });
    };

    // Pause audio playback
    const pauseAudio = () => {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setPlaybackState("paused");
        }
    };

    // Resume audio playback
    const resumeAudio = () => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play();
            setPlaybackState("playing");
        }
    };

    // Stop audio playback
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlaybackState("stopped");
        }
    };

    // Cancel/discard recording
    const cancelRecording = () => {
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
            setAudioURL(null);
        }
        setRecordingDuration(0);
        setPlaybackState("stopped");
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        };
    }, [audioURL]);

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-lg flex flex-col gap-6">
            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                    {recordingState === "idle" ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                            <div className="w-full flex flex-col items-center">
                                <div className="relative flex items-center justify-center mb-4">
                                    <span className="absolute inline-flex h-20 w-20 rounded-full bg-primary/20 animate-pulse" />
                                    <button
                                        onClick={startRecording}
                                        className="w-16 h-16 rounded-full z-1 bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                        aria-label="Start recording"
                                        disabled={isLoading}
                                    >
                                        <Mic className="w-8 h-8 text-white" />
                                    </button>
                                </div>

                                {audioURL ? (
                                    <div className="flex flex-col items-center">
                                        <p className="text-muted-foreground text-sm mb-2">
                                            Record Again!
                                        </p>
                                        <p>{formatTime(recordingDuration)}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <h2 className="text-2xl font-bold text-primary mb-1 tracking-tight">Ready to record?</h2>
                                        <p className="text-muted-foreground text-sm mb-2">
                                            Click the mic to start recording your thoughts.
                                        </p>
                                        <p className="text-xs text-muted-foreground italic">
                                            Your voice, your story—captured securely.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={pauseRecording}
                                disabled={recordingState !== "recording"}
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${recordingState === "recording"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                aria-label="Pause recording"
                            >
                                <Pause className="w-5 h-5 text-white" />
                            </button>

                            <button
                                onClick={stopRecording}
                                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
                                aria-label="Stop recording"
                            >
                                <Square className="w-5 h-5 text-white" />
                            </button>

                            <button
                                onClick={resumeRecording}
                                disabled={recordingState !== "paused"}
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${recordingState === "paused"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                aria-label="Resume recording"
                            >
                                <Play className="w-5 h-5 text-white" />
                            </button>
                        </>
                    )}
                </div>

                {/* Recording Status */}
                {recordingState !== "idle" && (
                    <div className="flex items-center gap-2 text-sm">
                        <div
                            className={`w-3 h-3 rounded-full ${recordingState === "recording" ? "bg-red-500 animate-pulse" : "bg-gray-500"
                                }`}
                        ></div>
                        <span>{formatTime(recordingDuration)}</span>
                        <span className="text-muted-foreground">
                            {recordingState === "recording" ? "Recording" : "Paused"}
                        </span>
                    </div>
                )}
            </div>

            {/* Playback Controls */}
            {audioURL && recordingState === "idle" && (
                <div className="flex justify-center gap-4">
                    {playbackState === "stopped" ? (
                        <button
                            onClick={playAudio}
                            className="p-3 rounded-full bg-green-500 hover:bg-green-600"
                            aria-label="Play audio"
                        >
                            <Play className="w-5 h-5 text-white" />
                        </button>
                    ) : playbackState === "playing" ? (
                        <button
                            onClick={pauseAudio}
                            className="p-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
                            aria-label="Pause audio"
                        >
                            <Pause className="w-5 h-5 text-white" />
                        </button>
                    ) : (
                        <button
                            onClick={resumeAudio}
                            className="p-3 rounded-full bg-green-500 hover:bg-green-600"
                            aria-label="Resume audio"
                        >
                            <Play className="w-5 h-5 text-white" />
                        </button>
                    )}

                    <button
                        onClick={stopAudio}
                        disabled={playbackState === "stopped"}
                        className={`p-3 rounded-full ${playbackState !== "stopped"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gray-300 cursor-not-allowed"
                            }`}
                        aria-label="Stop audio"
                    >
                        <Square className="w-5 h-5 text-white" />
                    </button>
                </div>
            )}

            {/* Save and Cancel Controls */}
            {audioURL && recordingState === "idle" && (
                <div className="flex justify-center gap-3 pt-2">
                    {audioFile && <SaveAudio audio={audioFile} />}

                    <button
                        onClick={cancelRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        aria-label="Cancel recording"
                        disabled={isLoading}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </div>
            )}

        </div>
    );
};

export default VoiceRecorder;
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, Mic, RotateCw } from "lucide-react";
import SaveAudio from "./SaveAudio";

type VoiceRecorderProps = {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ isLoading, setIsLoading, setIsRecording }) => {
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioFile, setAudioFile] = useState<Blob | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused">("idle");
    const [playbackState, setPlaybackState] = useState<"stopped" | "playing" | "paused">("stopped");

    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startRecording = async () => {
        try {
            setIsRecording(true)
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
            setIsRecording(false)
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
        setIsLoading(true)
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
        setIsLoading(false)
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
        setIsRecording(false)
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
        <div className="w-full max-w-sm mx-auto h-full flex flex-col justify-between relative z-10">
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-10">
                {recordingState === "idle" ? (
                    <div className="flex flex-col items-center gap-8 w-full animate-in fade-in zoom-in duration-500 fill-mode-forwards">
                        <div className="relative flex items-center justify-center group cursor-pointer" onClick={startRecording}>
                            <span className="absolute inline-flex h-40 w-40 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <span className="absolute inline-flex h-28 w-28 rounded-full bg-primary/10 animate-pulse" />

                            <button
                                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center group-hover:scale-105 transition-all duration-300"
                                aria-label="Start recording"
                                disabled={isLoading}
                            >
                                <Mic className="w-8 h-8 drop-shadow-sm" />
                            </button>
                        </div>

                        {audioURL ? (
                            <div className="text-center space-y-3 animate-in slide-in-from-bottom-2">
                                <h3 className="text-lg font-semibold text-foreground tracking-tight">
                                    Review your entry
                                </h3>
                                <button
                                    onClick={startRecording}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-xs font-medium text-secondary-foreground transition-colors"
                                >
                                    <RotateCw className="w-3 h-3" />
                                    Record Again
                                </button>
                            </div>
                        ) : (
                            <div className="text-center space-y-1.5 max-w-[250px]">
                                <h2 className="text-lg font-bold tracking-tight text-foreground">
                                    Tap to Record
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Capture your thoughts securely.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-8 duration-500 fill-mode-forwards">
                        <div className="flex flex-col items-center mb-10">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-6 transition-colors duration-300 ${recordingState === "recording"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${recordingState === "recording" ? "bg-current animate-pulse" : "bg-current"}`} />
                                <span>{recordingState === "recording" ? "Recording" : "Paused"}</span>
                            </div>
                            <span className="text-6xl sm:text-7xl font-mono font-light text-foreground tracking-tighter tabular-nums">
                                {formatTime(recordingDuration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-10">
                            {recordingState === "recording" ? (
                                <button
                                    onClick={pauseRecording}
                                    className="group flex flex-col items-center gap-2"
                                >
                                    <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-500 flex items-center justify-center border border-orange-200 dark:border-orange-900 hover:scale-105 transition-all duration-300 shadow-sm">
                                        <Pause className="w-6 h-6 fill-current" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide group-hover:text-orange-500 transition-colors">Pause</span>
                                </button>
                            ) : (
                                <button
                                    onClick={resumeRecording}
                                    className="group flex flex-col items-center gap-2"
                                >
                                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 flex items-center justify-center border border-emerald-200 dark:border-emerald-900 hover:scale-105 transition-all duration-300 shadow-sm">
                                        <Play className="w-6 h-6 ml-1 fill-current" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide group-hover:text-emerald-500 transition-colors">Resume</span>
                                </button>
                            )}

                            <button
                                onClick={stopRecording}
                                className="group flex flex-col items-center gap-2"
                            >
                                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 flex items-center justify-center border border-red-200 dark:border-red-900 hover:scale-105 transition-all duration-300 shadow-sm">
                                    <Square className="w-6 h-6 fill-current" />
                                </div>
                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide group-hover:text-red-500 transition-colors">Stop</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div
                className={`w-full space-y-4 pt-4 border-t border-border/40 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${audioURL && recordingState === "idle"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8 pointer-events-none hidden"
                    }`}
            >

                <div className="flex items-center justify-between bg-secondary/30 p-2 pr-4 rounded-full border border-border/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={playbackState === "playing" ? pauseAudio : (playbackState === "stopped" ? playAudio : resumeAudio)}
                            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                        >
                            {playbackState === "playing" ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                        </button>

                        <div className="flex flex-col justify-center h-full">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Preview</span>
                            <span className="text-xs font-mono font-medium text-foreground">{formatTime(recordingDuration)}</span>
                        </div>
                    </div>

                    <button
                        onClick={stopAudio}
                        disabled={playbackState === "stopped"}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                        title="Stop Preview"
                    >
                        <Square className="w-4 h-4 fill-current" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={cancelRecording}
                        className="flex items-center justify-center gap-2 h-11 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all font-medium text-sm"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>

                    <div className="h-11 w-full [&>button]:w-full [&>button]:h-full [&>button]:text-sm [&>button]:rounded-xl [&>button]:shadow-sm">
                        {audioFile && <SaveAudio audio={audioFile} isLoading={isLoading} setIsLoading={setIsLoading} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceRecorder;
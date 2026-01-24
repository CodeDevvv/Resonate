"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    ChevronDown,
    ChevronUp,
    RotateCw,
    Sparkles,
    Tag,
    Target,
    Brain,
    Lightbulb,
    FileText,
} from "lucide-react";
import { AddGoalDialog } from "./AddGoal";
import { useRefetchAnalysis } from "./useEntry";
import AiLoader from "@/components/AiLoader";
import { io } from 'socket.io-client';
import SOCKET_URL from "@/components/utils/getApiUrl";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEntryID } from "./EntryIDContext";

type AnalysisViewProps = {
    entryDetails: {
        transcript: string;
        ai_summary: string;
        mood: { [key: string]: number };
        suggestions: string;
        reflections: string;
        tags: string[];
        goal: string | null;
        status: string;
    };
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ entryDetails }) => {
    const entryId = useEntryID();
    const queryClient = useQueryClient();

    const [isGoalDetectedDialogOpen, setIsGoalDetectedDialogOpen] = useState(false);
    const [isAddGoalDialogOpen, setAddGoalDialogOpen] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    const { mutate: refetchMutation } = useRefetchAnalysis();

    useEffect(() => {
        if (entryDetails.status === 'completed') return;

        const socket = io(SOCKET_URL);
        socket.emit('join_entry', entryId);

        socket.on('entry_update', (payload) => {
            queryClient.setQueryData(['diaryEntry', entryId], (oldData: any) => {
                if (!oldData) return null;
                return {
                    ...oldData,
                    entryDetails: {
                        ...oldData.entryDetails,
                        status: payload.status,
                        ...payload.result
                    }
                };
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [entryId, entryDetails.status, queryClient]);

    useEffect(() => {
        if (entryDetails?.goal) {
            setIsGoalDetectedDialogOpen(true);
        }
    }, [entryDetails]);

    const handleAddGoalClick = () => {
        setIsGoalDetectedDialogOpen(false);
        setAddGoalDialogOpen(true);
    };

    const handleRefetch = (e: React.MouseEvent) => {
        e.stopPropagation();

        queryClient.setQueryData(['diaryEntry', entryId], (oldData: any) => ({
            ...oldData,
            entryDetails: {
                ...oldData.entryDetails,
                status: 'processing'
            }
        }));

        refetchMutation(undefined, {
            onSuccess: () => {
                toast.success("Analysis Restarted");
            },
            onError: () => {
                toast.error("Retry failed");
                queryClient.invalidateQueries({ queryKey: ['diaryEntry', entryId] });
            }
        });
    };

    if (entryDetails.status === 'processing') return <AiLoader />;

    const isIncomplete =
        !entryDetails.ai_summary ||
        !entryDetails.mood ||
        !entryDetails.tags ||
        !entryDetails.suggestions ||
        !entryDetails.reflections ||
        entryDetails.status === 'failed';

    return (
        <>
            <div className="space-y-6 animate-fade-in mx-auto">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {entryDetails.mood && Object.keys(entryDetails.mood).length > 0 ? (
                                Object.keys(entryDetails.mood).map((m) => (
                                    <Badge
                                        key={m}
                                        variant="outline"
                                        className="px-3 py-1 text-sm border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    >
                                        {entryDetails.mood[m]}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground italic">Mood not detected</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="w-4 h-4" />
                            {entryDetails.tags && Object.keys(entryDetails.tags).length > 0 ? (
                                Object.entries(entryDetails.tags).map(([key, value]) => (
                                    <span key={key} className="bg-secondary/50 px-2 py-0.5 rounded text-secondary-foreground">
                                        #{value}
                                    </span>
                                ))
                            ) : (
                                <span className="italic">No tags</span>
                            )}
                        </div>
                    </div>

                    {isIncomplete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefetch}
                            className="text-red-600 border-red-200 hover:bg-red-50 self-start shrink-0"
                            title="This will attempt to regenerate missing Summary, Mood, Tags, or Suggestions."
                        >
                            <RotateCw className="w-3.5 h-3.5 mr-2" />
                            Retry Analysis
                        </Button>
                    )}
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10 shadow-sm">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                        <Sparkles className="w-5 h-5" />
                        Entry Summary
                    </h2>
                    {entryDetails.ai_summary ? (
                        <p className="text-foreground/80 leading-relaxed text-lg">
                            {entryDetails.ai_summary}
                        </p>
                    ) : (
                        <p className="text-muted-foreground italic">Summary unavailable.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl border shadow-sm p-5 flex flex-col h-full">
                        <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Brain className="w-4 h-4 text-purple-500" />
                            Deep Reflection
                        </h3>
                        <div className="text-muted-foreground text-sm leading-relaxed flex-grow">
                            {entryDetails.reflections || "No reflections generated."}
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border shadow-sm p-5 flex flex-col h-full">
                        <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Actionable Suggestions
                        </h3>
                        <div className="text-muted-foreground text-sm leading-relaxed flex-grow">
                            {entryDetails.suggestions || "No suggestions generated."}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="w-full flex items-center justify-between hover:bg-muted/50 h-auto py-3 px-4 rounded-lg group"
                    >
                        <span className="flex items-center gap-2 font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            <FileText className="w-4 h-4" />
                            Full Transcript
                        </span>
                        {showTranscript ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                    </Button>

                    {showTranscript && (
                        <div className="mt-2 px-4 py-4 bg-muted/30 rounded-lg animate-in slide-in-from-top-2 duration-200">
                            <p className="text-muted-foreground text-sm leading-7 whitespace-pre-wrap font-mono">
                                {entryDetails.transcript || "Transcription failed or is unavailable."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isGoalDetectedDialogOpen} onOpenChange={setIsGoalDetectedDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Target className="w-6 h-6 text-primary" /> Goal Detected
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-muted-foreground text-sm">
                            From your journal entry, we identified a potential goal:
                        </p>
                        <div className="p-4 bg-muted/50 rounded-lg border border-primary/10">
                            <p className="font-medium text-primary italic text-center">
                                &quot;{entryDetails.goal}&quot;
                            </p>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Would you like to track this in your goals list?
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsGoalDetectedDialogOpen(false)}>
                            Ignore
                        </Button>
                        <Button onClick={handleAddGoalClick}>Add to Goals</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AddGoalDialog
                open={isAddGoalDialogOpen}
                onOpenChange={setAddGoalDialogOpen}
                initialData={{ title: entryDetails.goal || "", desc: entryDetails.goal || "" }}
                entryId={entryId}
            />
        </>
    );
};

export default AnalysisView;
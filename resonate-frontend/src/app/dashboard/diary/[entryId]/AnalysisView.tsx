"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    Plus,
    CheckCircle2
} from "lucide-react";
import { useRefetchAnalysis } from "./useEntry";
import AiLoader from "@/components/AiLoader";
import { io } from 'socket.io-client';
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEntryID } from "./EntryIDContext";
import { SOCKET_URL } from "@/components/utils/getApiUrl";
import { useAddGoal } from "../../goals/useGoal";
import AddGoalDialog from "../../goals/UpdateGoal";

type AnalysisViewProps = {
    entryDetails: {
        transcript: string;
        ai_summary: string;
        mood_labels: { [key: string]: number };
        suggestions: string;
        reflections: string;
        tags: string[];
        goals: string | null;
        isGoalAdded?: boolean;
        status: string;
    };
};
interface GoalFormData {
    title: string,
    description: string,
    targetDate: string,
    entryId?: string
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ entryDetails }) => {
    const entryId = useEntryID();
    const queryClient = useQueryClient();

    const [isAddGoalDialogOpen, setAddGoalDialogOpen] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const { mutate: addGoal, isPending } = useAddGoal();

    const { mutate: refetchMutation } = useRefetchAnalysis();

    useEffect(() => {
        if (entryDetails.status === 'completed') return;

        const socket = io(SOCKET_URL);
        socket.emit('join_entry', entryId);

        socket.on('entry_update', (payload) => {
            queryClient.setQueryData(['diaryEntry', entryId], (oldData: AnalysisViewProps) => {
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
            socket.off('entry_update');
            socket.disconnect();
        };
    }, [entryId, entryDetails?.status, queryClient]);

    const handleRefetch = (e: React.MouseEvent) => {
        e.stopPropagation();

        queryClient.setQueryData(['diaryEntry', entryId], (oldData: AnalysisViewProps) => ({
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

    const handleAddGoal = (payload: GoalFormData) => {
        payload = {...payload, entryId: entryId}
        addGoal(payload, {
            onSuccess: () => {
                toast.success("Goal added");
                queryClient.invalidateQueries({ queryKey: ['diaryEntry', entryId] });
                setAddGoalDialogOpen(false);
            },
            onError: (err) => {
                toast.error(err.message || "Failed adding goal");
            }
        })
    }

    if (entryDetails.status === 'processing') return <AiLoader />;

    const isIncomplete =
        !entryDetails?.ai_summary ||
        !entryDetails?.mood_labels ||
        !entryDetails?.tags ||
        !entryDetails?.suggestions ||
        !entryDetails?.reflections || !entryDetails?.goals || entryDetails.status === 'failed';

    const hasValidGoal = entryDetails.goals && entryDetails.goals.toLowerCase().trim() !== "None detected";

    return (
        <>
            <div className="space-y-6 animate-fade-in mx-auto">
                {/* Header Section: Moods, Tags, Retry */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {entryDetails?.mood_labels && Object.keys(entryDetails?.mood_labels).length > 0 ? (
                                Object.keys(entryDetails?.mood_labels).map((m) => (
                                    <Badge
                                        key={m}
                                        variant="outline"
                                        className="px-3 py-1 text-sm border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    >
                                        {entryDetails.mood_labels[m]}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground italic">Mood not detected</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="w-4 h-4" />
                            {entryDetails?.tags && Object.keys(entryDetails?.tags).length > 0 ? (
                                Object.entries(entryDetails?.tags).map(([key, value]) => (
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
                            title={`This will attempt to regenerate missing data`}
                        >
                            <RotateCw className="w-3.5 h-3.5 mr-2" />
                            Retry Analysis
                        </Button>
                    )}
                </div>

                {/* Summary Section */}
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

                {/* Grid Section: Reflections & Suggestions */}
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

                {hasValidGoal && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-base flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                <Target className="w-4 h-4" />
                                Goal Detected
                            </h3>
                            <p className="text-emerald-700/80 dark:text-emerald-300/80 text-sm italic">
                                &quot;{entryDetails.goals}&quot;
                            </p>
                        </div>

                        {entryDetails.isGoalAdded ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shrink-0 px-3 py-1.5">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Added to Goals
                            </Badge>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => setAddGoalDialogOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add to Goals
                            </Button>
                        )}
                    </div>
                )}

                {/* Transcript Section */}
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

            <AddGoalDialog
                open={isAddGoalDialogOpen}
                onOpenChange={setAddGoalDialogOpen}
                initialData={{ title: "Untitled Goal", description: entryDetails.goals || "" }}
                onGoalUpdate={(payload) => handleAddGoal(payload)}
                isPending={isPending}
                isGoalUpdate={false}
            />
        </>
    );
};

export default AnalysisView;
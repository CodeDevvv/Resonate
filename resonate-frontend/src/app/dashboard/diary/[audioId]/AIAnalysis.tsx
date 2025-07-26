"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

import AiLoader from "@/components/AiLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Bot, Smile, Tag, Target } from "lucide-react";

import { useApi } from "@/userQueries/userQuery";
import { useAuth } from "@clerk/nextjs";
import { AddGoalDialog } from "./AddGoal";

interface AIAnalysisProps {
    transcript: string;
    audioId: string;
}

type AnalysisResult = {
    ai_summary: string;
    mood: { [key: string]: number };
    suggestions: string;
    reflections: string;
    tags: string[];
    goal: string | null;
};

const AIAnalysis: React.FC<AIAnalysisProps> = ({ transcript, audioId }) => {
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const { getToken } = useAuth();
    const API_URL = useApi()

    const [isGoalDetectedDialogOpen, setIsGoalDetectedDialogOpen] = useState(false);
    const [isAddGoalDialogOpen, setAddGoalDialogOpen] = useState(false);

    const runAnalysis = useCallback(async () => {
        if (!transcript) return;
        setIsLoadingAnalysis(true);
        setAnalysisError(null);
        try {
            const token = await getToken();
            const response = await axios.post(`${API_URL}/audio/runAnalysis?audioId=${audioId}`,
                { transcript },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.status) {
                setAnalysisResult(response.data.analysis);
                console.log(response.data.analysis)
            } else {
                setAnalysisError(response.data.message || "Failed to get analysis.");
                toast.error(response.data.message);
            }
        } catch (error) {
            const errorMessage = "A network error occurred while processing your entry.";
            setAnalysisError(errorMessage);
            toast.error("Could not analyze the transcript.");
            console.log(error)
        } finally {
            setIsLoadingAnalysis(false);
        }
    }, [transcript, getToken, API_URL, audioId]);

    useEffect(() => {
        runAnalysis();
    }, [runAnalysis]);

    useEffect(() => {
        if (analysisResult?.goal) {
            setIsGoalDetectedDialogOpen(true);
        }
    }, [analysisResult]);

    const handleAddGoalClick = () => {
        setIsGoalDetectedDialogOpen(false);
        setAddGoalDialogOpen(true);
    };

    if (isLoadingAnalysis) return <AiLoader label="Analyzing your entry..." />;

    if (analysisError) {
        return (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-6 text-center shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Analysis Failed</h3>
                <p className="text-sm mb-4">{analysisError}</p>
                <Button onClick={runAnalysis} className="bg-destructive text-destructive-foreground text-red hover:bg-destructive/90">
                    Try Again
                </Button>
            </div>
        );
    }

    if (analysisResult) {
        return (
            <>
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-muted/50 rounded-xl px-6 py-4">
                        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Bot className="w-5 h-5 text-primary" />AI Generated Summary</h2>
                        <p className="text-muted-foreground text-base">{analysisResult.ai_summary}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-2"><Smile className="w-5 h-5 text-yellow-400" />
                            {analysisResult.mood && Object.keys(analysisResult.mood).map(m => (
                                <Badge key={m} variant="outline" className="border-yellow-400 text-yellow-500">{analysisResult.mood[m]}</Badge>
                            ))}
                        </div>
                        <div className="flex items-center gap-2"><Tag className="w-5 h-5 text-primary/80" />
                            {analysisResult.tags.map(tag => (<Badge key={tag} variant="secondary">{tag}</Badge>))}
                        </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-6 py-4">
                        <h2 className="text-lg font-semibold mb-2">Reflection & Suggestion</h2>
                        <p className="text-muted-foreground text-base"><strong>Suggestion:</strong> {analysisResult.suggestions}</p>
                        <p className="text-muted-foreground text-base mt-2"><strong>Reflection:</strong> {analysisResult.reflections}</p>
                    </div>
                </div>

                <Dialog open={isGoalDetectedDialogOpen} onOpenChange={setIsGoalDetectedDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Target className="w-6 h-6 text-primary" /> We&apos;ve Detected a Goal!
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-muted-foreground mb-4">Your entry seems to mention the following goal:</p>
                            <p className="font-semibold p-3 bg-muted rounded-md italic">&quot;{analysisResult.goal}&quot;</p>
                            <p className="text-muted-foreground mt-4">Would you like to add this to your goals?</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGoalDetectedDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddGoalClick}>Add Goal</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AddGoalDialog
                    open={isAddGoalDialogOpen}
                    onOpenChange={setAddGoalDialogOpen}
                    initialData={{ title: analysisResult.goal || "", desc: analysisResult.goal || "" }}
                    audioId={audioId}
                />
            </>
        );
    }

    return null;
};

export default AIAnalysis;
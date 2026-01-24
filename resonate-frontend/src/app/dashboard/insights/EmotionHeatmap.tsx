"use client";

import AiLoader from '@/components/AiLoader';
import { useHeatmapData } from '@/userQueries/userQuery';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { ResponsiveCalendar } from "@nivo/calendar";
import toast from 'react-hot-toast';

interface NivoHeatmapData {
    day: string;
    value: number;
}

const EmotionHeatmap = () => {
    const { getToken } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [processedData, setProcessedData] = useState<NivoHeatmapData[]>([]);

    useEffect(() => {
        async function fetchToken() {
            const fetchedToken = await getToken();
            setToken(fetchedToken);
        }
        fetchToken();
    }, [getToken]);

    const { data: rawHeatmapData, error: dataError, isLoading } = useHeatmapData(token);

    useEffect(() => {
        if (rawHeatmapData) {
            interface RawHeatmapEntry {
                day: string;
                moods: Record<string, number>;
            }

            const transformedData = (rawHeatmapData as RawHeatmapEntry[]).map((entry: RawHeatmapEntry): NivoHeatmapData => {
                const moods: Record<string, number> | undefined = entry.moods;
                const dominantMoodScore: number = moods ? Math.max(...Object.values(moods)) : 0;

                return {
                    day: entry.day,
                    value: dominantMoodScore,
                };
            });
            setProcessedData(transformedData);
        }
    }, [rawHeatmapData]);

    if (isLoading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <AiLoader label="Loading heatmap..." />
            </div>
        );
    }

    if (dataError) {
        toast.error(dataError.message);
        return (
            <div className="h-48 flex items-center justify-center text-destructive">
                Error: Could not load heatmap data.
            </div>
        );
    }

    if (processedData.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
                Not enough data to display heatmap.
            </div>
        );
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const fromDate = `${currentYear}-01-01`;
    const toDate = `${currentYear}-12-31`;

    return (
        <div className="h-48">
            <ResponsiveCalendar
                data={processedData}
                from={fromDate}
                to={toDate}
                emptyColor="hsl(var(--muted) / 0.15)"
                colors={['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']}
                margin={{ top: 20, right: 0, bottom: 0, left: 20 }}
                monthBorderColor="transparent"
                dayBorderWidth={2}
                dayBorderColor="hsl(var(--background))"
                legends={[]}
            />
        </div>
    );
};

export default EmotionHeatmap;
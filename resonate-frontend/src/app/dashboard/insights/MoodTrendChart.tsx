"use client";

import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartData } from '../../../userQueries/userQuery';
import AiLoader from '@/components/AiLoader';

const MoodTrendChart = () => {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  interface ProcessedData {
    date: string;
    "Net Mood": number;
  }
  const [moodTrendData, setMoodTrendData] = useState<ProcessedData[]>([]);

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken();
      setToken(fetchedToken);
    };
    fetchToken();
  }, [getToken]);

  const { data: chartData, error: chartError, isLoading } = useChartData(token);

  useEffect(() => {
    if (chartData) {
      interface MoodScores {
        joy: number;
        love: number;
        calm: number;
        sadness: number;
        anger: number;
        fear: number;
      }

      interface ChartEntry {
        created_at: string;
        mood_scores?: MoodScores;
      }

      interface ProcessedData {
        date: string;
        "Net Mood": number;
      }

      const processedData: ProcessedData[] = (chartData as ChartEntry[]).map((entry: ChartEntry) => {
        const moods = entry.mood_scores;
        const netScore = moods
          ? (moods.joy + moods.love + moods.calm) - (moods.sadness + moods.anger + moods.fear)
          : 0;

        return {
          date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          "Net Mood": netScore,
        };
      });
      setMoodTrendData(processedData.reverse());
    }
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <AiLoader label="Loading data..." />
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="h-48 flex items-center justify-center text-destructive">
        Error: Could not load chart data.
      </div>
    );
  }

  if (moodTrendData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        Not enough data to display trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={moodTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
        />
        <Area
          type="monotone"
          dataKey="Net Mood"
          strokeWidth={2}
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MoodTrendChart;
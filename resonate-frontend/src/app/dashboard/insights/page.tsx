"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useInsights } from "@/hooks/use-insights";
import MoodTrendChart from "@/components/insights/MoodTrendChart";
import FrequentTopics from "@/components/insights/FrequentTopics";
import EmotionHeatmap from "@/components/insights/EmotionHeatmap";

const Insights = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading, isError } = useInsights()
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen space-y-8 p-8 pb-20 md:ml-72">

      <header className="flex flex-col space-y-2">
        <h1 className="font-rampart flex items-center gap-3 text-4xl font-extrabold tracking-tight text-primary">
          <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-500/20" />
          AI Insights Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Your personal analytics, powered by AI. Visualize your moods, emotions, and journaling trends.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoodTrendChart data={data?.chartData || []} isLoading={isLoading} isError={isError} />
        </div>
        <div className="lg:col-span-1">
          <FrequentTopics data={data?.topics} isLoading={isLoading} isError={isError} />
        </div>
        <div className="lg:col-span-3">
          <EmotionHeatmap data={data?.heatmapData} isLoading={isLoading} isError={isError} />
        </div>
      </div>
    </div>
  );
};

export default Insights;
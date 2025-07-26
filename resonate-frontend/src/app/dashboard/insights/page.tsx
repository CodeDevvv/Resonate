"use client";
import React, { useEffect, useState } from "react";
import { LineChart, Flame, BarChart3, ListOrdered } from "lucide-react";
import { Card } from "@/components/ui/card";
import MoodTrendChart from "./MoodTrendChart";
import EmotionHeatmap from "./EmotionHeatmap";
import FrequentTopics from "./FrequentTopics";

const Insights = () => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) {
    return null
  }


  return (
    <div className="max-w-full mx-auto p-8 space-y-10 mt-6 ml-72">
      {/* Heading */}
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-rampart mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-accent" />
          AI Insights Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Your personal analytics, powered by AI. Visualize your moods, emotions, and journaling trends.
        </p>
      </header>

      {/* Mood Trend Line */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <LineChart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Mood Trend (Last 7 Days)</h2>
        </div>
        <MoodTrendChart />
      </Card>

      {/* Emotion Heatmap */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Emotion Heatmap</h2>
        </div>
        <EmotionHeatmap />
      </Card>

      {/* Topic Frequency Chart */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <ListOrdered className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Topic Frequency (Last 7 days)</h2>
        </div>
        <FrequentTopics />
      </Card>

    </div>
  );
};

export default Insights;

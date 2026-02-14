import React, { useMemo } from 'react';
import { ResponsiveCalendar } from "@nivo/calendar";
import AiLoader from '@/components/AiLoader';

interface RawHeatmapEntry {
  day: string;
  moods: Record<string, number>;
}

interface EmotionHeatmapProps {
  data?: RawHeatmapEntry[]; 
  isLoading: boolean
  isError: boolean;
}

const EmotionHeatmap = ({ data, isLoading, isError }: EmotionHeatmapProps) => {

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((entry: RawHeatmapEntry) => {
      const moods = entry.moods || {};
      const moodValues = Object.values(moods);
      
      const dominantMoodScore = moodValues.length > 0 ? Math.max(...moodValues) : 0;

      return {
        day: entry.day,
        value: Number(dominantMoodScore.toFixed(2)),
      };
    });
  }, [data]);

  const { fromDate, toDate } = useMemo(() => {
    const year = new Date().getFullYear();
    return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border bg-card/50">
        <AiLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
        <p>Could not load heatmap data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col space-y-1">
        <h3 className="font-semibold leading-none tracking-tight">Mood Consistency</h3>
        <p className="text-sm text-muted-foreground">
          Your emotional intensity tracked over the current year.
        </p>
      </div>

      <div className="h-[200px] w-full">
        {processedData.length > 0 ? (
          <ResponsiveCalendar
            data={processedData}
            from={fromDate}
            to={toDate}
            emptyColor="var(--muted)" 
            colors={[
              '#dcfce7', // Very light green
              '#86efac', 
              '#4ade80', 
              '#22c55e', 
              '#15803d'  // Dark green
            ]}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            yearSpacing={40}
            monthBorderColor="transparent"
            dayBorderWidth={2}
            dayBorderColor="var(--card)" 
            
            tooltip={({ day, value, color }) => (
              <div
                className="rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <span className="font-semibold">{day}</span>: Intensity {value}
              </div>
            )}
            
            theme={{
              text: { 
                fill: "var(--foreground)",
                fontSize: 12,
              },
              tooltip: { 
                container: { 
                  background: "var(--popover)", 
                  color: "var(--popover-foreground)",
                  fontSize: "12px"
                } 
              }
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No mood data recorded yet for this year.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionHeatmap;
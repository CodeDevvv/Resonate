import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import AiLoader from '../shared/AiLoader';

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
  fullDate: string;
  netMood: number;
}

interface propsType {
  data: ChartEntry[],
  isLoading: boolean,
  isError: boolean
}

const MoodTrendChart = ({ data, isLoading, isError }: propsType) => {

  const moodTrendData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const processed = data.map((entry: ChartEntry) => {
      const moods = entry.mood_scores || { joy: 0, love: 0, calm: 0, sadness: 0, anger: 0, fear: 0 };
      const netScore = (moods.joy + moods.love + moods.calm) - (moods.sadness + moods.anger + moods.fear);
      const dateObj = new Date(entry.created_at);

      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }),
        netMood: Number(netScore.toFixed(2)),
      };
    });

    return processed.reverse();
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border bg-card/50">
        <AiLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
        <p>Could not load mood trends.</p>
      </div>
    );
  }

  if (moodTrendData.length === 0) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl border bg-card p-6 text-center shadow-sm">
        <h3 className="mb-1 font-semibold">No Trends Yet</h3>
        <p className="text-sm text-muted-foreground">
          Journal more often to see your emotional trajectory.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col space-y-1">
        <h3 className="font-semibold leading-none tracking-tight">Emotional Trajectory</h3>
        <p className="text-sm text-muted-foreground">
          Net positivity calculated over time.
        </p>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={moodTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)' }}
              minTickGap={30}
            />

            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)' }}
            />

            <ReferenceLine
              y={0}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              opacity={0.5}
            />

            <Tooltip
              cursor={{ stroke: 'var(--primary)', strokeWidth: 2 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ProcessedData;
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
                      <p className="mb-1 text-xs text-muted-foreground">{data.fullDate}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-popover-foreground">
                          Net Mood: {data.netMood}
                        </span>
                        <span className={`text-xs font-medium ${data.netMood > 0 ? 'text-green-500' :
                          data.netMood < 0 ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                          {data.netMood > 0.5 ? '(Positive)' :
                            data.netMood < -0.5 ? '(Negative)' : '(Neutral)'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="netMood"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMood)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MoodTrendChart;
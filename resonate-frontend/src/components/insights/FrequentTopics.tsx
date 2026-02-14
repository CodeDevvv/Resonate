import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import AiLoader from "../shared/AiLoader";

interface TopicItem {
    topic: string;
    count: number;
}
interface propsType {
    data: TopicItem[],
    isLoading: boolean,
    isError: boolean
}

const FrequentTopics = ({ data, isLoading, isError }: propsType) => {
    if (isLoading) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center rounded-xl border bg-card/50">
                <AiLoader />
            </div>
        );
    }
    if (isError) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
                <p>Could not load frequent topics.</p>
            </div>
        );
    }
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-xl border bg-card p-6 text-center shadow-sm">
                <h3 className="mb-1 font-semibold">No Topics Found</h3>
                <p className="text-sm text-muted-foreground">
                    Start journaling to see what themes appear most often.
                </p>
            </div>
        );
    }

    const chartHeight = Math.max(data.length * 50, 250);

    return (
        <div className="flex flex-col space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col space-y-1">
                <h3 className="font-semibold leading-none tracking-tight">Recurring Themes</h3>
                <p className="text-sm text-muted-foreground">
                    The subjects you discuss most frequently.
                </p>
            </div>

            <div style={{ width: '100%', height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                        <XAxis type="number" hide />

                        <YAxis
                            dataKey="topic"
                            type="category"
                            width={100}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
                            tickFormatter={(value) =>
                                value.length > 12 ? `${value.slice(0, 12)}...` : value
                            }
                        />

                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <span className="font-semibold text-popover-foreground">
                                                    {payload[0].payload.topic}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    : {payload[0].value} entries
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Bar
                            dataKey="count"
                            radius={[4, 4, 4, 4]}
                            barSize={32}
                            background={{ fill: 'var(--muted)', radius: 4 }}
                        >
                            {data.map((entry, index: number) => (
                                <Cell key={`cell-${index}`} fill="var(--primary)" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FrequentTopics;
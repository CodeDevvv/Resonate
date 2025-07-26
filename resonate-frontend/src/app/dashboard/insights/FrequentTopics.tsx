"use client";

import AiLoader from '@/components/AiLoader';
import { useFrequentTopics } from '@/userQueries/userQuery';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FrequentTopics = () => {
    const { getToken } = useAuth();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const fetchedToken = await getToken();
            setToken(fetchedToken);
        };
        fetchToken();
    }, [getToken]);

    const { data: topics, error: isError, isLoading } = useFrequentTopics(token);

    if (isLoading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <AiLoader label="Loading topics..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-48 flex items-center justify-center text-destructive">
                Error: Could not load frequent topics.
            </div>
        );
    }

    if (!topics || topics.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
                Not enough data to display topics.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                layout="vertical"
                data={topics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="topic"
                    type="category"
                    width={80}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                    }}
                />
                <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    background={{ fill: 'hsl(var(--muted) / 0.1)', radius: 4 }}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default FrequentTopics;
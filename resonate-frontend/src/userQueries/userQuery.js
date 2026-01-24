import API_URL from "@/components/utils/getApiUrl";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useDiaryEntries = (page, pageSize) => {
    return useQuery({
        queryKey: ['diaryEntries', page],
        queryFn: async () => {
            const response = await axios.get(
                `${API_URL}/entries/getEntriesList?page=${pageNum}&pagesize=${pageSize}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            return response.data
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    })
}

export const useChartData = (token) => {
    return useQuery({
        queryKey: ['chartData', token],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/insights/getChartData`, { headers: { Authorization: `Bearer ${token}` } });
            const { status, message, chartData } = response.data;
            if (status) { return chartData; }
            throw new Error(message);
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000
    });
};

export const useHeatmapData = (token) => {
    return useQuery({
        queryKey: ['HeatMapData', token],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/insights/getHeatmapData`, { headers: { Authorization: `Bearer ${token}` } })
            const { status, message, heatmapData } = response.data
            if (status) { return heatmapData }
            throw new Error(message)
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000
    })
}

export const useFrequentTopics = (token) => {
    return useQuery({
        queryKey: ['frequentTopicsData', token],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/insights/getFrequentTopics`, { headers: { Authorization: `Bearer ${token}` } })
            const { status, message, tags } = response.data
            if (status) {
                return tags
            } else {
                throw new Error(message)
            }
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000
    })
}

export const useThougtofTheDay = () => {
    const today = new Date().toISOString().split('T')[0];
    return useQuery({
        queryKey: ['thought', today],
        queryFn: () =>
            fetch(`${API_URL}/quotes/getDailyQuote`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                }),
        staleTime: 24 * 60 * 60 * 1000
    })
}

export const useGoals = (token) => {
    return useQuery({
        queryKey: ['Goals', token],
        queryFn: async () => {
            const response = await axios.get(`${API_URL}/goals/getGoals`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const { status, message, goals } = response.data
            if (status) {
                return goals
            }
            throw new Error(message)
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000
    })
}
// TanStack Query for Audio Entry

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/lib/getApiUrl";
import { useEntryID } from "@/context/EntryContext";

// Fetch Entry Details
export const useFetchEntry = () => {
    const entryId = useEntryID();
    const { getToken } = useAuth();
    return useQuery({
        queryKey: ['diaryEntry', entryId],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/entries/getEntryById?entryId=${entryId}`, {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });
            if (!data.status) throw new Error(data.message || "Failed to fetch");
            return data;
        },
        enabled: !!entryId,
        staleTime: 5 * 60 * 1000
    });
}

// reFetch Analysis
export const useRefetchAnalysis = () => {
    const { getToken } = useAuth();
    const entryId = useEntryID();
    return useMutation({
        mutationFn: async () => {
            const { data } = await axios.get(`${API_URL}/entries/reanalyzeEntry`, {
                params: { entryId: entryId },
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            return data;
        }
    });
}

// Update Title
export const useUpdateTitle = () => {
    const { getToken } = useAuth();
    const entryId = useEntryID();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (title: string) => {
            const { data } = await axios.patch(`${API_URL}/entries/updateTitle?entryId=${entryId}`,
                { newTitle: title.trim() },
                { headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` } }
            )
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaryEntry', entryId] })
            queryClient.invalidateQueries({ queryKey: ['diaryEntries'] })
        }
    })
}



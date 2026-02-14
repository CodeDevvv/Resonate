// TanStackQueries Realted to Diary and it's Entries
import { API_URL } from "@/lib/getApiUrl";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

// To Fetch Diary Entries
export const useGetDiaryEntries = (page: number, pageSize: number,) => {
    const { getToken } = useAuth()
    return useQuery({
        queryKey: ['diaryEntries', page],
        queryFn: async () => {
            const response = await axios.get(
                `${API_URL}/entries/getEntriesList?page=${page}&pagesize=${pageSize}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${await getToken()}`
                    }
                }
            );
            if (!response.data.status) {
                throw new Error(response.data.message || "Failed to fetch");
            }
            return response.data
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    });
}

export const useDeleteEntry = () => {
    const { getToken } = useAuth()
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (entryId: string) => {
            const response = await axios.delete(`${API_URL}/entries/deleteEntry?entryId=${entryId}`, {
                headers: { "Authorization": `Bearer ${await getToken()}` }
            });
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaryEntries'] })
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const message = error.response?.data?.message || "Failed to delete entry. Please try again.";
            toast.error(message);
        }
    })
}

export const useSaveEntry = (setIsloading: (val: boolean) => void) => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (formdata: FormData) => {
            const response = await axios.post(`${API_URL}/entries/createEntry`, formdata, {
                headers: {
                    'Content-Type': "multipart/form-data",
                    'Authorization': `Bearer ${await getToken()}`
                }
            })
            return response.data
        },
        onMutate: () => {
            setIsloading(true)
        },
        onSettled: () => {
            setIsloading(false)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaryEntries'] })
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const message = error.response?.data?.message || "Server Error";
            toast.error(message);
        }
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
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/components/utils/getApiUrl";

interface GoalFormData {
    title: string,
    description: string,
    targetDate: string,
    entryId?: string
}

export const useAddGoal = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: GoalFormData) => {
            const { data } = await axios.post(`${API_URL}/goals/addGoal`, payload, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goalEntries'] });
        }
    })
}

export const useFetchGoal = () => {
    const { userId, getToken } = useAuth();
    return useQuery({
        queryKey: ['goalEntries', userId],
        queryFn: async () => {
            const token = await getToken();
            if (!token) {
                throw new Error("No authentication token found");
            }
            const response = await axios.get(`${API_URL}/goals/getGoals`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { status, message, goalEntries } = response.data;
            if (status) {
                return goalEntries;
            }

            throw new Error(message || "Failed to fetch goals");
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};


export const useUpdateGoal = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: GoalFormData) => {
            const { data } = await axios.put(`${API_URL}/goals/updateGoal`, payload, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`
                }
            })
            if (data.status) {
                return data;
            }

            throw new Error()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goalEntries'] });
        }
    })
}


export const useDeleteGoal = () => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (goalId: string) => {
            const { data } = await axios.delete(`${API_URL}/goals/deleteGoal?goalId=${goalId}`, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`
                }
            })

            const { status } = data
            if (!status) {
                throw new Error()
            }
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goalEntries'] });
        }
    })

}
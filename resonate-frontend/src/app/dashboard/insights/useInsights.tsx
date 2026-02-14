import { API_URL } from "@/components/utils/getApiUrl"
import { useAuth } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const useInsights = () => {
    const { userId, getToken } = useAuth()
    return useQuery({
        queryKey: ['Insights', userId],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/insights/getInsights`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (!data.status) {
                throw new Error()
            }
            return data.insights;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000
    })
}
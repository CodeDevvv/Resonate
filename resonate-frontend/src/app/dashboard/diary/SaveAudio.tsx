import React from 'react'
import { Save } from 'lucide-react';
import axios from 'axios'
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/Contexts/LoadingContexts';
import { useApi } from '@/userQueries/userQuery';

interface AudioProps {
    audio: Blob
}

const SaveAudio = ({ audio }: AudioProps) => {
    const { getToken } = useAuth();
    const router = useRouter()
    const API_URL = useApi()
    const { setIsLoading, isLoading } = useLoading()
    const saveRecording = async () => {
        const token = await getToken();
        if (!audio || !token) return;

        const file = new File([audio], 'audio.wav', { type: 'audio/wav' });
        const formdata = new FormData()
        formdata.append('audio', file)
        setIsLoading(true)


        try {
            const response = await axios.post(`${API_URL}/audio/saveAudio`, formdata, {
                headers: {
                    'Content-Type': "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.data.status) {
                router.push(`/dashboard/diary/${response.data.audioID}`)
                setIsLoading(false)
                toast.success(response.data.message)
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error("Server request failed. Please retry")
        }
        finally {
            setIsLoading(false)
        }
    };

    return (
        <div>
            {
                isLoading
                    ?
                    <button
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors'
                    }`}
                        aria-label="Save recording"
                        disabled
                    >
                        <Save className="w-4 h-4" />
                        <span>Saving...</span>
                    </button>
                    :
                    <button
                        onClick={saveRecording}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors'
                    }`}
                        aria-label="Save recording"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                    </button>
            }
        </div>

    );
};

export default SaveAudio;

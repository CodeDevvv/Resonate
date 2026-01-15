"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AudioEntry from "./AudioEntry";
import EditTitle from "./EditTitle";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from 'react-hot-toast';
import { useApi } from "@/userQueries/userQuery";
import AIAnalysis from "./AIAnalysis";
import { useQuery } from "@tanstack/react-query";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { useAudioID } from "./AudioIDContext";

const DiaryEntry = () => {
  const API_URL = useApi()
  const id = useAudioID()
  const { getToken } = useAuth();

  const [showTranscript, setShowTranscript] = useState(false);
  const [isProcessingAnalysis, setIsProccessingAnalysis] = useState(false)
  const [isProcessingTranscription, setIsProccessingTranscription] = useState(false)


  const { data, isLoading, refetch, isFetching, error, isError } = useQuery({
    queryKey: ['audioEntry', id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/audio/fetchEntryDetails?audioID=${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (response.data.status === false) {
        throw new Error(response.data.message || "Failed to fetch");
      }

      return response.data
    },
    staleTime: 5 * 60 * 1000
  })

  if (isError) {
    toast.error(error.message)
  }

  const handleRefetch = async (refetchTranscription: boolean) => {
    if (refetchTranscription) {
      setIsProccessingTranscription(true)
      setIsProccessingAnalysis(true)
    } else {
      setIsProccessingAnalysis(true)
    }
    try {
      const response = await axios.get(`${API_URL}/diary/refetchAnalysis/audioID=${id}`,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (response.data.status) {
        refetch()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error("Internal Server Error")
      console.log(`Internal Server Error: ${error}`)
    } finally {
      setIsProccessingTranscription(false)
      setIsProccessingAnalysis(false)
    }
  }

  return (
    <div className="ml-80 mr-10 mx-auto mt-8 bg-card rounded-2xl shadow-lg p-8 space-y-6">
      {
        isLoading ?
          (<FullscreenLoader />)
          :
          (
            <>
              {data && <EditTitle titleprop={data.entryDetails.title} />}
              <AudioEntry />

              <div className="bg-muted/50 rounded-xl px-6 py-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowTranscript(!showTranscript)}
                >
                  <h2 className="text-lg font-semibold">Transcript</h2>
                  {
                    data?.entryDetails.transcript ?
                      (
                        <Button size="icon" variant="ghost">
                          {showTranscript ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                      ) :
                      (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRefetch(true)
                          }
                          }
                          className="text-red-600"
                          disabled={isLoading || isFetching || isProcessingAnalysis || isProcessingTranscription}
                          title="Refetch Transcription"
                        >
                          <RotateCw className={`w-4 h-4 ${isFetching || isProcessingTranscription ? "animate-spin" : ""}`} />
                        </Button>
                      )
                  }
                </div>
                {showTranscript && (
                  <p className="text-muted-foreground text-base mt-4 leading-relaxed">
                    {data?.entryDetails.transcript || "Transcription failed to generate. Please retry."}
                  </p>
                )}
              </div>
              {/* {data?.entryDetails.transcript && <AIAnalysis transcript={data?.entryDetails.transcript} audioId={id} />} */}
            </>
          )

      }

    </div>
  );
};

export default DiaryEntry;
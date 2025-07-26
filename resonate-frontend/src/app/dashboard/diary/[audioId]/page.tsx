"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AudioEntry from "./AudioEntry";
import EditTitle from "./EditTitle";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useLoading } from "@/components/Contexts/LoadingContexts";
import axios from "axios";
import toast from 'react-hot-toast';
import { useApi } from "@/userQueries/userQuery";
import AIAnalysis from "./AIAnalysis";

const DiaryEntry = () => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");

  const { getToken } = useAuth();
  const params = useParams();
  const id = params.audioId as string;
  const { setIsLoading } = useLoading();

  const API_URL = useApi()

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await axios.get(`${API_URL}/audio/fetchDetails?audioID=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status) {
          setTitle(response.data.record.title);
          setTranscript(response.data.record.transcript);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Failed to fetch diary entry:", error);
        toast.error("An error occurred while fetching the entry.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, getToken, setIsLoading, API_URL]);


  return (
    <div className="max-w-4xl ml-80 mx-auto mt-8 bg-card rounded-2xl shadow-lg p-8 space-y-6">
      <EditTitle titleprop={title} />
      <AudioEntry />

      {transcript && (
        <div className="bg-muted/50 rounded-xl px-6 py-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            <h2 className="text-lg font-semibold">Transcript</h2>
            <Button size="icon" variant="ghost">
              {showTranscript ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
          {showTranscript && (
            <p className="text-muted-foreground text-base mt-4 leading-relaxed">
              {transcript}
            </p>
          )}
        </div>
      )}

      {transcript && <AIAnalysis transcript={transcript} audioId={id} />}

    </div>
  );
};

export default DiaryEntry;
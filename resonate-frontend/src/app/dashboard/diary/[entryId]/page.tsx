"use client";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { useEffect } from "react";
import toast from 'react-hot-toast';
import AnalysisView from "./AnalysisView";
import AudioEntry from "./AudioEntry";
import EditTitle from "./EditTitle";
import { useFetchEntry } from "./useEntry";

const DiaryEntry = () => {
  const { data, isLoading, isError, error } = useFetchEntry();
  useEffect(() => {
    if (isError && error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }, [isError, error]);

  return (
    <div className="ml-80 mr-10 mx-auto mt-8 bg-card rounded-2xl shadow-lg p-8 space-y-6">
      {
        isLoading ?
          <FullscreenLoader />
          :
          (data && (
            <>
              <EditTitle titleprop={data?.entryDetails.title} />
              <AudioEntry audioUrl={data?.entryDetails.audioUrl} entryTitle={data?.entryDetails.title} />
              <AnalysisView entryDetails={data?.entryDetails} />
            </>
          ))}
    </div>
  );
};

export default DiaryEntry;
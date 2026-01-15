import { Trash2, ExternalLink, NotebookPen, ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, Filter, Smile, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from 'react-hot-toast';;
import { useRouter } from "next/navigation";
import { confirm } from "./ConfirmDelete";
import { useApi } from "@/userQueries/userQuery";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function DiaryList() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient()

  const API_URL = useApi()
  const router = useRouter()

  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Fetch Diary Entries
  const { data, isLoading, isError, isPlaceholderData, refetch, isFetching } = useQuery({
    queryKey: ['diaryEntries', page],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/diary/fetchDairyEntries?page=${page}&pagesize=${pageSize}`,
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

  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteEntry = async (audioId: string, title: string) => {
    const confirmation = await confirm(
      {
        message: `Are you sure you want to delete? - ${title}`,
        show: true
      })
    if (confirmation) {
      deleteEntry(audioId)
    }
  };

  const { mutate: deleteEntry, isPending, isError: deleteError } = useMutation({
    mutationFn: async (audioId: string) => {
      const response = await axios.delete(`${API_URL}/diary/deleteEntry?id=${audioId}`, {
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


  const handleOpenEntry = (audioId: string) => {
    router.push(`/dashboard/diary/${audioId}`)
  };

  useEffect(() => {
    if (isError) {
      toast.error("Internal Server error. Please try again");
    }
  }, [isError, data]);

  return (
    <div className="space-y-6 w-full">                                           
      <h1 className="text-4xl font-extrabold tracking-tight text-primary font-rampart">
        Entries
      </h1>
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80"
          disabled={isLoading}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2" disabled={isLoading}>
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Smile className="w-4 h-4 mr-2 text-primary" />
              By Mood
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Tag className="w-4 h-4 mr-2 text-accent" />
              By Tag
            </DropdownMenuItem>
            <DropdownMenuItem
            >
              <ArrowUp className="w-4 h-4 mr-2 text-muted-foreground" />
              Sort by Date (Oldest First)
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowDown className="w-4 h-4 mr-2 text-muted-foreground" />
              Sort by Date (Newest First)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          hidden={!isError || !deleteError}
          title="Refresh entries"
        >
          <RotateCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {
        isLoading ?
          (<FullscreenLoader />)
          :
          data?.entries.length === 0 ?
            (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <NotebookPen className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">No Entries Yet</h2>
                <p className="text-muted-foreground">Tap on the plus icon to create your first diary entry.</p>
              </div>
            ) :
            (
              <div>
                <div
                  className={`flex flex-col divide-y divide-border rounded-xl overflow-hidden 
          shadow-lg bg-card ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}
                >
                  {data?.entries.map((entry: { audio_id: string, title: string, created_at: string }) => (
                    <div
                      key={entry.audio_id}
                      className="group flex items-center px-6 py-4 hover:bg-primary/5 transition-colors"
                    >
                      <div className="w-8 flex-shrink-0 flex items-center justify-center text-muted-foreground">
                        <NotebookPen className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0 ml-4">
                        <div className="text-lg font-semibold text-foreground truncate">
                          {entry.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Diary Entry • {entry.created_at.slice(0, 10)} - {
                            new Date(entry.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          }
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-200">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete"
                          onClick={() => handleDeleteEntry(entry.audio_id, entry.title)}
                          title="Delete"
                          disabled={isPending || isLoading}
                        >
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Open"
                          onClick={() => handleOpenEntry(entry.audio_id)}
                          title="Open"
                          disabled={isPending || isLoading}
                        >
                          <ExternalLink className="w-5 h-5 text-accent" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(old => Math.max(old - 1, 1))}
                    disabled={page === 1 || isLoading}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(old => old + 1)}
                    disabled={data?.entries.length < pageSize || isLoading || !data?.hasNext}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
      }

    </div>
  );
}
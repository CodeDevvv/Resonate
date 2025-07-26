import { Trash2, ExternalLink, NotebookPen, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, Filter, Smile, Tag } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLoading } from "@/components/Contexts/LoadingContexts";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from 'react-hot-toast';;
import { useRouter } from "next/navigation";
import { confirm } from "./ConfirmDelete";
import { useApi } from "@/userQueries/userQuery";

export default function DiaryList() {
  const { setIsLoading } = useLoading();
  const { getToken } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalRecords, setTotalRecords] = useState(0);
  const API_URL = useApi()
  const router = useRouter()
  type DiaryEntry = {
    audio_id: string;
    title: string;
    created_at: string;
  };

  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDiaryEntries = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Session Error!");
        return;
      }

      const response = await axios.get(
        `${API_URL}/diary/fetchDetails?page=${pageNum}&pagesize=${pageSize}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.data.status) {
        if (append) {
          setDiaryList(previousEntries => [...previousEntries, ...response.data.details]);
        } else {
          setDiaryList(response.data.details);
        }
        setTotalRecords(response.data.total);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      toast.error("Failed to fetch diary entries");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, setIsLoading, pageSize, API_URL]);

  useEffect(() => {
    fetchDiaryEntries(page);
  }, [fetchDiaryEntries, page]);

  const handleNextPage = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchDiaryEntries(nextPage, true);
  };

  const handlePrevPage = async () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      await fetchDiaryEntries(prevPage);
    }
  };

  const handleDeleteEntry = async (audioId: string, title: string) => {
    const confirmation = await confirm(
      {
        message: `Are you sure you want to delete? - ${title}`,
        show: true
      })
    if (confirmation) {
      try {
        setIsLoading(true);
        const token = await getToken();
        if (!token) {
          toast.error("Session Error!");
          return;
        }

        const response = await axios.delete(`${API_URL}/diary/deleteEntry?id=${audioId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.data.status) {
          setDiaryList(prev => prev.filter(entry => entry.audio_id !== audioId));
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
        toast.error("Failed to delete entry");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenEntry = (audioId: string) => {
    router.push(`/dashboard/diary/${audioId}`)
  };

  const filteredEntries = diaryList.filter(entry =>
    entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.created_at.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalRecords / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  if (diaryList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <NotebookPen className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">No Entries Yet</h2>
        <p className="text-muted-foreground">Tap on the plus icon to create your first diary entry.</p>
      </div>
    );
  }

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
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
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
              onClick={() => {
                setDiaryList(prev =>
                  [...prev].sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  )
                );
              }}
            >
              <ArrowUp className="w-4 h-4 mr-2 text-muted-foreground" />
              Sort by Date (Oldest First)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDiaryList(prev =>
                  [...prev].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )
                );
              }}
            >
              <ArrowDown className="w-4 h-4 mr-2 text-muted-foreground" />
              Sort by Date (Newest First)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-xl overflow-hidden shadow-lg bg-card">
        {filteredEntries.map((entry) => (
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
              >
                <Trash2 className="w-5 h-5 text-destructive" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Open"
                onClick={() => handleOpenEntry(entry.audio_id)}
                title="Open"
              >
                <ExternalLink className="w-5 h-5 text-accent" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={!hasPrevPage}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!hasNextPage}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
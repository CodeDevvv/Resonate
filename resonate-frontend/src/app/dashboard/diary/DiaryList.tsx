"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ExternalLink, Filter, NotebookPen, RotateCw, Search,
  Smile, Tag, Trash2
} from "lucide-react";
import toast from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FullscreenLoader } from "@/components/fullscreen-loader";

import { useDeleteEntry, useGetDiaryEntries } from "./useDiary";
import { confirm } from "./ConfirmDelete";

export default function DiaryList() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 5;

  const { data, isLoading, isError, isPlaceholderData, refetch, isFetching } = useGetDiaryEntries(page, pageSize);
  const { mutate: deleteEntry, isPending, isError: deleteError } = useDeleteEntry();

  useEffect(() => {
    if (isError) {
      toast.error("Internal Server error. Please try again");
    }
  }, [isError, data]);

  const handleOpenEntry = (entryId: string) => {
    router.push(`/dashboard/diary/${entryId}`);
  };

  const handleDeleteEntry = async (entryId: string, title: string) => {
    const confirmation = await confirm({
      message: `Are you sure you want to delete? - ${title}`,
      show: true
    });

    if (confirmation) {
      deleteEntry(entryId, {
        onSuccess: () => {
          toast.success(`"${title}" deleted successfully`);
        }
      });
    }
  };
  return (
    <div className="w-full mx-auto space-y-8 pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8">
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
            Entries
          </h1>
          <div className="h-1.5 w-12 bg-primary rounded-full mt-2 opacity-80" />
        </div>

        <div className="flex items-center gap-1 bg-background border border-border/60 p-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-32 md:w-48 pl-9 h-9 border-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:placeholder:text-primary/50"
              disabled={isLoading}
            />
          </div>

          <div className="h-5 w-px bg-border/80 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted" disabled={isLoading}>
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Smile className="w-4 h-4 mr-2 text-primary" />
                By Mood
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="w-4 h-4 mr-2 text-accent" />
                By Tag
              </DropdownMenuItem>
              <div className="my-1 h-px bg-muted" />
              <DropdownMenuItem>
                <ArrowUp className="w-4 h-4 mr-2 text-muted-foreground" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArrowDown className="w-4 h-4 mr-2 text-muted-foreground" />
                Newest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            hidden={!isError || !deleteError}
          >
            <RotateCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <FullscreenLoader />
        </div>
      ) : data?.entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
          <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            <NotebookPen className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">No Entries Found</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your journal is empty. Tap the plus icon to create your first memory.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`grid gap-4 ${isPlaceholderData ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {data?.entries.map((entry: { entryId: string, title: string, createdAt: string }) => (
              <div
                key={entry.entryId}
                onClick={() => handleOpenEntry(entry.entryId)}
                className="group relative flex items-center p-4 bg-card hover:bg-accent/5 border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/70 rounded-l-xl group-hover:bg-primary transition-colors" />

                <div className="ml-3 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  <NotebookPen className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 ml-4 mr-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {entry.title}
                    </h3>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground font-medium tracking-wide uppercase">
                    <span className="bg-muted px-2 py-0.5 rounded text-[10px]">
                      {entry.createdAt.slice(0, 10)}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(entry.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-background hover:text-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEntry(entry.entryId);
                    }}
                    title="Open"
                    disabled={isPending || isLoading}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.entryId, entry.title);
                    }}
                    title="Delete"
                    disabled={isPending || isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-6 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1 || isLoading}
              className="w-28 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => old + 1)}
              disabled={data?.entries.length < pageSize || isLoading || !data?.hasNext}
              className="w-28 shadow-sm"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
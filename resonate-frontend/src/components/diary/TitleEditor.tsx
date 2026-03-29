import { Button } from "@/components/ui/button";
import { useUpdateTitle } from "@/hooks/use-entry";
import axios from 'axios';
import { Pencil, RotateCw, Save, X } from "lucide-react";
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type TitleProps = {
  titleprop: string;
};

const EditTitle: React.FC<TitleProps> = ({ titleprop }) => {
  const [title, setTitle] = useState(titleprop);
  const [editingTitle, setEditingTitle] = useState(false);

  // Sync state if prop changes from parent
  useEffect(() => {
    setTitle(titleprop);
  }, [titleprop]);

  const { mutate: updateTitle, isPending } = useUpdateTitle();

  const handleUpdateTitle = () => {
    const trimmedTitle = title.trim();
    
    // If empty or unchanged, just close editing mode
    if (!trimmedTitle || trimmedTitle === titleprop) {
      handleCancel();
      return;
    }

    updateTitle(trimmedTitle, {
      onSuccess: () => {
        toast.success("Title updated successfully");
        setEditingTitle(false);
      },
      onError: (err) => {
        let message = "An unexpected error occurred";
        if (axios.isAxiosError(err)) {
          message = err.response?.data?.message || "Server error";
        } else if (err instanceof Error) {
          message = err.message;
        }
        toast.error(message);
      }
    });
  };

  const handleCancel = () => {
    setEditingTitle(false);
    setTitle(titleprop);
  };

  return (
    <div className="flex items-center space-x-3 min-h-[40px] group">
      {editingTitle ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            className="text-3xl font-bold bg-transparent border-b-2 border-primary outline-none flex-1 disabled:opacity-50 py-1"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUpdateTitle();
              }
              if (e.key === 'Escape') handleCancel();
            }}
            // Optional: saves on click-away
            // onBlur={handleUpdateTitle} 
          />
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
              className="hover:bg-destructive/10"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-destructive" />
            </Button>
            {isPending ? (
              <Button variant="ghost" size="icon" disabled>
                <RotateCw className="w-4 h-4 animate-spin" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleUpdateTitle}
                disabled={title.trim() === titleprop || !title.trim()}
              >
                <Save className="w-5 h-5 text-primary" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <h1 
            className="text-3xl font-bold flex-1 truncate cursor-pointer" 
            onClick={() => setEditingTitle(true)}
          >
            {titleprop}
          </h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditingTitle(true)}
            disabled={isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity" // Hidden until hover
          >
            {isPending ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default EditTitle;
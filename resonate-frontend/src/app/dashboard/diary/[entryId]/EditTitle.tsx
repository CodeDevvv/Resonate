import { Button } from "@/components/ui/button";
import axios from 'axios';
import { Pencil, RotateCw, Save, X } from "lucide-react";
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useUpdateTitle } from './useEntry';

type TitleProps = {
  titleprop: string
}

const EditTitle: React.FC<TitleProps> = ({ titleprop }) => {
  const [title, setTitle] = useState(titleprop)
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    setTitle(titleprop)
  }, [titleprop])

  const { mutate: updateTitle, isPending } = useUpdateTitle()

  const handleUpdateTitle = () => {
    if (!title.trim() || title === titleprop) {
      setEditingTitle(false);
      setTitle(titleprop);
      return;
    }

    updateTitle(title, {
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
    })
  }

  const handleCancel = () => {
    setEditingTitle(false);
    setTitle(titleprop);
  }

  return (
    <div className="flex items-center space-x-3 min-h-[40px]">
      {editingTitle ? (
        <>
          <input
            className="text-3xl font-bold bg-transparent border-b border-primary outline-none flex-1 disabled:opacity-50"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="w-5 h-5 text-muted-foreground" />
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
                disabled={title === titleprop || !title.trim()}
              >
                <Save className="w-5 h-5 text-primary" />
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold flex-1 truncate">{titleprop}</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditingTitle(true)}
            disabled={isPending}
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
  )
}

export default EditTitle;
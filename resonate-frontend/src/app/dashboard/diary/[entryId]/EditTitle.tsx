import { Button } from "@/components/ui/button";
import axios from 'axios';
import { Pencil, RotateCw, Save } from "lucide-react";
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

  const handleUpdateTitle = (title: string) => {
    setEditingTitle(false)
    updateTitle(title, {
      onSuccess: () => {
        toast.success("Title updated successfully");
      },
      onError: (err) => {
        let message = "An unexpected error occurred";

        if (axios.isAxiosError(err)) {
          message = err.response?.data?.message || "Server error";
        } else if (err instanceof Error) {
          message = err.message;
        }
        setEditingTitle(true)
        toast.error(message);
        setTitle(titleprop);
      }
    })
  }

  return (
    <div className="flex items-center space-x-3">
      {editingTitle ? (
        <>
          <input
            className="text-3xl font-bold bg-transparent border-b border-primary outline-none flex-1"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle(title);
              if (e.key === 'Escape') setEditingTitle(false);
            }}
          />
          {
            isPending ?
              (
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <RotateCw className="w-4 h-4 animate-spin" />
                </Button>
              ) : (
                <Button size="icon" variant="ghost" onClick={() => handleUpdateTitle(title)} aria-label="Save title" disabled={isPending || title === titleprop}>
                  <Save className="w-5 h-5 text-primary" />
                </Button>

              )
          }
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold flex-1">{title}</h1>
          <Button size="icon" variant="ghost" onClick={() => { setEditingTitle(true) }} aria-label="Edit title" hidden={isPending}>
            <Pencil className="w-5 h-5 text-muted-foreground" />
          </Button>
        </>
      )}
    </div>
  )
}

export default EditTitle
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Pencil, RotateCw, Save } from "lucide-react";
import { useAudioID } from './AudioIDContext';
import axios, { AxiosError } from 'axios';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { useApi } from '@/userQueries/userQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type TitleProps = {
  titleprop: string
}

const EditTitle: React.FC<TitleProps> = ({ titleprop }) => {
  const API_URL = useApi()
  const id = useAudioID()
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState(titleprop)
  const [editingTitle, setEditingTitle] = useState(false);


  useEffect(() => {
    setTitle(titleprop)
  }, [titleprop])

  const { mutate: handlesave, isPending } = useMutation({
    mutationFn: async (title: string) => {
      const response = await axios.patch(`${API_URL}/audio/setTitle?audioid=${id}`,
        { newtitle: title.trim() },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` } }
      )
      return response.data
    },
    onSuccess: () => {
      setEditingTitle(false)
      toast.success("Title Updated")
      queryClient.invalidateQueries({ queryKey: ['audioEntry', id] })
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setTitle(titleprop)
      const message = error.response?.data?.message || "Failed to delete entry. Please try again.";
      toast.error(message);
    }
  })

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
              if (e.key === 'Enter') handlesave(title);
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
                <Button size="icon" variant="ghost" onClick={() => handlesave(title)} aria-label="Save title" disabled={isPending || title === titleprop}>
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
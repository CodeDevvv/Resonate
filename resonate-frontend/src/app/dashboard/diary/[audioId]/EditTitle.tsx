import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Pencil, Save } from "lucide-react";
import { useAudioID } from './AudioIDContext';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { useLoading } from '@/components/Contexts/LoadingContexts';
import { toast } from 'react-toastify';
import { useApi } from '@/userQueries/userQuery';

type TitleProps = {
  titleprop: string
}

const EditTitle: React.FC<TitleProps> = ({ titleprop }) => {
  const API_URL = useApi()
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("")
  const id = useAudioID()
  const { getToken } = useAuth()
  const { setIsLoading } = useLoading()
  useEffect(() => {
    setTitle(titleprop)
  }, [titleprop])

  const handlesave = async () => {
    setIsLoading(true)
    setEditingTitle(false)
    const token = await getToken()
    if (!token || !id) {
      toast.error("Something Went Wrong!")
      return
    }

    await axios.patch(`${API_URL}/audio/setTitle?audioid=${id}`,
      { newtitle: title },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        if (res.data.status) { toast.success(res.data.message) }
        else { toast.error(res.data.message) }
      })
      .catch(err => { console.log(err) })
      .finally(() => { setIsLoading(false) })
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
          />
          <Button size="icon" variant="ghost" onClick={handlesave} aria-label="Save title">
            <Save className="w-5 h-5 text-primary" />
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold flex-1">{title}</h1>
          <Button size="icon" variant="ghost" onClick={() => { setEditingTitle(true) }} aria-label="Edit title">
            <Pencil className="w-5 h-5 text-muted-foreground" />
          </Button>
        </>
      )}
    </div>
  )
}

export default EditTitle
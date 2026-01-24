import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Plus, Save, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { validateTargetDate } from '../../../Validation/Vallidate.js'
import API_URL from '@/components/utils/getApiUrl';

const AddGoal = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    target_date: "",
  });
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const handleSave = async () => {

    if (!form.title || !form.target_date) {
      toast.error('Goal should have both title and target date')
      return;
    } else if (!(validateTargetDate(form.target_date))) {
      toast.error("Target date cannot be in past!")
      return;
    }
    const token = await getToken()
    axios.post(`${API_URL}/goals/addGoal`, form, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        const { status, message } = res.data
        if (status) {
          toast.success("Goal added!")
          queryClient.removeQueries({ queryKey: ['Goals', token] })
          setForm({
            title: "",
            desc: "",
            target_date: ""
          })
        } else {
          toast.error(message)
        }
      })
      .catch(err => {
        console.log(err)
        toast.error("unexpected error while adding goal")
      })
  }

  return (
    <div>
      <div className="flex justify-center mb-8">
        <Button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Manual Log
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-2xl p-8">
          <DialogTitle className="text-2xl font-bold mb-4">Add a New Goal</DialogTitle>
          <form className="space-y-4">
            <Input
              placeholder="Goal Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              required
            />
            <div className="flex gap-4">
              Goal target date:
              <Input
                type="date"
                placeholder="Goal target Date"
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddGoal
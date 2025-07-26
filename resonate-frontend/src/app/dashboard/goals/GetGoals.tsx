"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Edit, X, Save, Target, CheckCircle2, CalendarDays, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useApi, useGoals } from "@/userQueries/userQuery";
import { useAuth } from "@clerk/nextjs";
import AiLoader from "@/components/AiLoader";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { validateTargetDate } from "@/Validation/Vallidate";
import FormattedDate from "@/components/FormattedDate";

const calculateDaysLeft = (targetDateStr: string | Date) => {
  const today = new Date();
  const targetDate = new Date(targetDateStr);
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { label: "Overdue", days: diffDays, color: "bg-destructive/80" };
  }
  if (diffDays === 0) {
    return { label: "Today", days: diffDays, color: "bg-amber-500" };
  }
  return { label: `${diffDays} days left`, days: diffDays, color: "bg-primary/80" };
};

interface GoalType {
  goal_id: string;
  name: string;
  description: string;
  target_date: Date;
  isCompleted: boolean;
  audio_id: string;
}

interface EditFormState {
  id: string;
  title: string;
  desc: string;
  target_date: string;
  isCompleted: boolean;
}

const GetGoals = () => {
  const API_URL = useApi()
  const queryClient = useQueryClient()
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState<EditFormState>({
    id: "",
    title: "",
    desc: "",
    target_date: "",
    isCompleted: false,
  });

  const handleEdit = (goal: GoalType) => {
    setEditForm({
      id: goal.goal_id,
      title: goal.name,
      desc: goal.description,
      target_date: new Date(goal.target_date).toISOString().split("T")[0],
      isCompleted: goal.isCompleted,
    });
    setEditDialogOpen(true);
  };

  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken();
      setToken(fetchedToken);
    };
    fetchToken();
  }, [getToken]);

  const { data: goals, error, isLoading } = useGoals(token);

  const handleSave = () => {
    console.log(editForm)
    if (!editForm.title || !editForm.target_date) {
      toast.error("Goal should have a name and target date")
      return;
    } else if (!(validateTargetDate(editForm.target_date))) {
      toast.error('Target date cannot be in past')
      return;
    }
    axios.put(`${API_URL}/goals/updateGoal`, editForm, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        const { status, message } = res.data
        if (status) {
          toast.success("Goal updated")
          queryClient.removeQueries({ queryKey: ['Goals', token] })
        } else {
          toast.error(message)
        }
      })
      .catch(err => {
        console.log(err)
        toast.error("unexpected error while updating goal")
      })
  }

  const handleDelete = async (goal_id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/goals/deleteGoal?goalId=${goal_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const { status, message } = response.data
      if (status) {
        toast.success('Goal deleted')
        queryClient.removeQueries({ queryKey: ['Goals', token] })
      } else {
        toast.error(message)
      }
    } catch (error) {
      console.log(error)
      toast.error('unexpected error occurred while deleting goal')
    }
  }

  if (isLoading) {
    return <AiLoader label="Loading goals..." />;
  }

  if (error) {
    toast.error(error.message);
    return <div className="text-center text-destructive">Error: Could not load your goals.</div>;
  }

  return (
    <div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-2xl p-8">
          <DialogTitle className="text-2xl font-bold mb-6">Edit Goal</DialogTitle>
          <form className="space-y-4">
            <Input
              placeholder="Goal Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={editForm.desc}
              onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
            />
            <Input
              type="date"
              value={editForm.target_date}
              onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })}
            />
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isCompleted"
                checked={editForm.isCompleted}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isCompleted: !!checked })}
              />
              <label htmlFor="isCompleted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mark this goal as completed
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Goals List */}
      <div className="space-y-4">
        {goals && goals.length > 0 ? (
          goals.map((goal: GoalType) => {
            const daysLeftInfo = calculateDaysLeft(goal.target_date);
            return (
              <div
                key={goal.goal_id}
                className={`flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 ${goal.isCompleted ? 'bg-card/50 opacity-60' : 'bg-card shadow-sm'
                  }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {goal.isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Target className="w-6 h-6 text-primary" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className={`text-xl font-bold mb-1 ${goal.isCompleted ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                    {goal.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-3">{goal.description}</p>

                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    {!goal.isCompleted && (
                      <>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="w-4 h-4" />
                          <FormattedDate date={goal.target_date} />
                        </div>
                        <Badge className={`${daysLeftInfo.color} text-white`}>{daysLeftInfo.label}</Badge>
                      </>
                    )}
                    {goal.audio_id && (
                      <Link href={`/dashboard/diary/${goal.audio_id}`}>
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary flex items-center gap-1.5">
                          <BookText className="w-4 h-4" /> Go to Linked Entry
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(goal)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(goal.goal_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">You haven&apos;t set any goals yet.</div>
        )}
      </div>
    </div>
  );
};

export default GetGoals;
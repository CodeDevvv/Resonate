"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteGoal, useUpdateGoal } from "@/hooks/use-goal";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Pencil,
  StickyNote,
  Target,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import AiLoader from "../shared/AiLoader";
import UpdateGoalDialog from "./GoalForm";

const calculateDaysLeft = (targetDateStr: string | Date) => {
  const today = new Date();
  const targetDate = new Date(targetDateStr);
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0)
    return {
      label: "Overdue",
      color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400",
    };
  if (diffDays === 0)
    return {
      label: "Due Today",
      color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400",
    };
  return {
    label: `${diffDays} days left`,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400",
  };
};

interface GoalType {
  goalId?: string | "";
  title: string;
  description: string;
  targetDate: string | "";
  isCompleted?: boolean;
  entryId?: string;
}

interface GoalListProps {
  items: GoalType[];
  isError: boolean;
  isLoading: boolean;
}

const GoalList: React.FC<GoalListProps> = ({ items, isError, isLoading }) => {
  const [isAddGoalDialogOpen, setAddGoalDialogOpen] = useState(false);
  const { mutate: deleteGoal, isPending: isPendingDeleteUpate } = useDeleteGoal();
  const { mutate: updateGoal, isPending: isPendingGoalUpdate } = useUpdateGoal();
  const [editForm, setEditForm] = useState<GoalType>({
    goalId: "",
    title: "",
    description: "",
    targetDate: "",
    isCompleted: false,
  });

  const handleEdit = (goal: GoalType) => {
    setEditForm({
      goalId: goal.goalId || "",
      title: goal.title,
      description: goal.description,
      targetDate: new Date(goal.targetDate).toISOString().split("T")[0],
      isCompleted: goal.isCompleted || false,
    });
    setAddGoalDialogOpen(true);
  };

  const handleUpdate = async (payload: GoalType) => {
    updateGoal(payload, {
      onSuccess: () => {
        toast.success("Goal updated successfully");
        setAddGoalDialogOpen(false);
      },
      onError: () => {
        toast.error("Failed to update goal");
      },
    });
  };

  const handleDelete = async (goalId: string) => {
    toast.promise(
      new Promise((resolve, reject) => {
        deleteGoal(goalId, {
          onSuccess: resolve,
          onError: reject,
        });
      }),
      {
        loading: "Deleting...",
        success: "Goal deleted",
        error: "Could not delete goal",
      }
    );
  };

  if (isLoading || isPendingDeleteUpate || isPendingGoalUpdate) {
    return (
      <div className="flex justify-center items-center py-20 w-full">
        <AiLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-6 text-center rounded-xl border border-destructive/10 bg-destructive/5 text-destructive animate-in fade-in-50">
        <p className="text-sm font-medium">Unable to load goals at this time.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {!items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl border-muted-foreground/20 bg-muted/5">
          <div className="h-12 w-12 rounded-full bg-background border shadow-sm flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">No active goals found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {items.map((goal) => {
            const daysLeftInfo = calculateDaysLeft(goal.targetDate);
            const isManual = !goal.entryId;
            const formattedDate = new Date(goal.targetDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Card
                key={goal.goalId}
                className={`group relative w-full border transition-all duration-200 rounded-lg p-4
                  ${
                    goal.isCompleted
                      ? "bg-muted/30 border-border/40 opacity-80"
                      : "bg-card border-border/60 shadow-sm hover:shadow-md hover:border-primary/20"
                  }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {goal.isCompleted ? (
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 h-5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <h3
                          className={`font-semibold tracking-tight text-sm truncate ${
                            goal.isCompleted ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground"
                          }`}
                        >
                          {goal.title}
                        </h3>
                        {!goal.isCompleted && (
                          <Badge
                            variant="outline"
                            className={`shrink-0 rounded-[4px] px-1.5 py-0 text-[10px] h-4 font-medium uppercase tracking-wide border ${daysLeftInfo.color}`}
                          >
                            {daysLeftInfo.label}
                          </Badge>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground/40 hover:text-foreground -mr-2"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleEdit(goal)} className="text-xs">
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive text-xs"
                            onClick={() => goal.goalId && handleDelete(goal.goalId)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className={`text-xs line-clamp-1 ${goal.isCompleted ? "text-muted-foreground/60" : "text-muted-foreground/90"}`}>
                      {goal.description}
                    </p>

                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70">
                        <Calendar className="h-3 w-3 opacity-70" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />

                      {isManual ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/50">
                          <StickyNote className="h-3 w-3" />
                          <span>Manual</span>
                        </div>
                      ) : (
                        <Link
                          href={`/dashboard/diary/${goal.entryId}`}
                          className="flex items-center gap-1 text-[11px] font-medium text-primary/80 hover:text-primary transition-colors group/link"
                        >
                          <Clock className="h-3 w-3" />
                          <span>Diary Entry</span>
                          <ChevronRight className="h-2.5 w-2.5 transition-transform group-hover/link:translate-x-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <UpdateGoalDialog
        open={isAddGoalDialogOpen}
        onOpenChange={setAddGoalDialogOpen}
        initialData={editForm}
        onGoalUpdate={handleUpdate}
        isPending={isPendingGoalUpdate}
        isGoalUpdate={true}
      />
    </div>
  );
};

export default GoalList;
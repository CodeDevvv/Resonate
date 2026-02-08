"use client";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react"; // Added icons
import { useState } from "react";
import toast from "react-hot-toast";
import GetGoals from "./GetGoals";
import UpdateGoalDialog from "./UpdateGoal";
import { useAddGoal, useFetchGoal } from "./useGoal";

interface GoalFormData {
  title: string;
  description: string;
  targetDate: string;
  entryId?: string;
  isCompleted?: boolean
}

const GoalsDashboard = () => {
  const [isAddGoalDialogOpen, setAddGoalDialogOpen] = useState(false);
  const { mutate: addGoal, isPending } = useAddGoal();
  const { data: goalEntries, isError, isLoading } = useFetchGoal();

  const handleAddGoal = (payload: GoalFormData) => {
    addGoal(payload, {
      onSuccess: () => {
        toast.success("Goal added successfully");
        setAddGoalDialogOpen(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed adding goal");
      },
    });
  };

  return (
    <div className="flex-1 p-8 ml-80 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Goals & Ambitions
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your progress and define your future targets.
          </p>
        </div>

        <Button
          onClick={() => setAddGoalDialogOpen(true)}
          className="shadow-sm transition-all hover:shadow-md"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      <div className="min-h-[400px]">
        <GetGoals
          items={goalEntries}
          isError={isError}
          isLoading={isLoading}
        />
      </div>

      <UpdateGoalDialog
        open={isAddGoalDialogOpen}
        onOpenChange={setAddGoalDialogOpen}
        initialData={{ title: "", description: "" }}
        onGoalUpdate={handleAddGoal}
        isPending={isPending}
        isGoalUpdate={false}
      />
    </div>
  );
};

export default GoalsDashboard;
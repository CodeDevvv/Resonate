"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isDateInPast } from "@/components/utils/helperFunctions";
import { Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface AddGoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: { title: string; description: string; isCompleted?: boolean, targetDate?: string, goalId?: string };
    onGoalUpdate: (payload: GoalFormData) => void;
    isPending: boolean;
    isGoalUpdate: boolean
}

interface GoalFormData {
    goalId?: string
    title: string,
    description: string,
    targetDate: string,
    entryId?: string,
    isCompleted?: boolean
}

const UpdateGoalDialog: React.FC<AddGoalDialogProps> = ({ open, onOpenChange, initialData, onGoalUpdate, isPending, isGoalUpdate }) => {
    const [form, setForm] = useState({ title: "", description: "", targetDate: "", isCompleted: false });

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title.trim() || "",
                description: initialData.description || "",
                targetDate: initialData.targetDate || "",
                isCompleted: initialData.isCompleted || false
            });
        }
    }, [initialData]);

    const handleSave = async () => {
        if (!form.title || !form.targetDate) {
            toast.error('Goal must have a title and target date.');
            return;
        }
        if(!form.isCompleted) {
            if (isDateInPast(form.targetDate)) {
                toast.error("Target date cannot be in the past.");
                return;
            }
        }
        const payload = { ...form, goalId: initialData?.goalId }
        onGoalUpdate(payload)
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Add Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="placeholder:italic placeholder:text-gray-400"/>
                    <Textarea placeholder="Add Goal Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="placeholder:italic placeholder:text-gray-400/70"/>
                    <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
                </div>
                {isGoalUpdate &&
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="isCompleted"
                            checked={form.isCompleted}
                            onCheckedChange={(checked) => setForm({ ...form, isCompleted: !!checked })}
                        />
                        <label htmlFor="isCompleted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mark this goal as completed
                        </label>
                    </div>}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="hover:text-red-600 cursor-pointer"><X className="w-4 h-4 mr-1" /> Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending} className="cursor-pointer"><Save className="w-4 h-4 mr-1" /> Save Goal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateGoalDialog;
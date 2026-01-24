"use client";
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from 'lucide-react';
import API_URL from '@/components/utils/getApiUrl';

interface AddGoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: { title: string; desc: string };
    entryId?: string;
}

const isDateInPast = (dateString: string): boolean => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
};

export const AddGoalDialog: React.FC<AddGoalDialogProps> = ({ open, onOpenChange, initialData, entryId }) => {
    const [form, setForm] = useState({ title: "", desc: "", target_date: "" });
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title || "",
                desc: initialData.desc || "",
                target_date: ""
            });
        }
    }, [initialData]);

    const handleSave = async () => {
        if (!form.title || !form.target_date) {
            toast.error('Goal must have a title and target date.');
            return;
        }
        if (isDateInPast(form.target_date)) {
            toast.error("Target date cannot be in the past.");
            return;
        }

        const toastId = toast.loading("Saving goal...");
        try {
            const token = await getToken();
            const payload = { ...form, entryId: entryId };

            const res = await axios.post(`${API_URL}/goals/addGoal`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.status) {
                toast.success("Goal added!", { id: toastId });
                queryClient.invalidateQueries({ queryKey: ['Goals'] });
                onOpenChange(false);
            } else {
                toast.error(res.data.message, { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.", { id: toastId });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    <Textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
                    <Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                    <Button onClick={handleSave}><Save className="w-4 h-4 mr-1" /> Save Goal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddGoalDialog;
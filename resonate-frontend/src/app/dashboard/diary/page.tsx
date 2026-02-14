"use client";
import AddEntry from "@/components/diary/AddEntryForm";
import DiaryList from "@/components/diary/DiaryList";
import React from "react";

const Diary = () => {
    return (
        <div className="max-w-full ml-80 mt-10 mr-10">
            <AddEntry />
            <DiaryList />
        </div>
    );
};

export default Diary;

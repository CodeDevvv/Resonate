"use client";
import React from "react";
import DiaryList from "./DiaryList";
import AddEntry from "./AddEntry";

const Diary = () => {
    return (
        <div className="max-w-full ml-80 mt-10 mr-10">
            <AddEntry />
            <DiaryList />
        </div>
    );
};

export default Diary;

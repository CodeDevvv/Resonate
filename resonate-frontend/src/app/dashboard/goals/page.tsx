"use client";
import React from "react";
import AddGoal from "./AddGoal";
import GetGoals from "./GetGoals";

const GoalsDashboard = () => {

  return (
    <div className="mt-10 ml-80 max-w-6xl">
      <h1 className="text-4xl font-extrabold text-primary text-center mb-8 font-rampart">
        Achieve Your Ambitions 🚀
      </h1>
      <AddGoal />
      <GetGoals />

    </div>
  );
};

export default GoalsDashboard;

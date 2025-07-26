import React from "react";
import Sidebar from "@/components/Sidebar";
import Authenticate from "@/components/Authenticate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Authenticate>
            <Sidebar />
            {children}
        </Authenticate>
    );
}

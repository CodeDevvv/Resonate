import Sidebar from "@/components/layout/Sidebar";
import Authenticate from "@/components/shared/Authenticate";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Authenticate>
            <Sidebar />
            {children}
        </Authenticate>
    );
}

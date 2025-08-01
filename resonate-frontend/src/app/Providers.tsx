"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/components/Contexts/LoadingContexts.js";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {

  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}
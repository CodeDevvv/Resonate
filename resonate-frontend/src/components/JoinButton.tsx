"use client";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function JoinButton() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[52px] w-[120px] bg-gray-200 animate-pulse rounded-lg" />
    );
  }
  return (
    <div>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow-md hover:bg-primary/90 hover:cursor-pointer transition">
            Join
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard">
          <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow-md hover:bg-primary/90 hover:cursor-pointer transition">
            Login Back
          </button>
        </Link>
      </SignedIn>
    </div>
  );
}

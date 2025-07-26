"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { FullscreenLoader } from "./fullscreen-loader";

type AuthenticateProps = {
  children: ReactNode;
};

const Authenticate = ({ children }: AuthenticateProps) => {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not signed in after loading completes
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <FullscreenLoader />;
  }

  // Only render children if signed in
  return isSignedIn ? <>{children}</> : <FullscreenLoader />;
};

export default Authenticate;

"use client";
import { useUser } from "@clerk/nextjs";

const PageClient = () => {
    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded || !isSignedIn) {
      return null;
    }
  
  return (
    <div className="h-full flex flex-col items-center justify-center text-2xl">
        Hello, {user.firstName}! Welcome to ImagiGenie
    </div>
  );
};

export default PageClient
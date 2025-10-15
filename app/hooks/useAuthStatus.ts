// hooks/useAuthStatus.ts
"use client";

import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";

export const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        setIsLoggedIn(!!session);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    isLoggedIn: () => isLoggedIn,
    isLoading,
  };
};

import { signIn, SignInResponse } from "next-auth/react";
import { useState } from "react";

interface AuthDebugResponse {
  response: SignInResponse | undefined;
  error: string | null;
  isLoading: boolean;
}

export const useAuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState<AuthDebugResponse>({
    response: undefined,
    error: null,
    isLoading: false,
  });

  const debugSignIn = async (
    provider: string,
    credentials: { email: string; password: string },
    options?: { redirect?: boolean; callbackUrl?: string }
  ) => {
    setDebugInfo((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await signIn(provider, {
        ...credentials,
        redirect: false,
        ...options,
      });

      setDebugInfo({
        response: result,
        error: result?.error || null,
        isLoading: false,
      });

      return result;
    } catch (error) {
      console.error("🔐 Authentication error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      setDebugInfo({
        response: undefined,
        error: errorMessage,
        isLoading: false,
      });

      throw error;
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo({
      response: undefined,
      error: null,
      isLoading: false,
    });
  };

  return {
    debugSignIn,
    debugInfo,
    clearDebugInfo,
  };
};

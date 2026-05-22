// React and Next.js Imports
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

// Component Imports
import ChatWrapper from "@views/apps/chat";

// Server Action Imports
import { getUserThreads, getCurriculum } from "@/app/server/chat-actions";

// Component Imports
import { getThreadsList } from "@/app/api/actions/server/threads";
import { getCurriculumList } from "@/app/api/actions/server/curriculum";
import PageLoader from "@/components/ui/PageLoader";

// Server component for data fetching
async function ChatApp() {
  // Fetch session, threads and curriculum in parallel
  const [session, threads, curriculum] = await Promise.all([
    getServerSession(authOptions),
    getThreadsList(),
    getCurriculumList(),
  ]);

  // Extract serializable user data from session to pass to the client component
  const initialUser = session?.user
    ? {
        id: session.user.id as string | undefined,
        grade_id: (session.user as any)?.grade_id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  try {
    return (
      <Suspense fallback={<PageLoader fullPage={false} />}>
        <ChatWrapper
          initialUserThreads={threads}
          initialCurriculumData={curriculum}
          initialUser={initialUser}
        />
      </Suspense>
    );
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message === "Authentication failed") {
      // Redirect to login page
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <p className="text-red-500 mb-4">
            Your session has expired. Please log in again.
          </p>
          <a
            href="/api/auth/signin"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      );
    }
  }
}

export default ChatApp;

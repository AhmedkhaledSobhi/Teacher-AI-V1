"use client";

// Component Imports
import AuthPageShell from "../AuthPageShell";
import ForgotPassword from "@/views/ForgotPassword";

// Type Imports
import type { SystemMode, Mode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";

type ForgotPasswordClientProps = {
  initialMode: SystemMode;
  settingsMode: Mode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const ForgotPasswordClient = ({
  initialMode,
  settingsMode,
  dictionary,
}: ForgotPasswordClientProps) => {
  return (
    <AuthPageShell
      initialMode={initialMode}
      settingsMode={settingsMode}
    >
      <ForgotPassword
        mode={initialMode}
        dictionary={dictionary}
      />
    </AuthPageShell>
  );
};

export default ForgotPasswordClient;

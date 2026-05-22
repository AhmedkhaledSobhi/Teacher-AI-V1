"use client";

// Component Imports
import AuthPageShell from "../AuthPageShell";
import Login from "@/views/Login";

// Type Imports
import type { SystemMode, Mode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";

type NewLoginClientProps = {
  initialMode: SystemMode;
  settingsMode: Mode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const NewLoginClient = ({
  initialMode,
  settingsMode,
  dictionary,
}: NewLoginClientProps) => {
  return (
    <AuthPageShell
      initialMode={initialMode}
      settingsMode={settingsMode}
    >
      <Login
        mode={initialMode}
        dictionary={dictionary}
      />
    </AuthPageShell>
  );
};

export default NewLoginClient;

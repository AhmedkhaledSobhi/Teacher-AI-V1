"use client";

// Component Imports
import AuthPageShell from "../AuthPageShell";
import Register from "@/views/Register";

// Type Imports
import type { SystemMode, Mode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";

type RegisterClientProps = {
  initialMode: SystemMode;
  settingsMode: Mode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const RegisterClient = ({
  initialMode,
  settingsMode,
  dictionary,
}: RegisterClientProps) => {
  return (
    <AuthPageShell
      initialMode={initialMode}
      settingsMode={settingsMode}
    >
      <Register
        mode={initialMode}
        dictionary={dictionary}
      />
    </AuthPageShell>
  );
};

export default RegisterClient;

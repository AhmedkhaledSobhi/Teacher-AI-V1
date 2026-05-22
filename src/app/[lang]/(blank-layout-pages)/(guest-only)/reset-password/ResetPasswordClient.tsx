"use client";

import { Suspense } from "react";
import AuthPageShell from "../AuthPageShell";
import ResetPassword from "@/views/ResetPassword";

import type { SystemMode, Mode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";

type Props = {
  initialMode: SystemMode;
  settingsMode: Mode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const ResetPasswordClient = ({
  initialMode,
  settingsMode,
  dictionary,
}: Props) => {
  return (
    <AuthPageShell
      initialMode={initialMode}
      settingsMode={settingsMode}
    >
      <Suspense>
        <ResetPassword
          mode={initialMode}
          dictionary={dictionary}
        />
      </Suspense>
    </AuthPageShell>
  );
};

export default ResetPasswordClient;

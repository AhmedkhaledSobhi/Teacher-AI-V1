"use client";

import AuthPageShell from "../AuthPageShell";
import ConfirmEmail from "@/views/ConfirmEmail";

import type { SystemMode, Mode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";

type Props = {
  initialMode: SystemMode;
  settingsMode: Mode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const ConfirmEmailClient = ({
  initialMode,
  settingsMode,
  dictionary,
}: Props) => {
  return (
    <AuthPageShell
      initialMode={initialMode}
      settingsMode={settingsMode}
    >
      <ConfirmEmail
        mode={initialMode}
        dictionary={dictionary}
      />
    </AuthPageShell>
  );
};

export default ConfirmEmailClient;

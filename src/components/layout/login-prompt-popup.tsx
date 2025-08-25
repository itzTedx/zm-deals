import { getSession } from "@/lib/auth/server";

import { LoginPrompt } from "./login-prompt";

export const LoginPromptPopup = async () => {
  const session = await getSession();

  if (!session || session.user.isAnonymous) {
    return <LoginPrompt />;
  }
  return null;
};

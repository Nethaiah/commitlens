"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const githubSignIn = async () => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider: "github",
      callbackURL: "/repositories",
    },
  });

  if (url) {
    redirect(url);
  }
};

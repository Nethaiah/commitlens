"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

export const githubSignOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  return result;
};

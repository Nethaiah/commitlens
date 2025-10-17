"use server"

import { auth } from "./auth";
import { headers } from "next/headers";

export const githubSignOut = async () => {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  return result;
};
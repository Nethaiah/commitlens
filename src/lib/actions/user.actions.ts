"use server"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const githubSignIn = async () => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider: "github",
      callbackURL: "/repositories",
    },
  })

  if (url) {
    redirect(url)
  }
}


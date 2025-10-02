"use client"

import { Header } from "@/components/header"
import { useEffect } from "react"
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

export default function Repositories() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [session, router]);

  if (isPending || !session) {
    return <Loader/>
  }

  return (
    <div>
      <Header />
      <h1>Repo</h1>
    </div>
  )
}
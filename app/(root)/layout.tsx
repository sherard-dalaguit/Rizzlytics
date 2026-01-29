import {ReactNode} from "react";
import Navbar from "@/components/navigation/Navbar";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session?.user) redirect("/log-in");

  return (
    <main className="bg-zinc-950 h-screen relative">
      <Navbar />

      <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-16 sm:pt-36 max-md:pb-14 sm:px-14">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </section>
    </main>
  )
}

export default RootLayout;
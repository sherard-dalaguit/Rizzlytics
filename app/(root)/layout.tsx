import {ReactNode} from "react";
import Navbar from "@/components/navigation/Navbar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="bg-zinc-950 h-screen relative">
      <Navbar />

      <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </section>
    </main>
  )
}

export default RootLayout;
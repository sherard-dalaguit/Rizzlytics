import React from 'react'
import {
  Sheet, SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { IconMenu2 } from "@tabler/icons-react"
import Link from "next/link";
import NavLinks from "@/components/navigation/NavLinks";
import {Button} from "@/components/ui/button";
import {auth, signOut} from "@/auth";
import {LogOut} from "lucide-react";

const MobileNavigation = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <Sheet>
      <SheetTrigger>
        <IconMenu2 className="w-6 h-6 lg:hidden" />
      </SheetTrigger>

      <SheetContent className="p-6">

        <SheetTitle className="hidden">Navigation</SheetTitle>
        <Link href="/" className="flex items-center pl-2 gap-1">
          <p className="text-2xl font-semibold primary-text-gradient">Rizzlytics</p>
        </Link>

        <div className="w-full mt-4 border-y border-zinc-900">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-4 py-8">
              <NavLinks isMobileNav />
            </section>
          </SheetClose>
        </div>

        <div className="flex flex-col mt-auto mb-4 gap-3">
          {userId ? (
            <SheetClose asChild>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <Button type="submit" className="w-fit bg-transparent! px-4 py-3">
                  <LogOut className="size-5 text-white" />
                  <span className="primary-text-gradient">Log Out</span>
                </Button>
              </form>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Link href="/log-in">
                <Button className="text-lg text-white primary-gradient min-h-12.5 w-full rounded-lg px-4 py-3">
                  Log In
                </Button>
              </Link>
            </SheetClose>
          )}
        </div>

      </SheetContent>

    </Sheet>
  )
}
export default MobileNavigation

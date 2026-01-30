import React from 'react'
import Image from "next/image";
import Link from "next/link";
import NavLinks from "@/components/navigation/NavLinks";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import {auth} from "@/auth";
import {Button} from "@/components/ui/button";
import {IconUserCircle} from "@tabler/icons-react";
import UserAvatarMenu from "@/components/UserAvatarMenu";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="flex flex-between items-center bg-black fixed inset-x-0 top-0 z-50 w-full h-16 px-12 border-b-2 border-zinc-900">
      <div className="flex items-center">
        <Link href="/" className="flex flex-row items-center gap-1 mr-8 text-2xl font-semibold">
          <Image
            src={"/logo.png"}
            alt="logo"
            width={49}
            height={49}
          />
          <h1 className="primary-text-gradient">Rizzlytics</h1>
        </Link>

        <div className="flex flex-row gap-4 max-lg:hidden">
          <NavLinks />
        </div>
      </div>

      <div className="flex items-center ml-auto gap-3">
        {session?.user?.id ? (
          <UserAvatarMenu
            id={session.user.id as string}
            name={session.user.name!}
            email={session.user.email}
            imageUrl={session.user.image}
          />
        ) : (
          <Link href="/log-in" className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="[&_svg]:w-8! [&_svg]:h-8!"
            >
              <IconUserCircle />
            </Button>
          </Link>
        )}
      </div>

      <MobileNavigation />
    </nav>
  )
}
export default Navbar

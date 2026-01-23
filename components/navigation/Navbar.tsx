'use client'

import React from 'react'
import Link from "next/link";
import NavLinks from "@/components/navigation/NavLinks";
import MobileNavigation from "@/components/navigation/MobileNavigation";

const Navbar = () => {
  return (
    <nav className="flex flex-between items-center bg-black fixed inset-x-0 top-0 z-50 w-full h-16 px-12 border-b-2 border-zinc-900">
      <div className="flex items-center">
        <Link href="/" className="flex flex-row items-center mr-8 text-2xl font-semibold">
          <h1 className="primary-text-gradient">Rizzlytics</h1>
        </Link>

        <div className="flex flex-row gap-4 max-lg:hidden">
          <NavLinks />
        </div>
      </div>

      <div className="flex items-center ml-auto gap-3">
        <h1 className="max-lg:hidden">Account Settings</h1>
      </div>

      <MobileNavigation />
    </nav>
  )
}
export default Navbar

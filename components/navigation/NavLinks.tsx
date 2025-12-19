'use client';

import {navbarLinks} from "@/data";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {SheetClose} from "@/components/ui/sheet";

const NavLinks = ({
  isMobileNav = false,
  userId
}: {
  isMobileNav?: boolean
  userId?: string
}) => {
  const pathname = usePathname()

  return (
    <>
      {navbarLinks.map((item) => {
        const href = item.route === "/settings"
         ? userId
            ? `/settings/${userId}`
            : "/sign-in"
         : item.route

        const isActive =
          (pathname.includes(item.route) && item.route.length > 1) ||
          pathname === item.route ||
          pathname === href;

        const LinkComponent = (
          <Link
            href={href}
            key={item.label}
            className={cn(
              isActive
                ? "primary-gradient rounded-lg font-semibold"
                : "bg-transparent font-medium",
              "flex items-center justify-start gap-4 px-4 py-2"
            )}
          >
            {isMobileNav && item.icon}
            <p className={
              cn(
                isActive ? 'base-bold' : 'base-medium',
                !isMobileNav && 'max-lg:hidden',
              )}
            >
              {item.label}
            </p>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose asChild className="py-4" key={item.route}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <div key={item.route}>
            {LinkComponent}
          </div>
        )
      })}
    </>
  )
}

export default NavLinks;
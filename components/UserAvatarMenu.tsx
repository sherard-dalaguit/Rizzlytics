"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/UserAvatar";
import {
  IconLogout2,
  IconSparkles,
} from "@tabler/icons-react";

interface Props {
  id: string;
  name: string;
  email?: string | null;
  imageUrl?: string | null;
}

export default function UserAvatarMenu({
  id,
  name,
  email,
  imageUrl,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus:ring-2 focus:ring-white/10">
          <UserAvatar
            name={name}
            imageUrl={imageUrl}
            className="h-9 w-9 mr-4"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-80 rounded-2xl border border-white/10
          bg-black/70 backdrop-blur-xl
          shadow-[0_20px_60px_rgba(0,0,0,0.55)]
          p-0
        "
      >
        {/* User header */}
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-white">{name}</p>
          {email && (
            <p className="mt-0.5 text-xs text-white/50">{email}</p>
          )}
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={() => signOut({ redirectTo: "/" })}
          className="
            px-5 py-3 text-white/80
            focus:bg-white/5 cursor-pointer
          "
        >
          <div className="flex items-center gap-3">
            <IconLogout2 className="h-4 w-4" />
            Sign out
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

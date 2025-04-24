"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { config } from "@/lib/config"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { paths } from "@/lib/paths"

export function LogoHeader() {
  const router = useRouter()
  return (
    <SidebarMenu>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        onClick={() => router.push(paths.dashboard)}
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
          <Image src="/favicon.svg" alt={config.appName} width={32} height={32} priority />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">
            {config.appName}
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenu>
  );
}

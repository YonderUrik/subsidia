"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CircleUser,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  Settings2,
  Sprout,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { LogoHeader } from "@/components/logo-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { paths } from "@/lib/paths"
// This is sample data.
const data = {
  navMain: [
    {
      title: "Gestione Paghe",
      url: "#",
      icon: Users,
      isActive: false,
      items: [
        {
          title: "Operai",
          url: paths.employees,
        },
        {
          title: "Giornate",
          url: paths.salary,
        },
        {
          title: "Calendario",
          url: paths.calendar,
        },
        {
          title: "Statistiche",
          url: paths.salaryStats,
        }
      ],
    },
    {
      title: "Gestione Raccolti",
      url: "#",
      icon: Sprout,
      isActive: false,
      items: [
        {
          title: "Raccolti",
          url: paths.harvestsList,
        },
        {
          title: "Terreni",
          url: paths.lands,
        },
        {
          title: "Statistiche",
          url: paths.harvestsStats,
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { data: session } = useSession()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <LogoHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user || {}} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

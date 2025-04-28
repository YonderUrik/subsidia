import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }) {
   return (
      <SidebarProvider>
         <AppSidebar />
         <SidebarInset>
            
         <header className="flex sticky top-0 bg-white/80 backdrop-blur-sm z-50 h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
            <div className="flex items-center gap-2 px-4">
               <SidebarTrigger className="-ml-1" />
            </div>
         </header>
         {children}
         </SidebarInset>
      </SidebarProvider>
   )
}
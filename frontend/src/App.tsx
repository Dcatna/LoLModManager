import { GetChampions } from  "../wailsjs/go/main/App"; // path may vary based on setup
import { useEffect, useState } from 'react';
import { ThemeProvider } from "./components/Theme";
import AppSidebar from "./components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { SkinProvider } from "./SkinContext";

function App() {

  return (

    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="bg-background text-foreground max-h-screen  flex flex-col ">
        <SkinProvider>
          <SidebarProvider className="max-h-screen overflow-hidden">
            <AppSidebar collapsible="icon"/>
            <SidebarTrigger />
              <main className="flex-1 overflow-y-auto p-4">
                <Outlet />
              </main>
          </SidebarProvider>
        </SkinProvider>
      </div>
    </ThemeProvider>

  );
}

export default App;
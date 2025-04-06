import { GetChampions } from  "../wailsjs/go/main/App"; // path may vary based on setup
import { useEffect, useState } from 'react';
import { ThemeProvider } from "./components/Theme";
import AppSidebar from "./components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Outlet } from "react-router-dom";

function App() {
  const [champions, setChampions] = useState<any[]>([]);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const data = await GetChampions();
        console.log(data); // 👈 You should see your champion array here
        setChampions(data);
      } catch (err) {
        console.error("Error fetching champions:", err);
      }
    };

    fetchChampions();
  }, []);

  return (
    <>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="bg-background text-foreground min-h-screen flex">
        <SidebarProvider className="max-h-screen overflow-hidden">
          <AppSidebar variant="sidebar" collapsible="icon" />
          <SidebarTrigger />
          <Outlet />
        </SidebarProvider>
      </div>
    </ThemeProvider>
    </>
  );
}

export default App;


 "../wailsjs/go/main/App"
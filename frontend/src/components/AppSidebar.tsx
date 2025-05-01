import { LogOutIcon, Box, LogIn, Link, ListIcon, LucideIcon, ComputerIcon, Moon, Sun, DownloadIcon, PersonStandingIcon, Settings } from 'lucide-react'
import React from 'react'
import { SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarFooter, SidebarMenuButton, SidebarMenuItem, useSidebar, Sidebar } from './ui/sidebar'
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useTheme } from './Theme';
import { useLocation, useNavigate } from 'react-router-dom';


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  icon: LucideIcon;
  onClick?: () => void;
  selected?: boolean;
}


export function SidebarItem(props: SidebarProps) {
  const { open } = useSidebar();
  return (
    <SidebarMenuItem className={cn( props.className,  
      "fade-in fade-out transition-all duration-350 ease-in-out",
      "text-md line-clamp-1 overflow-ellipsis bg-card text-card-foreground"
    )}>
      <SidebarMenuButton
        onClick={props.onClick}
        className={cn(
          "w-full h-full",
          props.selected && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}>

        <props.icon />
        <span
          className={open ? "opacity-100" : "opacity-0"}
        >
          {props.name}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const navigate = useNavigate()
  const location = useLocation();
  return (
    <Sidebar
      {...props}
      collapsible="icon"

      className="max-h-screen overflow-hidden border-r border-gray-300"
    >
      <SidebarHeader className="">
          <ModeToggle />
          {/* ADD  SETTIGNS AND SEARCH*/}
          <SidebarItem name={'Settings'} icon={Settings} onClick={() => navigate("/settings")} selected={location.pathname.includes("settings")}/>
          <SidebarItem name={'Legends'} icon={PersonStandingIcon} onClick={() => navigate("/legends")} selected={location.pathname.includes("legends")}/>
          <SidebarItem name={'Find Skins'} icon={DownloadIcon} onClick={() => navigate("/find_skins")} selected={location.pathname.includes("skins")}/>
      </SidebarHeader>

      <SidebarContent className=" space-y-4">
      <SidebarGroup>
      
          <SidebarMenu>
            {/*ADD MAIN SIDEBAR CONTENT HERE */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  )
}

function ModeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <div className="z-50 rounded-lg ">
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full h-full justify-start">
        <SidebarItem name="Toggle Theme" icon={theme === "system" ? ComputerIcon :  theme === "dark" ? Moon : Sun} />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end"> 
        <Card className="bg-secondary z-50 p-2cursor-pointer text-start">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Button variant="ghost" className="w-full">
            Light
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Button variant="ghost" className="w-full"> 
            Dark
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Button variant="ghost" className="w-full">
            System
          </Button>
        </DropdownMenuItem>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}


export default AppSidebar
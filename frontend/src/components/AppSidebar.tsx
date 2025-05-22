import { LucideIcon, ComputerIcon, Moon, Sun, DownloadIcon, PersonStandingIcon, Settings, PlayIcon, BoxIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, Sidebar } from './ui/sidebar'
import { cn, useStateProducerT } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useTheme } from './Theme';
import { useLocation, useNavigate } from 'react-router-dom';
import { RunPatcher, BrowseFolders, GetChampions, ImportSkin } from "../../wailsjs/go/main/App";
import { useSkinContext } from '@/SkinContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog' 
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Combobox } from '@headlessui/react';
import { Champ } from '@/Types/types';


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

export const ImportFantome = () => {
  const [open, setOpen] = useState(false)
  const [filePath, setFilePath] = useState("")
  const [name, setName] = useState("")
  const [selectedChamps, setSelectedChamps] = useState<Champ[]>([])
  const [query, setQuery] = useState('')

const { loading, error, value: rawChamps } = useStateProducerT<Champ[]>([], async (update) => {
  const data = await GetChampions()
  update(data)
})

const allChamps = useMemo(() => rawChamps, [rawChamps])


const filteredChamps = useMemo(() => {
  return allChamps.filter((champ) =>
    champ.Name.toLowerCase().includes(query.toLowerCase())
  )
}, [allChamps, query])


  const handleFilePick = async () => {
      const path = await BrowseFolders()
      if (path) {
        setFilePath(path)
      }
  }

  const removeChamp = (id: string) => {
    setSelectedChamps((prev) => prev.filter((c) => c.ID !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filePath || selectedChamps.length === 0) {
      alert("Please select a file and at least one champion.")
      return
    }

    console.log("Importing skin:", {
      filePath,
      name,
      selectedChamps,
    })

    const saveName = filePath.split("\\").pop()!

    await ImportSkin(selectedChamps, saveName.replace(".fantome", ""), filePath)

    setOpen(false)
    setFilePath("")
    setName("")
    setSelectedChamps([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="bg-background text-foreground rounded-lg shadow-md"
        onClick={() => setOpen(true)}
      >
        <SidebarItem name={'Import Fantome'} icon={BoxIcon} />
      </DialogTrigger>

      <DialogContent className="max-w-lg p-6 rounded-lg bg-card shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Import Local Fantome</DialogTitle>
          <DialogDescription className="text-sm">
            Upload local mod and specify the champions associated with it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Label className="block space-y-1">
            <span className="text-sm font-medium">Fantome File</span>
            <Button variant="outline" type="button" onClick={handleFilePick}>
              {filePath ? filePath.split("\\").pop() : "Select .fantome file"}
            </Button>
          </Label>

        <div className="flex flex-wrap gap-2 mb-2">
          {selectedChamps.map((champ) => (
            <div key={champ.ID} className="flex items-center bg-primary text-primary-foreground px-3 py-1 rounded-full">
              {champ.Name}
              <button
                type="button"
                onClick={() => removeChamp(champ.ID)}
                className="ml-2 text-xs hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
          <Combobox multiple value={selectedChamps} onChange={(newSelected) => {
            setSelectedChamps(newSelected); 
            setQuery("")}}>

            <Combobox.Input
              value={query}
              className="border p-2 rounded w-full"
              placeholder="Search champions..."
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(champs: Champ[]) => champs.map((c) => c.Name).join(', ')}
            />
            <Combobox.Options className="mt-2 bg-white shadow-md rounded max-h-60 overflow-y-auto">
              {filteredChamps.length === 0 && query !== '' ? (
                <div className="p-2 text-muted-foreground">No champions found.</div>
              ) : (
                filteredChamps.map((champ) => (
                  <Combobox.Option 
                    key={champ.ID} 
                    value={champ} 
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {champ.Name}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Combobox>

          <div className="flex justify-end">
            <Button type="submit" className="py-2 px-4 rounded-md">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const navigate = useNavigate()
  const location = useLocation();
  const { activeSkins, updateActiveSkins } = useSkinContext();
  
  return (
    <Sidebar
      {...props}
      collapsible="icon"

      className="max-h-screen overflow-hidden border-r border-gray-300"
    >
      <SidebarHeader className="">
          <ModeToggle />
          {/* ADD  SETTIGNS AND SEARCH*/}
          <SidebarItem name={"Run Patcher"} icon={PlayIcon} onClick={() => RunPatcher(activeSkins)} className='hover:bg-accent' />
          <SidebarItem name={'Settings'} icon={Settings} onClick={() => navigate("/settings")} selected={location.pathname.includes("settings")} className='hover:bg-accent'/>
          <SidebarItem name={'Legends'} icon={PersonStandingIcon} onClick={() => navigate("/legends")} selected={location.pathname.includes("legends")} className='hover:bg-accent'/>
          <SidebarItem name={'Find Skins'} icon={DownloadIcon} onClick={() => navigate("/find_skins")} selected={location.pathname.includes("skins")} className='hover:bg-accent'/>
          <ImportFantome />
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
    <div className="z-50 rounded-lg">
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


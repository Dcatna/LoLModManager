import { useStateProducerT } from '@/lib/utils';
import { Champ, Skin, Skins } from '@/Types/types';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GetSkinDetails, DownloadSkin, GetChampions } from "../../wailsjs/go/main/App";
import { DownloadIcon, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarItem } from '@/components/AppSidebar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Combobox } from '@headlessui/react';



const PreviewSkin = () => {
  const location = useLocation()
  const skin = location.state as Skins
  
  const { loading, error, value } = useStateProducerT<Skin | undefined>(undefined, async (update) => {
    const data = await GetSkinDetails(skin.ItemLink)

    update(data)
  })
  

  return (
    <div className="flex w-full justify-center p-8 min-h-screen bg-background text-foreground overflow-y-auto">
      <div className="flex flex-col items-center w-full max-w-5xl gap-8">
        {/* Top Card */}
        <div className="flex flex-col md:flex-row bg-card rounded-xl shadow-md p-6 gap-6 w-full">
  <div className="flex-shrink-0">
    <img 
      src={skin.Image} 
      alt={skin.Title} 
      className="w-full md:w-80 h-auto rounded-lg object-cover"
    />
  </div>

  <div className="flex flex-col justify-between flex-1 h-full">
    <div>
      <h1 className="text-3xl font-bold mb-4">{skin.Title}</h1>

      {skin.Types && skin.Types.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skin.Types.map((type, index) => (
            <span 
              key={index} 
              className="px-3 py-1 text-sm bg-secondary rounded-full text-secondary-foreground"
            >
              {type}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm mb-2">
        <strong>Author:</strong> {value?.Author || "Unknown"}
      </p>
    </div>

    <div className="flex justify-end gap-4 mt-4">
      <a 
        href={`https://runeforge.dev${skin.ItemLink}`} 
        target="_blank" 
        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition w-fit"
      >
        View on Runeforge
      </a>

      {value?.DownloadLink ? <button 
        // onClick={downloadSkin}
        className="flex items-center justify-center p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition"
      > 
        <DownloadPopup downloadLink={value?.DownloadLink} skinName={skin.Title}/>
      </button> :
      <div/>}


    </div>

  </div>
</div>

        {/* Gallery Section */}
        {value?.Gallery ? (
          value.Gallery.length > 0 ? (
            <div className="w-full">
              <h2 className="text-2xl font-bold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {value.Gallery.map((item, index) => (
                  <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src={item.Image} 
                      alt={item.Name || "Gallery Image"} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-center text-sm">{item.Name || "No Name"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-4">No gallery images found.</p>
          )
        ) : (
          <p className="text-center text-muted-foreground mt-4">No gallery images found.</p>
        )}


        {/* Video Section */}
        {value?.Video && (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Preview Video</h2>
            <div className="aspect-video w-full">
              <iframe
                src={value?.Video}
                title="Skin Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </div>
        )}

        {/* License Section */}
        {value?.License && (
          <div className="w-full text-center pb-2">
            <p className="text-sm mt-4">
              <strong>License:</strong> {value?.License.License || "Unknown"} {' '}
              {value?.License.Link && (
                <a 
                  href={value?.License.Link} 
                  target="_blank" 
                  className="underline text-primary hover:text-primary/80"
                >
                  (View License)
                </a>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface popupType {
  downloadLink : string
  skinName: string
}

const DownloadPopup = ({ downloadLink, skinName }: popupType) => {
  const [selectedChamps, setSelectedChamps] = useState<Champ[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const { loading, error, value } = useStateProducerT<Champ[]>([], async (update) => {
    const data = await GetChampions()
    update(data)
  })

  const filteredChamps = value.filter((champ) =>
    champ.Name.toLowerCase().includes(query.toLowerCase())
  )

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Selected Champions:", selectedChamps.map(c => c.ID))
      await downloadSkin()
      setSelectedChamps([])
      setOpen(false)
    } catch (err) {
      console.error("Unexpected error:", err)
      alert("An unexpected error occurred. Please try again.")
    }
  }
  const removeChamp = (id: string) => {
    setSelectedChamps((prev) => prev.filter((c) => c.ID !== id))
  }
  
  async function downloadSkin() {
    if (!downloadLink) {
      console.log("NO DOWNLOAD LINK")
      return 
    }
  
    try {
      const parts = downloadLink.split("/")
      console.log(parts)
      const fileName = parts[parts.length - 1]
  
      console.log("Saving as filename:", fileName)
  
      await DownloadSkin(downloadLink, fileName, selectedChamps, skinName)
      console.log("DOWNLOAD DONE")
    } catch (e) {
      console.error("FAILED TO DOWNLOAD: ", e)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="bg-background text-foreground rounded-lg shadow-md"
        onClick={() => setOpen(true)}
      >
        <DownloadIcon className="h-5 w-5 bg-primary text-white" />
      </DialogTrigger>

      <DialogContent className="max-w-lg p-6 rounded-lg bg-card shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Select Champion(s)</DialogTitle>
          <DialogDescription className="text-sm">
            Search and select champions for this skin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
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
          {/* MULTI-SELECT COMBOBOX */}
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


export default PreviewSkin;

import { useStateProducerT } from '@/lib/utils';
import { Skin, Skins } from '@/Types/types';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GetSkinDetails, DownloadSkin } from "../../wailsjs/go/main/App";
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

type Props = {};

const PreviewSkin = (props: Props) => {
  const location = useLocation();
  const skin = location.state as Skins;
  
  const { loading, error, value } = useStateProducerT<Skin | undefined>(undefined, async (update) => {
    const data = await GetSkinDetails(skin.ItemLink);
    console.log(data); 
    update(data);
  });

  async function downloadSkin() {
    if (!value?.DownloadLink) {
      console.log("NO DOWNLOAD LINK")
      return 
    }
  
    try {
      const parts = value.DownloadLink.split("/");
      console.log(parts)
      const fileName = parts[parts.length - 1];
  
      console.log("Saving as filename:", fileName);
  
      await DownloadSkin(value.DownloadLink, fileName);
      console.log("DOWNLOAD DONE");
    } catch (e) {
      console.error("FAILED TO DOWNLOAD: ", e);
    }
  }
  

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

      <a 
        href={value?.DownloadLink} 
        target="_blank" 
        onClick={downloadSkin}
        className="flex items-center justify-center p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition"
      >
        <DownloadPopup />

      </a>

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


const DownloadPopup = () => {
  const [selectedChamps, setSelectedChamps] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Selected Champions:", selectedChamps);

      setSelectedChamps([]);
      setOpen(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const champions = ["Ahri", "Lux", "Yasuo", "Zed", "Karthus"]; // example list

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="bg-background text-foreground rounded-lg shadow-md" 
        onClick={() => setOpen(true)}
      >
        <DownloadIcon className="h-5 w-5 text-white" />
      </DialogTrigger>

      <DialogContent className="max-w-lg p-6 rounded-lg bg-card shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Select Champion(s)</DialogTitle>
          <DialogDescription className="text-sm">
            Choose the champion(s) this skin belongs to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="championSelect"
              className="block text-sm font-medium"
            >
              Champions
            </label>
            <select
              id="championSelect"
              multiple
              value={selectedChamps}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setSelectedChamps(selected);
              }}
              className="flex h-40 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              {champions.map((champ) => (
                <option key={champ} value={champ}>
                  {champ}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="py-2 px-4 rounded-md"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const champions = ["Ahri", "Akali", "Lux", "Yasuo", "Zed", "Karthus", /* ... 200 champs */];

export function ChampionSelector() {
  const [query, setQuery] = useState('');
  const [selectedChamp, setSelectedChamp] = useState('');

  const filteredChamps = champions.filter((champ) =>
    champ.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Combobox value={selectedChamp} onChange={setSelectedChamp}>
      <Combobox.Input
        onChange={(event) => setQuery(event.target.value)}
        className="border p-2 rounded w-full"
        placeholder="Search champion..."
      />
      <Combobox.Options className="mt-2 bg-white shadow-md rounded">
        {filteredChamps.map((champ) => (
          <Combobox.Option key={champ} value={champ} className="p-2 hover:bg-gray-100">
            {champ}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  );
}


export default PreviewSkin;

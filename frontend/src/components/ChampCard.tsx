import { useState, useEffect } from "react";
import { useStateProducerT } from "@/lib/utils";
// import { DownloadedSkin} from "@/Types/types";
import { db } from '../../wailsjs/go/models'

import { ChampCardProp } from "@/Types/types";
import { FetchSkinsForChampionById, EnableSkin, DisableSkin } from "../../wailsjs/go/main/App";
import { Switch } from "@/components/ui/switch";
import { useSkinContext } from "../SkinContext";

const ChampCard = (champ: ChampCardProp) => {
  const { loading, error, value: skins } = useStateProducerT<db.DownloadedSkin[]>([], async (update) => {
    const data = await FetchSkinsForChampionById(champ.ID);
    console.log(data)
    update(data);
  });
  console.log(skins)
  const { activeSkins, updateActiveSkins } = useSkinContext();


  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-4 border rounded shadow hover:scale-105 transform transition bg-card min-w-[300px] max-w-[350px]">
      
      <div className="flex flex-col items-center min-w-[150px]">
        <img 
          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.Image}`} 
          alt={champ.Name} 
          className="w-24 h-24 rounded-full object-cover mb-2"
        />
        <p className="text-lg font-semibold">{champ.Name}</p>
        <p className="text-gray-500 text-sm">{champ.Tags}</p>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4">

        {skins?.map((skin) => (
          <div key={skin.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <p className="text-md">{skin.name}</p>
            </div>
            <Switch
              checked={skin.isActive === 1}
              onCheckedChange={async (checked) => {
                if (checked) {
                  await EnableSkin(skin.name);
                  updateActiveSkins(skin.file_path.split("\\")[1], "add")
                  skin.isActive = 1
                } else {
                  await DisableSkin(skin.name);
                  updateActiveSkins(skin.file_path.split("\\")[1], "remove")
                  skin.isActive = 0
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChampCard;

import { useStateProducerT } from '@/lib/utils';
import { Champ, ChampCardProp } from '@/Types/types';
import { FetchSkinsForChampionById, DeleteSkin, GetChampionsForSkin } from 'wailsjs/go/main/App';
import { db } from 'wailsjs/go/models';
import { Divide, Trash2 } from 'lucide-react'; // optional: icon instead of emoji
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const ChampScreen = () => {
  const location = useLocation();
  const champ = location.state as Champ;
  const [trigger, setTrigger] = useState(0)

  const { loading, error, value: skins } = useStateProducerT<db.DownloadedSkin[]>([], async (setSkins) => {
    const data = await FetchSkinsForChampionById(champ.ID);
    setSkins(data);
  }, [trigger]);



  const handleDelete = async (skinId: string) => {
    console.log(champ)
    const champions = await GetChampionsForSkin(skinId)
    console.log(champions)
    if (champions === null) {
      alert("deleted failed")
    }
    if (champions.length > 1) {
      alert("This would delete for: ", )
    }

    await DeleteSkin(skinId)

    setTrigger(p => p+1)

  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-6 mb-6">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.Image}`}
          alt={champ.Name}
          className="w-24 h-24 rounded-full object-cover shadow-md"
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{champ.Name}</h2>

        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {skins && skins.length > 0 ? skins.map((skin) => (
          <div
            key={skin.id}
            className="flex justify-between items-center bg-[#1e1e2f] text-white p-4 rounded shadow border border-gray-700"
          >
            <span className="truncate">{skin.name}</span>
            <button
              onClick={() => {
                console.log(skin, "SIOSDFSD")
                handleDelete(skin.id)}}
              className="text-red-500 hover:text-red-700 transition"
              title="Delete Skin"
            >
              ❌
            </button>
          </div>
        )) : <div>No Skins</div>}
      </div>
    </div>
  );
};

export default ChampScreen;

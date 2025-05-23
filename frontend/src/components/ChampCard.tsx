import { useState, useEffect, useRef } from "react";
import { useStateProducerT } from "@/lib/utils";
// import { DownloadedSkin} from "@/Types/types";
import { db } from '../../wailsjs/go/models'

import { ChampCardProp } from "@/Types/types";
import { FetchSkinsForChampionById, EnableSkin, DisableSkin } from "../../wailsjs/go/main/App";
import { Switch } from "@/components/ui/switch";
import { useSkinContext } from "../SkinContext";
import ChampScreen from "./ChampScreen";
import { Link } from "react-router-dom";

const ChampCard = (champ: ChampCardProp) => {
  const { loading, error, value: skins } = useStateProducerT<db.DownloadedSkin[]>([], async (update) => {
    const data = await FetchSkinsForChampionById(champ.ID)
    console.log(data)
    update(data)
  })
  console.log(skins)
  const { activeSkins, updateActiveSkins } = useSkinContext()
  const [activeSkinId, setActiveSkinId] = useState<string | null>(null)

  useEffect(() => {
    if (skins && activeSkinId === null) {
      const active = skins.find((s) => s.isActive === 1)
      if (active) {
        setActiveSkinId(active.id)
      }
    }
  }, [skins])



  return (
  <div className="flex flex-row items-start gap-6 p-4 border rounded shadow hover:scale-105 transform transition bg-card min-w-[300px] max-w-[350px]">
    
    <Link to={`/champscreen/${champ.Name}`} state={champ} className="flex flex-col items-center min-w-[120px] hover:opacity-80 transition">
      <img 
        src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.Image}`} 
        alt={champ.Name} 
        className="w-20 h-20 rounded-full object-cover mb-1"
      />
      <p className="text-sm font-semibold text-center">{champ.Name}</p>
      <p className="text-xs text-gray-500 text-center">{champ.Tags}</p>
    </Link>

    <div className="flex-1 grid grid-cols-1 gap-2">
      {skins?.map((skin) => (
        <div key={skin.id} className="flex items-center justify-between p-2 border rounded bg-muted">
          <div className="max-w-[140px] overflow-hidden">
            <TextDisplay text={skin.name} maxWidth={140} />
          </div>
          <Switch
            checked={activeSkinId === skin.id}
            onCheckedChange={async (checked) => {
              if (checked && skin.id !== activeSkinId) {
                const prevSkin = skins.find(s => s.id === activeSkinId);
                if (prevSkin) {
                  await DisableSkin(prevSkin.name);
                  updateActiveSkins(prevSkin.file_path.split("\\")[1], "remove");
                  prevSkin.isActive = 0;
                }

                await EnableSkin(skin.name);
                updateActiveSkins(skin.file_path.split("\\")[1], "add");
                skin.isActive = 1;
                setActiveSkinId(skin.id);

              } else if (!checked && activeSkinId === skin.id) {

                await DisableSkin(skin.name);
                updateActiveSkins(skin.file_path.split("\\")[1], "remove");
                skin.isActive = 0;
                setActiveSkinId(null);
              }
            }}
          />

        </div>
      ))}
    </div>
  </div>
    
  );
};

const TextDisplay = ({ text, maxWidth }: { text: string; maxWidth: number }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > containerRef.current.offsetWidth);
    }
  }, [text, maxWidth]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden whitespace-nowrap"
      style={{ maxWidth, width: maxWidth }}
    >
      <div
        className={`inline-flex ${isOverflowing ? "animate-marquee" : ""}`}
        style={{ minWidth: isOverflowing ? "200%" : "auto" }}
      >
        <span ref={textRef} className="inline-block text-sm pr-8">{text}</span>
        {isOverflowing && <span className="inline-block text-sm">{text}</span>}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 6s linear infinite;
        }
      `}</style>
    </div>
  );
};


export default ChampCard;

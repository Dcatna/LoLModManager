import { useStateProducerT } from '@/lib/utils';
import { Skin, Skins } from '@/Types/types';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { GetSkinDetails } from "../../wailsjs/go/main/App";

type Props = {};

const PreviewSkin = (props: Props) => {
  const location = useLocation();
  const skin = location.state as Skins;
  const { loading, error, value } = useStateProducerT<Skin | undefined>(undefined, async (update) => {
    const data = await GetSkinDetails(skin.ItemLink);
    console.log(data); 
    update(data);
    console.log(data)

  });

  if(!loading || !error) {

  }

  return (
    <div className="flex w-full justify-center p-8 min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center w-full max-w-5xl">
        <div className="flex flex-col md:flex-row bg-card rounded-xl shadow-md p-6 gap-6 w-full">

          <div className="flex-shrink-0">
            <img 
              src={skin.Image} 
              alt={skin.Title} 
              className="w-full md:w-80 h-auto rounded-lg object-cover"
            />
          </div>

          <div className="flex flex-col justify-center flex-1">
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

            <a 
              href={`https://runeforge.dev${skin.ItemLink}`} 
              target="_blank" 

              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition w-fit"
            >
              View on Runeforge
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSkin;

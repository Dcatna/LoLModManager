import { Skin } from '@/Types/types';
import React from 'react';
import { useLocation } from 'react-router-dom';

type Props = {};

const PreviewSkin = (props: Props) => {
  const location = useLocation();
  const skin = location.state as Skin;

  return (
<div className="flex w-full justify-center p-8 min-h-screen bg-background text-foreground">
<div className="flex flex-col items-center">  

      <div className="max-w-2xl w-full bg-card rounded-xl shadow-md p-6">
        <img 
          src={skin.Image} 
          alt={skin.Title} 
          className="w-full h-auto rounded-lg mb-6 object-cover"
        />
        <h1 className="text-3xl font-bold mb-4 text-center">{skin.Title}</h1>
        
        {skin.Types && skin.Types.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
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

        <div className="flex justify-center">
          <a 
            href={`https://runeforge.dev${skin.ItemLink}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition"
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

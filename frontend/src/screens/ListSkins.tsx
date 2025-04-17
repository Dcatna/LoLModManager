import React, { useEffect, useState } from 'react';
import { GetSkins } from "../../wailsjs/go/main/App";
import { useStateProducerT } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Skins } from '@/Types/types';
import { Input } from '@/components/ui/input';

type Props = {}

const ListSkins = (props: Props) => {
  const [search, setSearch] = useState("");

  const { loading, error, value } = useStateProducerT<Skins[]>([], async (update) => {
      const data = await GetSkins(search);
      update(data);
    },
    [search], 300);

  return (
    <div className="p-8 min-h-screen bg-background text-foreground overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Find Custom Skins</h1>
      <div className='mb-4'>
        <Input placeholder='Search' value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      {loading && <div className="text-center text-lg">Loading...</div>}
      {error && <div className="text-center text-red-500">Error loading skins</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {value.length > 0 && value.map((skin) => (
          skin && skin.ID ? (
            <Link 
              to={`/preview_skin/${skin.ID}`} 
              state={skin} 
              key={skin.ID}
              className="flex flex-col items-center bg-card rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform"
            >
              <img 
                src={skin.Image} 
                alt={skin.Title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h2 className="text-lg font-semibold truncate">{skin.Title}</h2>
                {skin.Author && <p className="text-sm text-muted-foreground mt-1">{skin.Author}</p>}
              </div>
            </Link>
          ) : null
        ))}
      </div>
    </div>
  );
}

export default ListSkins;

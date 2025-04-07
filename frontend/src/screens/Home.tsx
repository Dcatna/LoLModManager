import React from 'react'
import { GetChampions } from "../../wailsjs/go/main/App"; 
import { useStateProducerT } from '@/lib/utils';

type Props = {}

const Home = (props: Props) => {

  const { loading, error, value } = useStateProducerT<any[]>([], async (update) => {
    const data = await GetChampions();
    console.log(data); 
    update(data);
  });

  return (
    <div className="p-8 min-h-screen bg-background text-foreground overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">League Champions</h1>

      <div className="sm:columns-5 md:columns-7 lg:columns-10 gap-4">
        {value.map((champ) => (
          <div key={champ.ID} className="mb-4 break-inside-avoid border rounded shadow hover:scale-105 transform transition">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.Image}`} 
              alt={champ.Name} 
              className="w-full rounded-t"
            />
            <div className="p-2">
              <p className="font-semibold">{champ.Name}</p>
              <p className="text-gray-500 text-sm">{champ.Tags}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home

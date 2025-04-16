import React from 'react'
import { GetChampions } from "../../wailsjs/go/main/App"; 
import { useStateProducerT } from '@/lib/utils';
import { Champ } from '@/Types/types';
import ChampCard from '@/components/ChampCard';

type Props = {}

const Home = (props: Props) => {

  const { loading, error, value } = useStateProducerT<Champ[]>([], async (update) => {
    const data = await GetChampions();
    update(data);
  });

  return (
    
    <div className="p-8 min-h-screen bg-background text-foreground overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">League Champions</h1>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {value.map((champ) => (
          <ChampCard ID={champ.ID} Name={champ.Name} Image={champ.Image} Tags={champ.Tags} /> 
        ))}
      </div>
    </div>
  )
}

export default Home

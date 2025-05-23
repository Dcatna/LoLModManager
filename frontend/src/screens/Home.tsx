import React, { act, useState } from 'react'
import { GetChampions } from "../../wailsjs/go/main/App"; 
import { useStateProducerT } from '@/lib/utils';
import { Champ } from '@/Types/types';
import ChampCard from '@/components/ChampCard';
import PatcherOutput from '@/components/PatcherOutput';
import { Input } from '@/components/ui/input';

type Props = {}

const Home = (props: Props) => {
  const [activeSkins, setActiveSkins] = useState<string[]>([])
  const [search, setSearch] = useState("");

  const { loading, error, value } = useStateProducerT<Champ[]>([], async (update) => {
    const data = await GetChampions();
    const filtered = data.filter((champ) =>
      champ.Name.toLowerCase().includes(search.toLowerCase())
    )
    update(filtered);
  }, [search], 300)

  console.log(activeSkins)

  return (
    
    <div className="p-8 min-h-screen bg-background text-foreground overflow-y-auto">
      <PatcherOutput />
      <h1 className="text-3xl font-bold mb-8 justify-center flex">Champions</h1>
      <div className='mb-4'>
        <Input placeholder='Search' value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {value.map((champ) => (
          <ChampCard
          key={champ.ID}
          ID={champ.ID}
          Name={champ.Name}
          Image={champ.Image}
          Tags={champ.Tags}
        />
         
        ))}
      </div>
    </div>
  )
}

export default Home

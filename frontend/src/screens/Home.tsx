import React, { act, useState } from 'react'
import { GetChampions } from "../../wailsjs/go/main/App";
import { cn, useStateProducerT } from '@/lib/utils';
import { Champ } from '@/Types/types';
import ChampCard from '@/components/ChampCard';
import PatcherOutput from '@/components/PatcherOutput';
import { Input } from '@/components/ui/input';
import { ChampCard2 } from '@/components/ChampCard2';

type Props = {}

function GameActionsTopBar(props: {
  input: string,
  onInputChange: (input: string) => void;
}) {
  return (
    <div
      data-label="std-in"
      className="panel-label panel-label-default p-4"
    >
      <Input
        onInput={(e: any) => props.onInputChange(e.target.value)}
        placeholder="Search..."
        value={props.input}
        className="border-none h-14 text-2xl">
      </Input>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className='sticky top-0 w-full backdrop-blur-md z-2 flex flex-col'>
        <div className='mt-12 mx-4'>
          <GameActionsTopBar input={search} onInputChange={(input) => setSearch(input)} />
        </div>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 mt-4 mx-4">
        {value.map((champ) => (
          <ChampCard2
            data-label={champ.Name}
            className="panel-label panel-label-default break-inside-avoid"
            modDropdownMenu={() => <></>}
            enableMod={(id, enabled) => {

            }}
            ID={champ.ID}
            Name={champ.Name}
            Image={champ.Image}
            Tags={[]}
            skins={[]}
          />

        ))}
      </div>
    </div>
  )
}

export default Home

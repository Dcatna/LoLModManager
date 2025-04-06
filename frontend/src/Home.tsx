import React, { useEffect, useState } from 'react'
import { GetChampions } from  "../wailsjs/go/main/App"; // path may vary based on setup
import { useStateProducerT } from './lib/utils';


type Props = {}

const Home = (props: Props) => {

    const {loading, error, value} = useStateProducerT<any[]>([], async (update) => {
        const data = await GetChampions();
        console.log(data); 
        update(data);
    });


  return (
    <div className="overflow-x-auto">
        <h1 className="text-3xl font-bold mb-4">League Champions</h1>
        <div className=" sm:columns-5 md:columns-7 lg:columns-10 ">
            <div className=''>
                {value.map((champ) => (
                    <div key={champ.ID} className="border rounded shadow break-inside-avoid">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.Image}`} alt="" />
                    <p className="font-semibold">{champ.Name}</p>
                    <p className="text-gray-500">{champ.Tags}</p>
                    </div>
                    
                ))}
        </div>
        </div>
    </div>
  )
}

export default Home
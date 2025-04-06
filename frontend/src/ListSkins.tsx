import React from 'react'
import { GetSkins } from  "../wailsjs/go/main/App"; // path may vary based on setup
import { useStateProducerT } from './lib/utils';

type Props = {}

const ListSkins = (props: Props) => {

        const {loading, error, value} = useStateProducerT<any[]>([], async (update) => {
            const data = await GetSkins();
            console.log(data); 
            update(data);
        });
    
  return (
    <div className='overflow-x-auto'>
        {value.length > 0 ? 
        value.map(skin => (
          <div >
            <img src={skin.Image} alt="" />
            <div>{skin.Title}</div>
          </div>
          
        )): <div></div>}
    </div>
  )
}

export default ListSkins
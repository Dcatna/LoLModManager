import React, { useEffect, useState } from 'react';
import { GetSkins } from "../../wailsjs/go/main/App";
import { useStateProducerT } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Skin, Skins, SkinsPage } from '@/Types/types';
import { Input } from '@/components/ui/input';
import { callbackify } from 'util';

type Props = {}

const ListSkins = (props: Props) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { loading, error, value } = useStateProducerT<SkinsPage | undefined>(undefined , async (update) => {
      const data = await GetSkins(search, currentPage);
      update({
        Skins: data.skins,
        TotalPages: data.totalPages
      });

    }, [search, currentPage], 300);

  return (
    <div className="p-8 min-h-screen bg-background text-foreground overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Find Custom Skins</h1>
      <div className='mb-4'>
        <Input placeholder='Search' value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>
      {loading && <div className="text-center text-lg">Loading...</div>}
      {error && <div className="text-center text-red-500">Error loading skins</div>}

      {!loading && !error && !value?.Skins && (
        <div className="text-center text-muted-foreground text-lg mt-10">
          No skins found for "{search}".
        </div>
      )}

{!loading && !error && value?.Skins && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {value.Skins.map((skin) =>
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
            {skin.Author && (
              <p className="text-sm text-muted-foreground mt-1">
                {skin.Author}
              </p>
            )}
          </div>
        </Link>
      ) : null
    )}
  </div>
)}


      {!loading && !error ? <div className="flex justify-center mt-8">
        <nav className="inline-flex items-center gap-1 bg-muted p-2 rounded-md shadow-sm">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md text-sm hover:bg-muted-foreground/10 disabled:opacity-30"
          >
            &lt;
          </button>

          {Array.from({ length: value?.TotalPages! }, (_, i) => i + 1).slice(0, 5).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md text-sm ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted-foreground/10"
              }`}
            >
              {page}
            </button>
          ))}

          <span className="px-2">...</span>

          <button
            onClick={() => setCurrentPage(value?.TotalPages!)}
            className={`px-3 py-1 rounded-md text-sm ${
              currentPage === value?.TotalPages
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted-foreground/10"
            }`}
          >
            {value?.TotalPages}
          </button>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, value?.TotalPages!))}
            disabled={currentPage === value?.TotalPages}
            className="px-3 py-1 rounded-md text-sm hover:bg-muted-foreground/10 disabled:opacity-30"
          >
            &gt;
          </button>
        </nav>
      </div> : <div/>}

    </div>
  );
}

export default ListSkins;

import { GetChampions } from  "../wailsjs/go/main/App"; // path may vary based on setup
import { useEffect, useState } from 'react';

function App() {
  const [champions, setChampions] = useState<any[]>([]);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const data = await GetChampions();
        console.log(data); // 👈 You should see your champion array here
        setChampions(data);
      } catch (err) {
        console.error("Error fetching champions:", err);
      }
    };

    fetchChampions();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">League Champions</h1>
      <div className="grid grid-cols-3 gap-4">
      {champions && champions.length > 0 && champions.map((champ) => (
            <div key={champ.ID} className="border p-4 rounded shadow">
                <p className="font-semibold">{champ.Name}</p>
                <p className="text-gray-500">{champ.Tags}</p>
            </div>
            ))}
      </div>
    </div>
  );
}

export default App;


 "../wailsjs/go/main/App"
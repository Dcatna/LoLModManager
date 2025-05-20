import { useState, useEffect } from "react";
import { GetSetting, SetSetting, FindLeaugeDownload, BrowseLeagueFolder } from "../../wailsjs/go/main/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpenIcon } from "lucide-react";
import PatcherOutput from "@/components/PatcherOutput";

const Settings = () => {
  const [leaguePath, setLeaguePath] = useState("")

  useEffect(() => {
    async function fetchSettings() {
      const savedPath = await GetSetting("league_path")
      if (savedPath) setLeaguePath(savedPath)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    await SetSetting("league_path", leaguePath)

  };

  console.log(leaguePath)

  return (
    <div className="p-8 min-h-screen bg-background text-foreground">
      <PatcherOutput />

      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="max-w-xl bg-card rounded-lg shadow p-6 space-y-6">
        <div>
          <Label htmlFor="leaguePath" className="block mb-2">
            Your League of Legends Folder Path: {leaguePath == "" ? "" : leaguePath}
          </Label>
          <div className="flex gap-2">
            <Input
              id="leaguePath"
              type="text"
              value={leaguePath}
              onChange={(e) => setLeaguePath(e.target.value)}
              placeholder={leaguePath == "" ? "C:/Riot Games/League of Legends" : leaguePath}
            />
            <Button variant="secondary" onClick={async () => {
              try {
                const folder = await BrowseLeagueFolder()
                if (folder) {
                  setLeaguePath(folder)
                  await handleSave()
                }
              } catch (e) {
                alert(e)
              }
            }}>
              <FolderOpenIcon className="w-5 h-5" />
            </Button>
            <Button variant="secondary" onClick={async () => {
              try {
                await FindLeaugeDownload()
              } catch (e) {
                alert(e)
              }
              
              }}>
              Scan
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="px-6 py-2">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

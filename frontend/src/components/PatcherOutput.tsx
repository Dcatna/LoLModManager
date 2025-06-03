import { useEffect, useState } from 'react'
import { EventsOn } from 'wailsjs/runtime/runtime';

type Props = {}

const PatcherOutput = (props: Props) => {
  const [latestMessage, setLatestMessage] = useState("")

  useEffect(() => {
    // const unbind = EventsOn("patcher:log", (data) => {
    //   if (data && typeof data === "string") {
    //     setLatestMessage(data.trim())
    //   }
    // })

    // return () => {
    //   unbind()
    // }
  }, [])

  if (latestMessage === "") {
    return <></>
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1e1b2e] text-[#9ddfff] text-sm px-4 py-2 font-mono shadow-md z-50">
      {latestMessage}
    </div>
  );
};


export default PatcherOutput
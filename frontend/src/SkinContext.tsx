import React, { createContext, useContext, useState } from "react";

type SkinContextType = {
  activeSkins: string[]
  updateActiveSkins: (skin: string, mode: "add" | "remove") => void
}

const SkinContext = createContext<SkinContextType | undefined>(undefined)

export const SkinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSkins, setActiveSkins] = useState<string[]>([])

  const updateActiveSkins = (skin: string, mode: "add" | "remove") => {
    setActiveSkins((prev) =>
      mode === "add" ? [...prev, skin] : prev.filter((s) => s !== skin)
    )
  }
  console.log(activeSkins)
  return (
    <SkinContext.Provider value={{ activeSkins, updateActiveSkins }}>
      {children}
    </SkinContext.Provider>
  )
}

export const useSkinContext = () => {
  const context = useContext(SkinContext)
  if (!context) throw new Error("useSkinContext must be used within a SkinProvider")
  return context
}

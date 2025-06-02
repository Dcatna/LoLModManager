import React, { HTMLAttributes, ReactElement, useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { cn, useStateProducer } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { db } from "wailsjs/go/models";
import { FetchSkinsForChampionById } from "wailsjs/go/main/App";


export interface CharacterInfoCardProps extends HTMLAttributes<HTMLDivElement> {
    ID: string;
    Name: string;
    Image: string;
    Tags: string[];
    skins: db.DownloadedSkin[];
    enableMod: (id: string, enabled: boolean) => void;
    modDropdownMenu: () => ReactElement | undefined;
}

const TextDisplay = ({ text, availableSpace }: { text: string, availableSpace: number }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (textRef.current) {
            setIsOverflowing(textRef.current.scrollWidth > availableSpace);
        }
    }, [text, availableSpace]);

    return (
        <div className="overflow-hidden whitespace-nowrap" style={{ maxWidth: availableSpace }}>
            <div className={cn("inline-block", isOverflowing ? "animate-marquee" : "")}>
                <span ref={textRef} className="inline-block text-sm">  {text}</span>
                {isOverflowing ? <span className="inline-block text-sm px-4">  {text}</span> : undefined}
            </div>
            <style>{`
      @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
      }

        .animate-marquee {
          display: inline-block;
          animation: marquee 6s linear infinite;
        }
      `}</style>
        </div>
    );
};


const ModRow = ({
    filename,
    id,
    enableFn,
    enabled,
    dropdownMenu,
    tags,
    images = undefined
}: {
    id: string,
    filename: string,
    tags: string[],
    enableFn: (id: string, enabled: boolean) => void,
    enabled: boolean,
    dropdownMenu: React.ReactNode,
    hasTextures?: boolean,
    isTexture?: boolean,
    images?: string[]
}) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const controlRef = useRef<HTMLDivElement>(null);
    const [availableWidth, setAvailableWidth] = useState(200);

    useEffect(() => {
        let frameId: number;

        const listener = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                if (rowRef.current) {
                    const rowWidth = rowRef.current.clientWidth;
                    const controlsWidth = controlRef.current?.clientWidth ?? 100;
                    setAvailableWidth(rowWidth - controlsWidth);
                }
            });
        };

        window.addEventListener("resize", listener);
        listener();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", listener);
        };
    }, []);

    return (
        <div ref={rowRef} className="flex flex-row items-center w-full">
            <div className="flex-grow overflow-hidden mr-2">
                <HoverCard>
                    <HoverCardTrigger>
                        <TextDisplay
                            text={filename}
                            availableSpace={availableWidth}
                        />
                    </HoverCardTrigger>
                    {(images?.length ?? 0) > 0 ? (
                        <HoverCardContent className="flex flex-col w-96 overflow-clip backdrop-blur-md bg-primary/20">
                            <text>{filename}</text>
                            <text>Tags: {tags.join(", ")}</text>
                            <div className="flex flex-row space-x-2 overflow-x-auto">
                                {images?.map((uri) => (
                                    <img className="object-cover aspect-square w-70 h-70 m-2" src={uri} />
                                ))}
                            </div>
                        </HoverCardContent>
                    ) : <HoverCardContent>No Images for {filename}</HoverCardContent>}

                </HoverCard>
            </div>

            <div ref={controlRef} className="flex flex-row items-center space-x-1 flex-shrink-0">
                <Switch
                    className="my-1"
                    checked={enabled}
                    onCheckedChange={() => enableFn(id, !enabled)}
                />
                {dropdownMenu}
            </div>
        </div >
    );
};

export function ChampCard2({
    modDropdownMenu,
    enableMod,
    ...props
}: CharacterInfoCardProps) {

    const skins = useStateProducer<db.DownloadedSkin[]>([], async (update) => {
        const data = await FetchSkinsForChampionById(props.ID)
        update(data)
    })

    return (
        <div
            className="w-full rounded-none"
            {...props}
        >
            <div className="flex flex-row m-2 w-full mt-4">
                <div className="w-1/3 pr-2 flex flex-col items-center">
                    <img
                        src={"https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/" + props.Image}
                        alt={`${props.Name} Avatar`}
                        className="w-full aspect-square object-cover rounded-md"
                    />
                    <b className="text-lg p-2 text-center truncate w-full">{props.Name}</b>
                </div>
                <div className="w-2/3 overflow-hidden  overflow-y-auto me-2">
                    <div className="max-h-[300px] w-full">
                        {skins?.map((skin) => (
                            <div key={skin.id} className="flex flex-col mb-2 pe-1">
                                <ModRow
                                    id={skin.id}
                                    filename={skin.file_path}
                                    enableFn={enableMod}
                                    enabled={skin.isActive > 0}
                                    dropdownMenu={modDropdownMenu()}
                                    tags={[]}
                                    images={undefined}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import type { Map as MaplibreMap } from "maplibre-gl";

interface MapZoomControlProps {
  map?: MaplibreMap;
}

export function MapZoomControl({ map }: MapZoomControlProps) {
  const zoomIn = () => map?.zoomIn();
  const zoomOut = () => map?.zoomOut();

  return (
    <div className="rounded-lg bg-white shadow-md overflow-hidden my-6">
      <ButtonGroup orientation="vertical" className="w-full">
        <Button
          variant="ghost"
          onClick={zoomIn}
          title="Zoom avant"
          className="w-10 h-9 rounded-none border-none"
        >
          <PlusIcon className="size-5 text-neutral-800" />
        </Button>
        <ButtonGroupSeparator
          orientation="horizontal"
          className="bg-neutral-300"
        />
        <Button
          variant="ghost"
          onClick={zoomOut}
          title="Zoom arrière"
          className="w-10 h-9 rounded-none border-none"
        >
          <MinusIcon className="size-5 text-neutral-800" />
        </Button>
      </ButtonGroup>
    </div>
  );
}

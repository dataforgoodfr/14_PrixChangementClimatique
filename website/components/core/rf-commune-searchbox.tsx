"use client";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { MapPin, X } from "lucide-react";

type QueryResult = {
  nom: string;
  code: string;
  departement: {
    code: string;
    nom: string;
  }
}

type QueryResponse = QueryResult[];

export type SearchCommuneResult = {
  code: string;
  nom: string;
};

interface CommuneSearchBoxProps {
  onAddressFilter: (result: SearchCommuneResult | undefined) => void;
}

export default function CommuneSearchBox({
  onAddressFilter,
}: CommuneSearchBoxProps) {
  const [filterString, setFilterString] = useState("");
  const [dropDownIsOpened, setDropDownOpen] = useState(false);
  const [communesList, setCommunesList] = useState<QueryResult[]>([]);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);

  async function performSearch(filterString: string) {
    const fetchUrl = new URL("https://geo.api.gouv.fr/communes?boost=population&fields=departement&limit=20");
    fetchUrl.searchParams.set("nom", filterString);

    try {
      const response = await fetch(fetchUrl);
      const data: QueryResponse = await response.json();

      if (data) {
        setCommunesList(data);
        setDropDownOpen(true);
      } else {
        setCommunesList([]);
        setDropDownOpen(false);
      }
    } catch {
      setCommunesList([]);
      setDropDownOpen(false);
    }
  }

  async function handleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e?.target?.value) {
      setFilterString("");
      setCommunesList([]);
      return;
    }

    if (delayHandler) {
      clearTimeout(delayHandler);
    }

    setFilterString(e.target.value);

    if (e.target.value?.length >= 3) {
      setDelayHandler(
        setTimeout(() => {
          performSearch(e.target.value);
        }, 200),
      );
    } else {
      setCommunesList([]);
    }
  }

  function handleAddressSelect(commune: QueryResult) {
    setDropDownOpen(false);

    setFilterString(commune.nom);
    onAddressFilter(commune);
  }

  function clearSearch() {
    setFilterString("");
    setCommunesList([]);
    setDropDownOpen(false);
    onAddressFilter(undefined);
  }

  return (
    <Popover open={dropDownIsOpened} onOpenChange={setDropDownOpen}>
      <PopoverAnchor asChild>
        <div className="flex items-center relative">
          <MapPin
            size={16}
            className="absolute left-3 text-muted-foreground pointer-events-none"
          />
          <Input
            className="pl-8"
            value={filterString}
            placeholder="Rechercher une commune par son nom"
            onChange={handleFilterChange}
            onFocus={() => {
              if (filterString?.length >= 3) {
                setDropDownOpen(true);
              }
            }}
            autoComplete="off"
            data-1p-ignore
          />
          {filterString && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Vider la recherche"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        asChild={true}
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
        sideOffset={5}
        className="p-0 w-(--radix-popover-trigger-width)"
      >
        <Command className="rounded-lg border shadow-md">
          <CommandEmpty className="py-2 text-center text-sm text-muted-foreground">
            Aucune adresse trouvée.
          </CommandEmpty>
          <CommandList className="max-h-75 w-full overflow-auto">
            <CommandGroup key="CommuneList">
              {communesList.map((commune) => {
                return (
                  <CommandItem
                    className="flex items-center py-2"
                    key={commune.code}
                    value={commune.code}
                    onSelect={() => handleAddressSelect(commune)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="grow text-sm">{commune.nom}</div>
                      <div className="text-xs">{commune.departement.nom} ({commune.departement.code})</div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { ErrorMessage } from "@/components/ui/error-message";
import useSWR from "swr";

type QueryResult = {
  nom: string;
  code: string;
  departement: {
    code: string;
    nom: string;
  };
  centre: { type: string; coordinates: [number, number] };
};

type QueryResponse = QueryResult[];

export type SearchCommuneResult = {
  code: string;
  nom: string;
  centre: { coordinates: [number, number] };
};

interface CommuneSearchBoxProps {
  onAddressFilter: (result: SearchCommuneResult | undefined) => void;
  filterValue?: string;
  className?: string;
}

export function RFCommuneSearchBox({
  onAddressFilter,
  filterValue,
  className,
}: CommuneSearchBoxProps) {
  const delayHandler = useRef<NodeJS.Timeout | null>(null);
  const [filterString, setFilterString] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [dropDownIsOpened, setDropDownOpen] = useState(false);
  const isExternalUpdate = useRef(false);

  const apiUrl = debouncedFilter
    ? `https://geo.api.gouv.fr/communes?boost=population&fields=code,nom,departement,centre&limit=20&nom=${encodeURIComponent(
        debouncedFilter,
      )}`
    : null;

  const {
    data: communesList,
    error,
    isLoading,
  } = useSWR<QueryResponse>(apiUrl);

  // Handle commune selection from click on the map
  useEffect(() => {
    if (filterValue !== filterString) {
      isExternalUpdate.current = true;
      setFilterString(filterValue ?? "");
      setDebouncedFilter(filterValue ?? "");
    }
    // We only want this hook to execute when filterValue change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue]);

  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e?.target?.value) {
      setFilterString("");
      setDropDownOpen(false);
      return;
    }

    if (delayHandler.current) {
      clearTimeout(delayHandler.current);
    }

    setFilterString(e.target.value);

    if (e.target.value?.length >= 3) {
      delayHandler.current = setTimeout(() => {
        setDebouncedFilter(e.target.value);
      }, 200);
      setDropDownOpen(true);
    } else {
      setDebouncedFilter("");
      setDropDownOpen(false);
    }

    setFilterString(e.target.value);
  }

  function handleAddressSelect(commune: QueryResult) {
    setDropDownOpen(false);

    setFilterString(commune.nom);
    onAddressFilter(commune);
  }

  function clearSearch() {
    setFilterString("");
    setDebouncedFilter("");
    setDropDownOpen(false);
    onAddressFilter(undefined);
  }

  return (
    <div className="space-y-2">
      {error && (
        <ErrorMessage
          error="Impossible de charger les communes"
          className="text-sm"
        />
      )}
      <Popover open={dropDownIsOpened} onOpenChange={setDropDownOpen}>
        <PopoverAnchor asChild>
          <div className={cn("flex items-center relative", className)}>
            <Search size={16} className="absolute left-3 pointer-events-none" />
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
              {isLoading ? "Chargement..." : "Aucune adresse trouvée."}
            </CommandEmpty>
            <CommandList className="max-h-75 w-full overflow-auto">
              <CommandGroup key="CommuneList">
                {communesList?.map((commune) => {
                  return (
                    <CommandItem
                      className="flex items-center py-2 cursor-pointer"
                      key={commune.code}
                      value={commune.code}
                      onSelect={() => handleAddressSelect(commune)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="grow text-sm">{commune.nom}</div>
                        <div className="text-xs">
                          {commune.departement.nom} ({commune.departement.code})
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

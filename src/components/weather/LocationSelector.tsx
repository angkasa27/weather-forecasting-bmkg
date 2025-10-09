"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Search, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useRegionHierarchy } from "@/hooks/use-regions-data";
import {
  getRegionDescription,
  getRegionPath,
  defaultRegionCode,
} from "@/lib/regions";
import type { Province, Regency, District, Village } from "@/lib/regions";

interface LocationSelectorProps {
  selectedLocationCode?: string;
  onLocationChange: (locationCode: string) => void;
  className?: string;
}

interface SelectionState {
  province?: Province;
  regency?: Regency;
  district?: District;
  village?: Village;
}

export function LocationSelector({
  selectedLocationCode = defaultRegionCode,
  onLocationChange,
  className,
}: LocationSelectorProps) {
  const { data: regionHierarchy, isLoading } = useRegionHierarchy();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selection, setSelection] = useState<SelectionState>({});

  // Initialize selection from selectedLocationCode
  useEffect(() => {
    if (regionHierarchy && selectedLocationCode) {
      const path = getRegionPath(regionHierarchy, selectedLocationCode);
      setSelection(path);
    }
  }, [regionHierarchy, selectedLocationCode]);

  // Filter regions based on search query
  const filteredRegions = useMemo(() => {
    if (!regionHierarchy || !searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const matchedVillages: Village[] = [];

    // Search through all villages
    regionHierarchy.villageMap.forEach((village) => {
      if (village.name.toLowerCase().includes(query)) {
        matchedVillages.push(village);
      }
    });

    return matchedVillages.slice(0, 50); // Limit results for performance
  }, [regionHierarchy, searchQuery]);

  const handleProvinceSelect = (province: Province) => {
    setSelection({ province });
    setSearchQuery("");
  };

  const handleRegencySelect = (regency: Regency) => {
    setSelection((prev) => ({ ...prev, regency }));
  };

  const handleDistrictSelect = (district: District) => {
    setSelection((prev) => ({ ...prev, district }));
  };

  const handleVillageSelect = (village: Village) => {
    if (regionHierarchy) {
      const path = getRegionPath(regionHierarchy, village.code);
      setSelection(path);
      onLocationChange(village.code);
      setOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchResultSelect = (village: Village) => {
    handleVillageSelect(village);
  };

  const clearSelection = () => {
    setSelection({});
    setSearchQuery("");
  };

  const getDisplayText = () => {
    if (!regionHierarchy || !selectedLocationCode) {
      return "Pilih lokasi...";
    }
    return getRegionDescription(regionHierarchy, selectedLocationCode);
  };

  const canSelectVillage =
    selection.province && selection.regency && selection.district;

  if (isLoading) {
    return (
      <div className="w-full">
        <Button
          variant="outline"
          className="w-full justify-between h-auto min-h-12 px-3 py-2 text-left"
          disabled
        >
          <span className="text-muted-foreground">Memuat data lokasi...</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-12 px-3 py-2 text-left"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm">{getDisplayText()}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Cari lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {(searchQuery || Object.keys(selection).length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-auto p-1 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <CommandList className="max-h-80">
              {/* Search Results */}
              {searchQuery && filteredRegions && (
                <CommandGroup heading="Hasil Pencarian">
                  {filteredRegions.length === 0 ? (
                    <CommandEmpty>
                      Tidak ditemukan lokasi yang cocok
                    </CommandEmpty>
                  ) : (
                    filteredRegions.map((village) => (
                      <CommandItem
                        key={village.code}
                        value={village.code}
                        onSelect={() => handleSearchResultSelect(village)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedLocationCode === village.code
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {village.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {regionHierarchy &&
                              getRegionDescription(
                                regionHierarchy,
                                village.code
                              )}
                          </div>
                        </div>
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              )}

              {/* Hierarchical Selection */}
              {!searchQuery && regionHierarchy && (
                <>
                  {/* Province Selection */}
                  {!selection.province && (
                    <CommandGroup heading="Pilih Provinsi">
                      {regionHierarchy.provinces.map((province) => (
                        <CommandItem
                          key={province.code}
                          value={province.code}
                          onSelect={() => handleProvinceSelect(province)}
                          className="cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{province.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {province.regencies.length} kabupaten/kota
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Selection Breadcrumb */}
                  {selection.province && (
                    <div className="px-3 py-2 border-b">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {selection.province.name}
                        </Badge>
                        {selection.regency && (
                          <Badge variant="secondary" className="text-xs">
                            {selection.regency.name}
                          </Badge>
                        )}
                        {selection.district && (
                          <Badge variant="secondary" className="text-xs">
                            {selection.district.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Regency Selection */}
                  {selection.province && !selection.regency && (
                    <CommandGroup heading="Pilih Kabupaten/Kota">
                      {selection.province.regencies.map((regency) => (
                        <CommandItem
                          key={regency.code}
                          value={regency.code}
                          onSelect={() => handleRegencySelect(regency)}
                          className="cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{regency.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {regency.districts.length} kecamatan
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* District Selection */}
                  {selection.regency && !selection.district && (
                    <CommandGroup heading="Pilih Kecamatan">
                      {selection.regency.districts.map((district) => (
                        <CommandItem
                          key={district.code}
                          value={district.code}
                          onSelect={() => handleDistrictSelect(district)}
                          className="cursor-pointer"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{district.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {district.villages.length} desa/kelurahan
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Village Selection */}
                  {canSelectVillage && (
                    <CommandGroup heading="Pilih Desa/Kelurahan">
                      {selection.district!.villages.map((village) => (
                        <CommandItem
                          key={village.code}
                          value={village.code}
                          onSelect={() => handleVillageSelect(village)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedLocationCode === village.code
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{village.name}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}

              {!searchQuery && !selection.province && (
                <CommandEmpty>Mulai dengan memilih provinsi</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Download, RefreshCw, Wind, Cloud } from "lucide-react";
import Image from "next/image";
import { useRegionHierarchy } from "@/hooks/use-regions-data";
import { useWeatherData } from "@/hooks/use-weather-data";
import { downloadCSV, type ProcessedWeatherData } from "@/lib/weather-api";
import {
  defaultRegionCode,
  getRegionDescription,
  getRegionPath,
  splitRegionCode,
} from "@/lib/regions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const WeatherTable = () => {
  const initialCodes = useMemo(() => splitRegionCode(defaultRegionCode), []);
  const [provinceCode, setProvinceCode] = useState(initialCodes.provinceCode);
  const [regencyCode, setRegencyCode] = useState(initialCodes.regencyCode);
  const [districtCode, setDistrictCode] = useState(initialCodes.districtCode);
  const [villageCode, setVillageCode] = useState(
    initialCodes.villageCode || defaultRegionCode
  );
  const [initializedSelection, setInitializedSelection] = useState(false);

  const {
    data: regionHierarchy,
    isLoading: isRegionLoading,
    error: regionError,
  } = useRegionHierarchy();

  useEffect(() => {
    if (!regionHierarchy || initializedSelection) {
      return;
    }

    const defaultPath = getRegionPath(regionHierarchy, defaultRegionCode);

    if (defaultPath.village) {
      setProvinceCode(defaultPath.province?.code ?? "");
      setRegencyCode(defaultPath.regency?.code ?? "");
      setDistrictCode(defaultPath.district?.code ?? "");
      setVillageCode(defaultPath.village.code);
      setInitializedSelection(true);
      return;
    }

    const fallbackProvince = regionHierarchy.provinces[0];
    const fallbackRegency = fallbackProvince?.regencies[0];
    const fallbackDistrict = fallbackRegency?.districts[0];
    const fallbackVillage = fallbackDistrict?.villages[0];

    setProvinceCode(fallbackProvince?.code ?? initialCodes.provinceCode);
    setRegencyCode(fallbackRegency?.code ?? initialCodes.regencyCode);
    setDistrictCode(fallbackDistrict?.code ?? initialCodes.districtCode);
    setVillageCode(fallbackVillage?.code ?? defaultRegionCode);
    setInitializedSelection(true);
  }, [regionHierarchy, initializedSelection, initialCodes]);

  const currentRegionCode = villageCode || defaultRegionCode;
  const { data, isLoading, error, refetch, isFetching } =
    useWeatherData(currentRegionCode);

  const weatherData: ProcessedWeatherData[] = data ?? [];

  const provinceOptions = regionHierarchy?.provinces ?? [];
  const regencyOptions = useMemo(() => {
    if (!regionHierarchy || !provinceCode) {
      return [];
    }
    return regionHierarchy.provinceMap.get(provinceCode)?.regencies ?? [];
  }, [regionHierarchy, provinceCode]);

  const districtOptions = useMemo(() => {
    if (!regionHierarchy || !regencyCode) {
      return [];
    }
    return regionHierarchy.regencyMap.get(regencyCode)?.districts ?? [];
  }, [regionHierarchy, regencyCode]);

  const villageOptions = useMemo(() => {
    if (!regionHierarchy || !districtCode) {
      return [];
    }
    return regionHierarchy.districtMap.get(districtCode)?.villages ?? [];
  }, [regionHierarchy, districtCode]);

  useEffect(() => {
    if (!regionHierarchy) {
      return;
    }

    if (provinceCode && !regionHierarchy.provinceMap.has(provinceCode)) {
      setProvinceCode(regionHierarchy.provinces[0]?.code ?? "");
    }
  }, [provinceCode, regionHierarchy]);

  useEffect(() => {
    if (!initializedSelection || !regionHierarchy) {
      return;
    }

    if (regencyOptions.length === 0) {
      setRegencyCode("");
      setDistrictCode("");
      setVillageCode("");
      return;
    }

    const currentRegencyStillExists = regencyOptions.some(
      (regency) => regency.code === regencyCode
    );
    if (!currentRegencyStillExists) {
      const fallback = regencyOptions[0];
      const fallbackDistrict = fallback.districts[0];
      const fallbackVillage = fallbackDistrict?.villages[0];
      setRegencyCode(fallback.code);
      setDistrictCode(fallbackDistrict?.code ?? "");
      setVillageCode(
        fallbackVillage?.code ?? fallbackDistrict?.villages[0]?.code ?? ""
      );
    }
  }, [initializedSelection, regencyOptions, regencyCode, regionHierarchy]);

  useEffect(() => {
    if (!initializedSelection || !regionHierarchy) {
      return;
    }

    if (districtOptions.length === 0) {
      setDistrictCode("");
      setVillageCode("");
      return;
    }

    const currentDistrictStillExists = districtOptions.some(
      (district) => district.code === districtCode
    );
    if (!currentDistrictStillExists) {
      const fallback = districtOptions[0];
      const fallbackVillage = fallback.villages[0];
      setDistrictCode(fallback.code);
      setVillageCode(fallbackVillage?.code ?? fallback.villages[0]?.code ?? "");
    }
  }, [initializedSelection, districtOptions, districtCode, regionHierarchy]);

  useEffect(() => {
    if (!initializedSelection || !regionHierarchy) {
      return;
    }

    if (villageOptions.length === 0) {
      setVillageCode("");
      return;
    }

    const currentVillageStillExists = villageOptions.some(
      (village) => village.code === villageCode
    );
    if (!currentVillageStillExists) {
      setVillageCode(villageOptions[0].code);
    }
  }, [initializedSelection, villageOptions, villageCode, regionHierarchy]);

  const regionDescription = regionHierarchy
    ? getRegionDescription(regionHierarchy, currentRegionCode)
    : `Kode ${currentRegionCode}`;

  const selectedVillage = regionHierarchy?.villageMap.get(currentRegionCode);

  const handleProvinceChange = (value: string) => {
    setProvinceCode(value);

    if (!regionHierarchy) {
      return;
    }

    const province = regionHierarchy.provinceMap.get(value);
    const nextRegency = province?.regencies[0];
    const nextDistrict = nextRegency?.districts[0];
    const nextVillage = nextDistrict?.villages[0];

    setRegencyCode(nextRegency?.code ?? "");
    setDistrictCode(nextDistrict?.code ?? "");
    setVillageCode(nextVillage?.code ?? currentRegionCode);
  };

  const handleRegencyChange = (value: string) => {
    setRegencyCode(value);

    if (!regionHierarchy) {
      return;
    }

    const regency = regionHierarchy.regencyMap.get(value);
    const nextDistrict = regency?.districts[0];
    const nextVillage = nextDistrict?.villages[0];

    setDistrictCode(nextDistrict?.code ?? "");
    setVillageCode(nextVillage?.code ?? currentRegionCode);
  };

  const handleDistrictChange = (value: string) => {
    setDistrictCode(value);

    if (!regionHierarchy) {
      return;
    }

    const district = regionHierarchy.districtMap.get(value);
    const nextVillage = district?.villages[0];
    setVillageCode(nextVillage?.code ?? currentRegionCode);
  };

  const handleVillageChange = (value: string) => {
    setVillageCode(value);
  };

  const handleDownloadCSV = () => {
    if (weatherData && weatherData.length > 0) {
      const now = new Date();
      const regionLabel = selectedVillage?.name ?? currentRegionCode;
      const filename = `Prakiraan Cuaca ${regionLabel} ${format(
        now,
        "dd-MMMM-yyyy HH.mm",
        { locale: id }
      )} WIB.csv`;
      downloadCSV(weatherData, filename);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const isInitialWeatherLoading = isLoading && !data;
  const displayedWeather = weatherData;
  const hasWeatherData = displayedWeather.length > 0;

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">😞</div>
        <h3 className="text-lg font-bold text-red-700 mb-2">
          Oops! Ada Masalah
        </h3>
        <p className="text-red-600 mb-6 max-w-md mx-auto">
          Maaf, kami tidak bisa mengambil data cuaca saat ini. Mungkin ada
          masalah dengan koneksi atau server sedang sibuk.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:scale-[1.02]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </button>
          <p className="text-xs text-red-500">Detail error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Pilih Lokasi Cuaca
              </h2>
              <p className="text-gray-600 text-sm">
                Terakhir diperbarui:{" "}
                {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })} WIB
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-blue-900 mb-1">
              📍 Pilih Lokasi
            </h3>
            <p className="text-xs text-blue-700 mb-4">
              Pilih wilayah Anda hingga kelurahan/desa untuk mendapat prakiraan
              cuaca yang akurat
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="province-selector"
                  className="text-sm font-medium text-gray-700"
                >
                  🏛️ Provinsi
                </Label>
                {isRegionLoading && provinceOptions.length === 0 ? (
                  <Skeleton className="h-11 w-full rounded-lg" />
                ) : (
                  <Select
                    value={provinceCode || undefined}
                    onValueChange={handleProvinceChange}
                    disabled={
                      Boolean(regionError) || provinceOptions.length === 0
                    }
                  >
                    <SelectTrigger
                      id="province-selector"
                      aria-label="Provinsi"
                      className="h-11 rounded-lg border-gray-300 focus:border-blue-500"
                    >
                      <SelectValue
                        placeholder={
                          isRegionLoading
                            ? "Memuat provinsi..."
                            : "Pilih provinsi Anda"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {provinceOptions.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="regency-selector"
                  className="text-sm font-medium text-gray-700"
                >
                  🏢 Kabupaten/Kota
                </Label>
                {isRegionLoading && regencyOptions.length === 0 ? (
                  <Skeleton className="h-11 w-full rounded-lg" />
                ) : (
                  <Select
                    value={regencyCode || undefined}
                    onValueChange={handleRegencyChange}
                    disabled={!regencyOptions.length}
                  >
                    <SelectTrigger
                      id="regency-selector"
                      aria-label="Kabupaten atau kota"
                      className="h-11 rounded-lg border-gray-300 focus:border-blue-500"
                    >
                      <SelectValue
                        placeholder={
                          regencyOptions.length
                            ? "Pilih kabupaten/kota"
                            : "Pilih provinsi dulu ya"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {regencyOptions.map((regency) => (
                        <SelectItem key={regency.code} value={regency.code}>
                          {regency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="district-selector"
                  className="text-sm font-medium text-gray-700"
                >
                  🏘️ Kecamatan
                </Label>
                {isRegionLoading && districtOptions.length === 0 ? (
                  <Skeleton className="h-11 w-full rounded-lg" />
                ) : (
                  <Select
                    value={districtCode || undefined}
                    onValueChange={handleDistrictChange}
                    disabled={!districtOptions.length}
                  >
                    <SelectTrigger
                      id="district-selector"
                      aria-label="Kecamatan"
                      className="h-11 rounded-lg border-gray-300 focus:border-blue-500"
                    >
                      <SelectValue
                        placeholder={
                          districtOptions.length
                            ? "Pilih kecamatan"
                            : "Pilih kab/kota dulu ya"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((district) => (
                        <SelectItem key={district.code} value={district.code}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="village-selector"
                  className="text-sm font-medium text-gray-700"
                >
                  🏠 Kelurahan/Desa
                </Label>
                {isRegionLoading && villageOptions.length === 0 ? (
                  <Skeleton className="h-11 w-full rounded-lg" />
                ) : (
                  <Select
                    value={villageCode || undefined}
                    onValueChange={handleVillageChange}
                    disabled={!villageOptions.length}
                  >
                    <SelectTrigger
                      id="village-selector"
                      aria-label="Kelurahan atau desa"
                      className="h-11 rounded-lg border-gray-300 focus:border-blue-500"
                    >
                      <SelectValue
                        placeholder={
                          villageOptions.length
                            ? "Pilih kelurahan/desa"
                            : "Pilih kecamatan dulu ya"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {villageOptions.map((village) => (
                        <SelectItem key={village.code} value={village.code}>
                          {village.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {regionError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <p className="text-sm text-red-700 font-medium">
                    Tidak bisa memuat daftar wilayah
                  </p>
                </div>
                <p className="text-xs text-red-600 mt-1 ml-6">
                  {regionError.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-[1.02] disabled:bg-blue-400 disabled:scale-100"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Memuat..." : "Perbarui Data"}
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={!hasWeatherData}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:scale-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Unduh CSV
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Loading State */}
        {isInitialWeatherLoading && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Sedang memuat data cuaca...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Harap tunggu sebentar
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isInitialWeatherLoading && !hasWeatherData && (
          <div className="text-center py-12">
            <div className="mb-6">
              <Cloud className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Belum ada data cuaca
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Silakan pilih lokasi yang lebih spesifik atau coba lokasi lain
                untuk mendapatkan prakiraan cuaca.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Weather Cards */}
        {!isInitialWeatherLoading && hasWeatherData && (
          <div className="relative">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ☀️ Prakiraan Cuaca untuk {regionDescription}
              </h3>
              <p className="text-sm text-gray-600">
                Menampilkan {displayedWeather.length} periode prakiraan cuaca
              </p>
            </div>

            {hasWeatherData && (
              <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-green-900 mb-1">
                      Tentang Data Ini
                    </h3>
                    <p className="text-sm text-green-800 leading-relaxed">
                      Data prakiraan cuaca resmi dari <strong>BMKG</strong>{" "}
                      untuk wilayah <strong>{regionDescription}</strong>.
                      Prakiraan ini diperbarui secara berkala dan menampilkan
                      kondisi cuaca untuk beberapa periode ke depan.
                    </p>
                    <div className="mt-2 text-xs text-green-700 bg-green-100 rounded-lg px-3 py-1 inline-block">
                      Kode Wilayah: {currentRegionCode}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedWeather.map((item, index) => (
                <div
                  key={`${item.tanggal}-${item.jam}-${index}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-semibold text-blue-900">
                      📅 {item.tanggal}
                    </div>
                    <div className="text-xs text-blue-700">
                      🕐 Pukul {item.jam} WIB
                    </div>
                  </div>

                  {/* Weather Icon & Condition */}
                  <div className="p-4 text-center">
                    {item.iconUrl && (
                      <div className="relative h-16 w-16 mx-auto mb-3">
                        <Image
                          src={item.iconUrl}
                          alt={item.cuaca}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {item.cuaca}
                    </h4>
                  </div>

                  {/* Weather Details */}
                  <div className="px-4 pb-4 space-y-3">
                    {/* Temperature */}
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-gray-600">🌡️ Suhu</span>
                      <span className="font-bold text-orange-600">
                        {item.suhu}°C
                      </span>
                    </div>

                    {/* Humidity */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        💧 Kelembapan
                      </span>
                      <span className="font-bold text-blue-600">
                        {item.kelembapan}%
                      </span>
                    </div>

                    {/* Wind */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">💨 Angin</span>
                        <span className="font-bold text-gray-700">
                          {item.kecepatanAnginKmh} km/h
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Arah: {item.arahAngin}° • {item.kecepatanAnginKnots}{" "}
                        knots
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Overlay */}
            {isFetching && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Memperbarui data...
                    </div>
                    <div className="text-xs text-gray-500">
                      Sedang mengambil data terbaru
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherTable;

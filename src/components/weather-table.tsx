'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Download, RefreshCw, Wind } from 'lucide-react'
import Image from 'next/image'
import { useRegionHierarchy } from '@/hooks/use-regions-data'
import { useWeatherData } from '@/hooks/use-weather-data'
import { downloadCSV, type ProcessedWeatherData } from '@/lib/weather-api'
import { defaultRegionCode, getRegionDescription, getRegionPath, splitRegionCode } from '@/lib/regions'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const WeatherTable = () => {
  const initialCodes = useMemo(() => splitRegionCode(defaultRegionCode), [])
  const [provinceCode, setProvinceCode] = useState(initialCodes.provinceCode)
  const [regencyCode, setRegencyCode] = useState(initialCodes.regencyCode)
  const [districtCode, setDistrictCode] = useState(initialCodes.districtCode)
  const [villageCode, setVillageCode] = useState(initialCodes.villageCode || defaultRegionCode)
  const [initializedSelection, setInitializedSelection] = useState(false)

  const {
    data: regionHierarchy,
    isLoading: isRegionLoading,
    error: regionError,
  } = useRegionHierarchy()

  useEffect(() => {
    if (!regionHierarchy || initializedSelection) {
      return
    }

    const defaultPath = getRegionPath(regionHierarchy, defaultRegionCode)

    if (defaultPath.village) {
      setProvinceCode(defaultPath.province?.code ?? '')
      setRegencyCode(defaultPath.regency?.code ?? '')
      setDistrictCode(defaultPath.district?.code ?? '')
      setVillageCode(defaultPath.village.code)
      setInitializedSelection(true)
      return
    }

    const fallbackProvince = regionHierarchy.provinces[0]
    const fallbackRegency = fallbackProvince?.regencies[0]
    const fallbackDistrict = fallbackRegency?.districts[0]
    const fallbackVillage = fallbackDistrict?.villages[0]

    setProvinceCode(fallbackProvince?.code ?? initialCodes.provinceCode)
    setRegencyCode(fallbackRegency?.code ?? initialCodes.regencyCode)
    setDistrictCode(fallbackDistrict?.code ?? initialCodes.districtCode)
    setVillageCode(fallbackVillage?.code ?? defaultRegionCode)
    setInitializedSelection(true)
  }, [regionHierarchy, initializedSelection, initialCodes])

  const currentRegionCode = villageCode || defaultRegionCode
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useWeatherData(currentRegionCode)

  const weatherData: ProcessedWeatherData[] = data ?? []

  const provinceOptions = regionHierarchy?.provinces ?? []
  const regencyOptions = useMemo(() => {
    if (!regionHierarchy || !provinceCode) {
      return []
    }
    return regionHierarchy.provinceMap.get(provinceCode)?.regencies ?? []
  }, [regionHierarchy, provinceCode])

  const districtOptions = useMemo(() => {
    if (!regionHierarchy || !regencyCode) {
      return []
    }
    return regionHierarchy.regencyMap.get(regencyCode)?.districts ?? []
  }, [regionHierarchy, regencyCode])

  const villageOptions = useMemo(() => {
    if (!regionHierarchy || !districtCode) {
      return []
    }
    return regionHierarchy.districtMap.get(districtCode)?.villages ?? []
  }, [regionHierarchy, districtCode])

  useEffect(() => {
    if (!regionHierarchy) {
      return
    }

    if (provinceCode && !regionHierarchy.provinceMap.has(provinceCode)) {
      setProvinceCode(regionHierarchy.provinces[0]?.code ?? '')
    }
  }, [provinceCode, regionHierarchy])

  useEffect(() => {
    if (!initializedSelection || !regionHierarchy) {
      return
    }

    if (regencyOptions.length === 0) {
      setRegencyCode('')
      setDistrictCode('')
      setVillageCode('')
      return
    }

    const currentRegencyStillExists = regencyOptions.some((regency) => regency.code === regencyCode)
    if (!currentRegencyStillExists) {
      const fallback = regencyOptions[0]
      const fallbackDistrict = fallback.districts[0]
      const fallbackVillage = fallbackDistrict?.villages[0]
      setRegencyCode(fallback.code)
      setDistrictCode(fallbackDistrict?.code ?? '')
      setVillageCode(fallbackVillage?.code ?? fallbackDistrict?.villages[0]?.code ?? '')
    }
  }, [initializedSelection, regencyOptions, regencyCode, regionHierarchy])

  useEffect(() => {
    if (!initializedSelection || !regionHierarchy) {
      return
    }

    if (districtOptions.length === 0) {
      setDistrictCode('')
      setVillageCode('')
      return
    }

    const currentDistrictStillExists = districtOptions.some((district) => district.code === districtCode)
    if (!currentDistrictStillExists) {
      const fallback = districtOptions[0]
      const fallbackVillage = fallback.villages[0]
      setDistrictCode(fallback.code)
      setVillageCode(fallbackVillage?.code ?? fallback.villages[0]?.code ?? '')
    }
  }, [initializedSelection, districtOptions, districtCode, regionHierarchy])

  useEffect(() => {
    if (!initializedSelection || !regionHierarchy) {
      return
    }

    if (villageOptions.length === 0) {
      setVillageCode('')
      return
    }

    const currentVillageStillExists = villageOptions.some((village) => village.code === villageCode)
    if (!currentVillageStillExists) {
      setVillageCode(villageOptions[0].code)
    }
  }, [initializedSelection, villageOptions, villageCode, regionHierarchy])

  const regionDescription = regionHierarchy
    ? getRegionDescription(regionHierarchy, currentRegionCode)
    : `Kode ${currentRegionCode}`

  const selectedVillage = regionHierarchy?.villageMap.get(currentRegionCode)

  const handleProvinceChange = (value: string) => {
    setProvinceCode(value)

    if (!regionHierarchy) {
      return
    }

    const province = regionHierarchy.provinceMap.get(value)
    const nextRegency = province?.regencies[0]
    const nextDistrict = nextRegency?.districts[0]
    const nextVillage = nextDistrict?.villages[0]

    setRegencyCode(nextRegency?.code ?? '')
    setDistrictCode(nextDistrict?.code ?? '')
    setVillageCode(nextVillage?.code ?? currentRegionCode)
  }

  const handleRegencyChange = (value: string) => {
    setRegencyCode(value)

    if (!regionHierarchy) {
      return
    }

    const regency = regionHierarchy.regencyMap.get(value)
    const nextDistrict = regency?.districts[0]
    const nextVillage = nextDistrict?.villages[0]

    setDistrictCode(nextDistrict?.code ?? '')
    setVillageCode(nextVillage?.code ?? currentRegionCode)
  }

  const handleDistrictChange = (value: string) => {
    setDistrictCode(value)

    if (!regionHierarchy) {
      return
    }

    const district = regionHierarchy.districtMap.get(value)
    const nextVillage = district?.villages[0]
    setVillageCode(nextVillage?.code ?? currentRegionCode)
  }

  const handleVillageChange = (value: string) => {
    setVillageCode(value)
  }

  const handleDownloadCSV = () => {
    if (weatherData && weatherData.length > 0) {
      const now = new Date()
      const regionLabel = selectedVillage?.name ?? currentRegionCode
      const filename = `Prakiraan Cuaca ${regionLabel} ${format(now, 'dd-MMMM-yyyy HH.mm', { locale: id })} WIB.csv`
      downloadCSV(weatherData, filename)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const isInitialWeatherLoading = isLoading && !data
  const displayedWeather = weatherData
  const hasWeatherData = displayedWeather.length > 0

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">
          Gagal memuat data cuaca: {error.message}
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prakiraan Cuaca STMKG</h1>
            <p className="text-gray-600">
              Terakhir diperbarui: {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })} WIB
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800">Wilayah Administrasi</h2>
            <p className="text-xs text-gray-500">
              Pilih wilayah hingga level kelurahan/desa untuk mendapatkan kode adm4 BMKG.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="province-selector">Provinsi</Label>
                {isRegionLoading && provinceOptions.length === 0 ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={provinceCode || undefined}
                    onValueChange={handleProvinceChange}
                    disabled={Boolean(regionError) || provinceOptions.length === 0}
                  >
                    <SelectTrigger id="province-selector" aria-label="Provinsi">
                      <SelectValue placeholder={isRegionLoading ? 'Memuat provinsi...' : 'Pilih provinsi'} />
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

              <div className="space-y-1.5">
                <Label htmlFor="regency-selector">Kabupaten/Kota</Label>
                {isRegionLoading && regencyOptions.length === 0 ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={regencyCode || undefined}
                    onValueChange={handleRegencyChange}
                    disabled={!regencyOptions.length}
                  >
                    <SelectTrigger id="regency-selector" aria-label="Kabupaten atau kota">
                      <SelectValue placeholder={regencyOptions.length ? 'Pilih kabupaten/kota' : 'Pilih provinsi terlebih dahulu'} />
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

              <div className="space-y-1.5">
                <Label htmlFor="district-selector">Kecamatan</Label>
                {isRegionLoading && districtOptions.length === 0 ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={districtCode || undefined}
                    onValueChange={handleDistrictChange}
                    disabled={!districtOptions.length}
                  >
                    <SelectTrigger id="district-selector" aria-label="Kecamatan">
                      <SelectValue placeholder={districtOptions.length ? 'Pilih kecamatan' : 'Pilih kabupaten/kota terlebih dahulu'} />
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

              <div className="space-y-1.5">
                <Label htmlFor="village-selector">Kelurahan/Desa (adm4)</Label>
                {isRegionLoading && villageOptions.length === 0 ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={villageCode || undefined}
                    onValueChange={handleVillageChange}
                    disabled={!villageOptions.length}
                  >
                    <SelectTrigger id="village-selector" aria-label="Kelurahan atau desa">
                      <SelectValue placeholder={villageOptions.length ? 'Pilih kelurahan/desa' : 'Pilih kecamatan terlebih dahulu'} />
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
              <p className="mt-3 text-sm text-red-600">
                Gagal memuat daftar wilayah: {regionError.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:bg-blue-400"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Perbarui
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={!hasWeatherData}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Unduh CSV
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {isInitialWeatherLoading && (
            <div className="p-6">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            </div>
          )}

          {!isInitialWeatherLoading && !hasWeatherData && (
            <div className="p-8 text-center text-gray-500">
              Tidak ada data cuaca tersedia untuk wilayah ini.
            </div>
          )}

          {!isInitialWeatherLoading && hasWeatherData && (
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-6 py-3">Jam</th>
                      <th className="px-6 py-3">Cuaca</th>
                      <th className="px-6 py-3">Ikon</th>
                      <th className="px-6 py-3">Suhu (°C)</th>
                      <th className="px-6 py-3">Kelembapan (%)</th>
                      <th className="px-6 py-3">Angin</th>
                      <th className="px-6 py-3">Arah (°)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedWeather.map((item, index) => (
                      <tr key={`${item.tanggal}-${item.jam}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">{item.tanggal}</td>
                        <td className="px-6 py-4 text-gray-900">{item.jam}</td>
                        <td className="px-6 py-4 text-gray-900">{item.cuaca}</td>
                        <td className="px-6 py-4">
                          {item.iconUrl && (
                            <div className="relative h-12 w-12">
                              <Image
                                src={item.iconUrl}
                                alt={item.cuaca}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900">{item.suhu}°</td>
                        <td className="px-6 py-4 text-gray-900">{item.kelembapan}%</td>
                        <td className="px-6 py-4 text-gray-900">
                          <div className="flex items-center gap-1">
                            <Wind className="h-4 w-4 text-gray-400" />
                            <span>{item.kecepatanAnginKnots} kn</span>
                            <span className="text-xs text-gray-500">({item.kecepatanAnginKmh} km/h)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{item.arahAngin}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isFetching && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    Memuat data cuaca terkini...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Informasi</h3>
          <p className="mt-1 text-sm text-blue-800">
            Data prakiraan cuaca dari BMKG untuk wilayah administratif {regionDescription} (adm4 {currentRegionCode}).
            Menampilkan {displayedWeather.length} data prakiraan cuaca.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WeatherTable

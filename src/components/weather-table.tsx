'use client'

import { useMemo, useState, type ChangeEvent } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Download, RefreshCw, Wind } from 'lucide-react'
import Image from 'next/image'
import { useWeatherData } from '@/hooks/use-weather-data'
import { downloadCSV } from '@/lib/weather-api'
import { defaultRegionCode, getRegionByCode, getRegionsByProvince, type AdministrativeRegion } from '@/lib/regions'

type ProvinceEntry = {
  province: string
  regions: AdministrativeRegion[]
}

const WeatherTable = () => {
  const [regionCode, setRegionCode] = useState<string>(defaultRegionCode)
  const regionsByProvince = useMemo(() => getRegionsByProvince(), [])
  const provinceEntries = useMemo<ProvinceEntry[]>(() => {
    return Object.entries(regionsByProvince)
      .map(([province, regions]) => ({
        province,
        regions: [...regions].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.province.localeCompare(b.province))
  }, [regionsByProvince])
  const selectedRegion = useMemo(() => getRegionByCode(regionCode), [regionCode])
  const regionDescription = selectedRegion
    ? `${selectedRegion.name}, ${selectedRegion.province}`
    : `Kode ${regionCode}`
  const { data: weatherData, isLoading, error, refetch, isFetching } = useWeatherData(regionCode)

  const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRegionCode(event.target.value)
  }

  const handleDownloadCSV = () => {
    if (weatherData) {
      const now = new Date()
      const regionLabel = selectedRegion?.name ?? regionCode
      const filename = `Prakiraan Cuaca ${regionLabel} ${format(now, 'dd-MMMM-yyyy HH.mm', { locale: id })} WIB.csv`
      downloadCSV(weatherData, filename)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Memuat data cuaca...</span>
        </div>
      </div>
    )
  }

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

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada data cuaca tersedia
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            Prakiraan Cuaca STMKG
          </h1>
          <p className="text-gray-600">
            Terakhir diperbarui: {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })} WIB
          </p>
          <div className="mt-4">
            <label
              htmlFor="region-selector"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Wilayah Administrasi
            </label>
            <select
              id="region-selector"
              value={regionCode}
              onChange={handleRegionChange}
              className="block w-full sm:w-80 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {provinceEntries.map(({ province, regions }) => (
                <optgroup key={province} label={province}>
                  {regions.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Perbarui
          </button>
          
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Unduh CSV
          </button>
        </div>
      </div>

      {/* Weather Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuaca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ikon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suhu (°C)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelembapan (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Angin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arah (°)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weatherData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tanggal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.jam}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.cuaca}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.iconUrl && (
                      <div className="w-12 h-12 relative">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.suhu}°
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.kelembapan}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Wind className="w-4 h-4 text-gray-400" />
                      <span>{item.kecepatanAnginKnots} kn</span>
                      <span className="text-xs text-gray-500">
                        ({item.kecepatanAnginKmh} km/h)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.arahAngin}°
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Informasi</h3>
        <p className="text-blue-700 text-sm">
          Data prakiraan cuaca dari BMKG untuk wilayah administratif {regionDescription} (adm4 {regionCode}).
          Menampilkan {weatherData.length} data prakiraan cuaca.
        </p>
      </div>
    </div>
  )
}

export default WeatherTable

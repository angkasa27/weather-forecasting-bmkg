// Administrative regions for BMKG weather data
export interface AdministrativeRegion {
  code: string
  name: string
  province: string
}

export const administrativeRegions: AdministrativeRegion[] = [
  // Jakarta
  { code: "31.71.01.1001", name: "Menteng", province: "DKI Jakarta" },
  { code: "31.71.02.1001", name: "Gambir", province: "DKI Jakarta" },
  { code: "31.72.01.1001", name: "Sawah Besar", province: "DKI Jakarta" },
  { code: "31.74.01.1001", name: "Tambora", province: "DKI Jakarta" },
  
  // Jawa Barat
  { code: "32.01.01.2001", name: "Bogor Selatan", province: "Jawa Barat" },
  { code: "32.01.02.2001", name: "Bogor Utara", province: "Jawa Barat" },
  { code: "32.73.01.1001", name: "Bandung Kulon", province: "Jawa Barat" },
  { code: "32.73.02.1001", name: "Babakan Ciparay", province: "Jawa Barat" },
  
  // Jawa Tengah
  { code: "33.01.01.2001", name: "Cilacap Selatan", province: "Jawa Tengah" },
  { code: "33.71.01.1001", name: "Semarang Tengah", province: "Jawa Tengah" },
  { code: "33.72.01.1001", name: "Surakarta", province: "Jawa Tengah" },
  
  // Jawa Timur
  { code: "35.78.01.1001", name: "Surabaya Pusat", province: "Jawa Timur" },
  { code: "35.78.02.1001", name: "Surabaya Utara", province: "Jawa Timur" },
  { code: "35.79.01.1001", name: "Malang Kota", province: "Jawa Timur" },
  
  // Bali
  { code: "51.71.01.1001", name: "Denpasar Selatan", province: "Bali" },
  { code: "51.71.02.1001", name: "Denpasar Utara", province: "Bali" },
  
  // Sumatera Utara
  { code: "12.71.01.1001", name: "Medan Kota", province: "Sumatera Utara" },
  { code: "12.71.02.1001", name: "Medan Helvetia", province: "Sumatera Utara" },
  
  // Sumatera Barat
  { code: "13.71.01.1001", name: "Padang Barat", province: "Sumatera Barat" },
  { code: "13.71.02.1001", name: "Padang Timur", province: "Sumatera Barat" },
  
  // Riau
  { code: "14.71.01.1001", name: "Pekanbaru Kota", province: "Riau" },
  
  // Sumatera Selatan
  { code: "16.71.01.1001", name: "Palembang Ilir Barat I", province: "Sumatera Selatan" },
  
  // Lampung
  { code: "18.71.01.1001", name: "Bandar Lampung", province: "Lampung" },
  
  // Kalimantan Barat
  { code: "61.71.01.1001", name: "Pontianak Kota", province: "Kalimantan Barat" },
  
  // Kalimantan Selatan
  { code: "63.71.01.1001", name: "Banjarmasin Tengah", province: "Kalimantan Selatan" },
  
  // Kalimantan Timur
  { code: "64.71.01.1001", name: "Samarinda Kota", province: "Kalimantan Timur" },
  
  // Sulawesi Utara
  { code: "71.71.01.1001", name: "Manado", province: "Sulawesi Utara" },
  
  // Sulawesi Selatan
  { code: "73.71.01.1001", name: "Makassar", province: "Sulawesi Selatan" },
  
  // Papua
  { code: "91.71.01.1001", name: "Jayapura", province: "Papua" },
  
  // Default - the one from Python script
  { code: "36.71.01.1003", name: "Yogyakarta (Default)", province: "DI Yogyakarta" },
]

export const defaultRegionCode = '36.71.01.1003'

export const getRegionByCode = (code: string): AdministrativeRegion | undefined => {
  return administrativeRegions.find(region => region.code === code)
}

export const getRegionsByProvince = () => {
  const grouped = administrativeRegions.reduce((acc, region) => {
    if (!acc[region.province]) {
      acc[region.province] = []
    }
    acc[region.province].push(region)
    return acc
  }, {} as Record<string, AdministrativeRegion[]>)
  
  return grouped
}

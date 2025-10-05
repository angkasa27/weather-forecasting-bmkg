import axios from 'axios'

export interface WeatherItem {
  local_datetime: string
  weather_desc: string
  t: number // temperature
  hu: number // humidity  
  ws: number // wind speed in km/h
  wd_deg: number // wind direction in degrees
  image: string // weather icon URL
}

export interface WeatherResponse {
  data: Array<{
    cuaca: WeatherItem[][]
  }>
}

export interface ProcessedWeatherData {
  tanggal: string
  jam: string
  cuaca: string
  suhu: string
  kelembapan: string
  kecepatanAnginKmh: string
  kecepatanAnginKnots: string
  arahAngin: string
  fileIkon: string
  iconUrl: string
}

// Convert km/h to knots
export const kmhToKnots = (kmh: number): string => {
  try {
    return (kmh * 0.539957).toFixed(1)
  } catch {
    return ''
  }
}

// Extract filename from URL
export const getIconFilename = (url: string): string => {
  if (!url) return ''
  return url.split('/').pop() || ''
}

// Process weather data similar to Python script
export const processWeatherData = (data: WeatherResponse): ProcessedWeatherData[] => {
  const processed: ProcessedWeatherData[] = []
  
  if (data.data && data.data[0] && data.data[0].cuaca) {
    for (const group of data.data[0].cuaca) {
      for (const item of group) {
        const dt = item.local_datetime || ''
        const tanggal = dt.slice(0, 10)
        const jam = dt.slice(11, 16)
        
        processed.push({
          tanggal,
          jam,
          cuaca: item.weather_desc || '',
          suhu: item.t?.toString() || '',
          kelembapan: item.hu?.toString() || '',
          kecepatanAnginKmh: item.ws?.toString() || '',
          kecepatanAnginKnots: kmhToKnots(item.ws || 0),
          arahAngin: item.wd_deg?.toString() || '',
          fileIkon: getIconFilename(item.image || ''),
          iconUrl: item.image || ''
        })
      }
    }
  }
  
  return processed
}

// Fetch weather data from BMKG API
export const fetchWeatherData = async (regionCode: string): Promise<ProcessedWeatherData[]> => {
  try {
    const response = await axios.get<WeatherResponse>(
      `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${regionCode}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    )
    
    return processWeatherData(response.data)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw new Error('Failed to fetch weather data')
  }
}

// Convert data to CSV format
export const convertToCSV = (data: ProcessedWeatherData[]): string => {
  const headers = [
    'Tanggal',
    'Jam', 
    'Cuaca',
    'Suhu (°C)',
    'Kelembapan (%)',
    'Kecepatan Angin (km/j)',
    'Kecepatan Angin (knots)',
    'Arah Angin (°)',
    'File Ikon'
  ]
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.tanggal,
      row.jam,
      `"${row.cuaca}"`,
      row.suhu,
      row.kelembapan,
      row.kecepatanAnginKmh,
      row.kecepatanAnginKnots,
      row.arahAngin,
      row.fileIkon
    ].join(','))
  ].join('\n')
  
  return csvContent
}

// Download CSV file
export const downloadCSV = (data: ProcessedWeatherData[], filename?: string) => {
  const csvContent = convertToCSV(data)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename || `Prakiraan Cuaca STMKG ${new Date().toLocaleDateString('id-ID')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

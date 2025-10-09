'use client'

import { useMemo, useState, useEffect } from 'react'
import { 
  BarChart3, 
  Thermometer, 
  Droplets, 
  Wind, 
  Compass, 
  Eye, 
  Gauge,
  TrendingUp,
  Activity,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProcessedWeatherData, WeatherItem } from '@/lib/weather-api'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface WeatherDetailsProps {
  data?: ProcessedWeatherData[]
  isLoading?: boolean
  className?: string
}

interface WeatherMetrics {
  avgTemp: number
  minTemp: number
  maxTemp: number
  avgHumidity: number
  minHumidity: number
  maxHumidity: number
  avgWindSpeed: number
  maxWindSpeed: number
  windDirectionFreq: Record<string, number>
  tempTrend: 'rising' | 'falling' | 'stable'
  comfortLevel: 'comfortable' | 'humid' | 'dry' | 'hot' | 'cold'
}

// Wind direction helper
const getWindDirection = (degrees: number): string => {
  const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

// Comfort level calculation
const getComfortLevel = (temp: number, humidity: number): WeatherMetrics['comfortLevel'] => {
  if (temp > 35) return 'hot'
  if (temp < 15) return 'cold'
  if (humidity > 80) return 'humid'
  if (humidity < 30) return 'dry'
  return 'comfortable'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

// CSV Export functionality
const exportToCSV = (data: ProcessedWeatherData[], locationName: string) => {
  if (!data.length) return
  
  const headers = [
    'Tanggal',
    'Waktu',
    'Cuaca',
    'Suhu (°C)',
    'Kelembapan (%)',
    'Kecepatan Angin (km/h)',
    'Kecepatan Angin (knots)',
    'Arah Angin',
    'Icon File'
  ]
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.tanggal,
      item.jam,
      `"${item.cuaca}"`,
      item.suhu,
      item.kelembapan,
      item.kecepatanAnginKmh,
      item.kecepatanAnginKnots,
      `"${item.arahAngin}"`,
      item.fileIkon
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `weather_${locationName}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function WeatherDetails({ data, isLoading, className }: WeatherDetailsProps) {
  const [selectedChart, setSelectedChart] = useState<'temperature' | 'humidity' | 'wind'>('temperature')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { metrics, chartData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { 
        metrics: null, 
        chartData: [] 
      }
    }

    // Calculate metrics
    const temperatures = data.map(item => parseFloat(item.suhu)).filter(temp => !isNaN(temp))
    const humidities = data.map(item => parseFloat(item.kelembapan)).filter(hum => !isNaN(hum))
    const windSpeeds = data.map(item => parseFloat(item.kecepatanAnginKmh)).filter(wind => !isNaN(wind))
    const windDirections = data.map(item => parseFloat(item.arahAngin)).filter(dir => !isNaN(dir))

    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length
    const minTemp = Math.min(...temperatures)
    const maxTemp = Math.max(...temperatures)
    
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length
    const minHumidity = Math.min(...humidities)
    const maxHumidity = Math.max(...humidities)
    
    const avgWindSpeed = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
    const maxWindSpeed = Math.max(...windSpeeds)

    // Wind direction frequency
    const windDirectionFreq = windDirections.reduce((acc, dir) => {
      const direction = getWindDirection(dir)
      acc[direction] = (acc[direction] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Temperature trend (simple calculation based on first vs last)
    const firstTemp = temperatures[0] || 0
    const lastTemp = temperatures[temperatures.length - 1] || 0
    const tempDiff = lastTemp - firstTemp
    const tempTrend: WeatherMetrics['tempTrend'] = 
      Math.abs(tempDiff) < 1 ? 'stable' : 
      tempDiff > 0 ? 'rising' : 'falling'

    // Comfort level based on average conditions
    const comfortLevel = getComfortLevel(avgTemp, avgHumidity)

    const metrics: WeatherMetrics = {
      avgTemp,
      minTemp,
      maxTemp,
      avgHumidity,
      minHumidity,
      maxHumidity,
      avgWindSpeed,
      maxWindSpeed,
      windDirectionFreq,
      tempTrend,
      comfortLevel
    }

    // Prepare chart data
    const chartData = data.slice(0, 24).map((item, index) => ({
      time: item.jam,
      temperature: parseFloat(item.suhu) || 0,
      humidity: parseFloat(item.kelembapan) || 0,
      windSpeed: parseFloat(item.kecepatanAnginKmh) || 0,
      windDirection: getWindDirection(parseFloat(item.arahAngin) || 0),
      condition: item.cuaca
    }))

    return { metrics, chartData }
  }, [data])

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detail Cuaca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detail Cuaca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          {/* Chart Skeleton */}
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!metrics || !data || data.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detail Cuaca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data detail cuaca tersedia
          </div>
        </CardContent>
      </Card>
    )
  }

  // Wind direction chart data
  const windDirectionData = Object.entries(metrics.windDirectionFreq).map(([direction, count]) => ({
    direction,
    count,
    percentage: (count / data.length * 100).toFixed(1)
  }))

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detail Cuaca
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(data, 'location')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Temperature Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              <span>Suhu Rata-rata</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.avgTemp.toFixed(1)}°C
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.minTemp.toFixed(0)}° - {metrics.maxTemp.toFixed(0)}°
            </div>
            <Badge variant={metrics.tempTrend === 'rising' ? 'default' : metrics.tempTrend === 'falling' ? 'secondary' : 'outline'} className="text-xs">
              <TrendingUp className={cn("h-3 w-3 mr-1", 
                metrics.tempTrend === 'falling' && "rotate-180"
              )} />
              {metrics.tempTrend === 'rising' ? 'Naik' : 
               metrics.tempTrend === 'falling' ? 'Turun' : 'Stabil'}
            </Badge>
          </div>

          {/* Humidity Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span>Kelembapan</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.avgHumidity.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.minHumidity.toFixed(0)}% - {metrics.maxHumidity.toFixed(0)}%
            </div>
          </div>

          {/* Wind Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wind className="h-4 w-4" />
              <span>Kecepatan Angin</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.avgWindSpeed.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              Maks: {metrics.maxWindSpeed.toFixed(1)} km/h
            </div>
          </div>

          {/* Comfort Level */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" />
              <span>Tingkat Kenyamanan</span>
            </div>
            <div className="text-lg font-semibold">
              <Badge 
                variant={
                  metrics.comfortLevel === 'comfortable' ? 'default' :
                  metrics.comfortLevel === 'humid' ? 'secondary' :
                  metrics.comfortLevel === 'dry' ? 'outline' :
                  'destructive'
                }
              >
                {metrics.comfortLevel === 'comfortable' ? 'Nyaman' :
                 metrics.comfortLevel === 'humid' ? 'Lembap' :
                 metrics.comfortLevel === 'dry' ? 'Kering' :
                 metrics.comfortLevel === 'hot' ? 'Panas' :
                 'Dingin'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Chart Selection */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'temperature', label: 'Suhu', icon: Thermometer },
            { key: 'humidity', label: 'Kelembapan', icon: Droplets },
            { key: 'wind', label: 'Angin', icon: Wind },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedChart(key as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedChart === key 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Main Chart */}
        <div className="h-64">
          {selectedChart === 'temperature' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-md p-3">
                          <p className="font-medium">{`Jam ${label}`}</p>
                          <p className="text-sm text-blue-600">
                            {`Suhu: ${payload[0].value}°C`}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#2563eb" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {selectedChart === 'humidity' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-md p-3">
                          <p className="font-medium">{`Jam ${label}`}</p>
                          <p className="text-sm text-green-600">
                            {`Kelembapan: ${payload[0].value}%`}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {selectedChart === 'wind' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-md p-3">
                          <p className="font-medium">{`Jam ${label}`}</p>
                          <p className="text-sm text-orange-600">
                            {`Kecepatan: ${payload[0].value} km/h`}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="windSpeed" 
                  fill="#ea580c"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Wind Direction Distribution */}
        {windDirectionData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Distribusi Arah Angin
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={windDirectionData}
                      dataKey="count"
                      nameKey="direction"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      label={({ direction, percentage }) => `${direction} (${percentage}%)`}
                      fontSize={12}
                    >
                      {windDirectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">
                Statistik Arah Angin
              </h3>
              <div className="space-y-2">
                {windDirectionData
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 4)
                  .map((item, index) => (
                    <div key={item.direction} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.direction}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{item.count}x</span>
                        <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
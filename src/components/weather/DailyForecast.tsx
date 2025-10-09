'use client'

import { useMemo, useState, useEffect } from 'react'
import { Calendar, Thermometer, Droplets, Wind, Sunrise, Sunset, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProcessedWeatherData } from '@/lib/weather-api'
import { format, parseISO, startOfDay, isSameDay, isToday, isTomorrow, addDays } from 'date-fns'
import { id } from 'date-fns/locale'

interface DailyForecastProps {
  data?: ProcessedWeatherData[]
  isLoading?: boolean
  className?: string
}

interface DailyData {
  date: Date
  dayLabel: string
  minTemp: number
  maxTemp: number
  avgHumidity: number
  avgWindSpeed: number
  dominantWeather: string
  weatherIcon: string
  weatherConditions: string[]
  hourlyData: ProcessedWeatherData[]
}

export function DailyForecast({ data, isLoading, className }: DailyForecastProps) {
  const [isClient, setIsClient] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const dailyData = useMemo((): DailyData[] => {
    if (!data || data.length === 0) return []

    // Group data by date
    const groupedByDate = data.reduce((acc, item) => {
      const date = startOfDay(new Date(`${item.tanggal} ${item.jam}:00`))
      const dateKey = date.toISOString()
      
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(item)
      
      return acc
    }, {} as Record<string, ProcessedWeatherData[]>)

    // Process each day
    const processedDays = Object.entries(groupedByDate).map(([dateKey, hourlyData]) => {
      const date = new Date(dateKey)
      
      // Calculate daily stats
      const temperatures = hourlyData.map(item => parseFloat(item.suhu)).filter(temp => !isNaN(temp))
      const humidities = hourlyData.map(item => parseFloat(item.kelembapan)).filter(hum => !isNaN(hum))
      const windSpeeds = hourlyData.map(item => parseFloat(item.kecepatanAnginKmh)).filter(wind => !isNaN(wind))
      
      const minTemp = Math.min(...temperatures)
      const maxTemp = Math.max(...temperatures)
      const avgHumidity = humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0
      const avgWindSpeed = windSpeeds.length > 0 ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length : 0

      // Find dominant weather condition (most frequent)
      const weatherCounts = hourlyData.reduce((acc, item) => {
        acc[item.cuaca] = (acc[item.cuaca] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const dominantWeather = Object.entries(weatherCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Tidak diketahui'

      // Get the weather icon for the dominant condition
      const dominantWeatherItem = hourlyData.find(item => item.cuaca === dominantWeather)
      const weatherIcon = dominantWeatherItem?.iconUrl || ''

      // Get unique weather conditions for the day
      const weatherConditions = [...new Set(hourlyData.map(item => item.cuaca))]

      // Generate day label
      let dayLabel: string
      if (isClient) {
        if (isToday(date)) {
          dayLabel = 'Hari Ini'
        } else if (isTomorrow(date)) {
          dayLabel = 'Besok'
        } else {
          dayLabel = format(date, 'EEEE, dd MMM', { locale: id })
        }
      } else {
        dayLabel = format(date, 'dd MMM yyyy')
      }

      return {
        date,
        dayLabel,
        minTemp,
        maxTemp,
        avgHumidity,
        avgWindSpeed,
        dominantWeather,
        weatherIcon,
        weatherConditions,
        hourlyData: hourlyData.sort((a, b) => 
          new Date(`${a.tanggal} ${a.jam}:00`).getTime() - new Date(`${b.tanggal} ${b.jam}:00`).getTime()
        )
      }
    })

    return processedDays
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 7) // Limit to 7 days
  }, [data, isClient])

  const toggleExpanded = (dateKey: string) => {
    setExpandedDay(expandedDay === dateKey ? null : dateKey)
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prakiraan Harian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!dailyData || dailyData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prakiraan Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data prakiraan harian tersedia
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Prakiraan Harian
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {dailyData.map((day) => {
          const dateKey = day.date.toISOString()
          const isExpanded = expandedDay === dateKey
          const isToday = isClient && day.dayLabel === 'Hari Ini'

          return (
            <div
              key={dateKey}
              className={cn(
                "border rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer",
                isToday && "bg-green-50 border-green-200 shadow-md ring-2 ring-green-100 dark:bg-green-950/20 dark:border-green-800 dark:ring-green-900/30",
                isExpanded && "shadow-lg"
              )}
              onClick={() => toggleExpanded(dateKey)}
            >
              {/* Daily Summary */}
              <div className="flex items-center gap-4 p-4">
                {/* Date */}
                <div className="w-20 text-sm font-medium">
                  <div className={cn(isToday && "text-green-600 font-bold dark:text-green-400")}>
                    {day.dayLabel}
                  </div>
                </div>

                {/* Weather Icon */}
                <div className="flex-shrink-0">
                  {day.weatherIcon ? (
                    <img 
                      src={day.weatherIcon}
                      alt={day.dominantWeather}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Thermometer className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Weather Description */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {day.dominantWeather}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {day.weatherConditions.length > 1 
                      ? `${day.weatherConditions.length} kondisi berbeda`
                      : 'Kondisi stabil'
                    }
                  </div>
                </div>

                {/* Temperature & Stats */}
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <span className="text-red-500">{day.maxTemp.toFixed(0)}°</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-blue-500">{day.minTemp.toFixed(0)}°</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      {day.avgHumidity.toFixed(0)}%
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      {day.avgWindSpeed.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Hourly Details */}
              {isExpanded && (
                <div className="border-t bg-muted/30 p-4 space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Prakiraan Per Jam - {day.dayLabel}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {day.hourlyData.map((hour) => {
                      const temperature = parseFloat(hour.suhu)
                      const humidity = parseFloat(hour.kelembapan)
                      
                      return (
                        <div 
                          key={`${hour.tanggal}-${hour.jam}`}
                          className="bg-background rounded-lg p-3 text-center space-y-2 border"
                        >
                          <div className="text-xs font-medium">
                            {hour.jam}
                          </div>
                          
                          {hour.iconUrl && (
                            <img 
                              src={hour.iconUrl}
                              alt={hour.cuaca}
                              className="w-8 h-8 mx-auto object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          
                          <div className={cn(
                            "text-sm font-semibold",
                            temperature >= 30 ? "text-red-500" :
                            temperature >= 25 ? "text-orange-500" :
                            temperature >= 20 ? "text-green-500" :
                            "text-blue-500"
                          )}>
                            {temperature.toFixed(0)}°
                          </div>
                          
                          <div className="text-xs text-muted-foreground truncate">
                            {hour.cuaca}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {humidity.toFixed(0)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Daily Weather Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
                    <div className="text-center space-y-1">
                      <div className="text-xs text-muted-foreground">Suhu</div>
                      <div className="text-sm font-medium">
                        {day.minTemp.toFixed(0)}° - {day.maxTemp.toFixed(0)}°C
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-xs text-muted-foreground">Kelembapan Rata-rata</div>
                      <div className="text-sm font-medium">
                        {day.avgHumidity.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-xs text-muted-foreground">Angin Rata-rata</div>
                      <div className="text-sm font-medium">
                        {day.avgWindSpeed.toFixed(1)} km/h
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Footer Info */}
        <div className="text-center pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Klik pada hari untuk melihat prakiraan per jam
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
'use client'

import { useMemo, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Thermometer, Droplets, Wind } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProcessedWeatherData } from '@/lib/weather-api'
import { format, parseISO, addHours, isSameDay, isToday, isTomorrow } from 'date-fns'
import { id } from 'date-fns/locale'

interface HourlyForecastProps {
  data?: ProcessedWeatherData[]
  isLoading?: boolean
  className?: string
}

interface HourlyData extends ProcessedWeatherData {
  dateTime: Date
  isCurrentHour: boolean
  dayLabel?: string
}

export function HourlyForecast({ data, isLoading, className }: HourlyForecastProps) {
  const [isClient, setIsClient] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const hourlyData = useMemo((): HourlyData[] => {
    if (!data || data.length === 0) return []

    const now = isClient ? new Date() : new Date('2025-10-10T05:00:00')
    const currentHour = now.getHours()

    return data
      .map((item) => {
        const dateTime = new Date(`${item.tanggal} ${item.jam}:00`)
        const isCurrentHour = isClient ? 
          (Math.abs(dateTime.getTime() - now.getTime()) <= 30 * 60 * 1000) : // Within 30 minutes
          false

        // Add day labels
        let dayLabel: string | undefined
        if (isClient) {
          if (isToday(dateTime)) {
            dayLabel = dateTime.getHours() === 0 ? 'Hari Ini' : undefined
          } else if (isTomorrow(dateTime)) {
            dayLabel = dateTime.getHours() === 0 ? 'Besok' : undefined
          } else {
            dayLabel = dateTime.getHours() === 0 ? format(dateTime, 'EEEE', { locale: id }) : undefined
          }
        }

        return {
          ...item,
          dateTime,
          isCurrentHour,
          dayLabel
        }
      })
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
      .slice(0, 48) // Limit to next 48 hours
  }, [data, isClient])

  const scrollLeft = () => {
    const container = document.getElementById('hourly-scroll-container')
    if (container) {
      const newPosition = Math.max(0, scrollPosition - 300)
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  const scrollRight = () => {
    const container = document.getElementById('hourly-scroll-container')
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth
      const newPosition = Math.min(maxScroll, scrollPosition + 300)
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft)
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full overflow-hidden", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prakiraan Per Jam
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-32 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-12 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <Card className={cn("w-full overflow-hidden", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prakiraan Per Jam
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data prakiraan per jam tersedia
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prakiraan Per Jam
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              disabled={scrollPosition <= 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-hidden">
        <div 
          id="hourly-scroll-container"
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6 py-1"
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {hourlyData.map((hour, index) => {
            const temperature = parseFloat(hour.suhu)
            const humidity = parseFloat(hour.kelembapan)
            const windSpeed = parseFloat(hour.kecepatanAnginKmh)
            
            return (
              <div key={`${hour.tanggal}-${hour.jam}`} className="flex-shrink-0 w-32">
                {/* Day Label */}
                {hour.dayLabel && (
                  <div className="text-xs font-medium text-center text-muted-foreground mb-3 -mt-2">
                    {hour.dayLabel}
                  </div>
                )}

                <div 
                  className={cn(
                    "bg-card border rounded-lg p-3 text-center space-y-3 transition-all duration-200 hover:shadow-md",
                    hour.isCurrentHour && "bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-100 dark:bg-blue-950/20 dark:border-blue-800 dark:ring-blue-900/30"
                  )}
                >
                  {/* Time */}
                  <div className={cn(
                    "text-sm font-medium",
                    hour.isCurrentHour ? "text-blue-600 font-bold dark:text-blue-400" : "text-foreground"
                  )}>
                    {hour.isCurrentHour ? 'Sekarang' : 
                     isClient ? format(hour.dateTime, 'HH:mm') : hour.jam
                    }
                  </div>

                  {/* Weather Icon */}
                  <div className="flex justify-center">
                    {hour.iconUrl ? (
                      <img 
                        src={hour.iconUrl}
                        alt={hour.cuaca}
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

                  {/* Temperature */}
                  <div className="space-y-1">
                    <div className={cn(
                      "text-lg font-bold",
                      temperature >= 30 ? "text-red-500" :
                      temperature >= 25 ? "text-orange-500" :
                      temperature >= 20 ? "text-green-500" :
                      "text-blue-500"
                    )}>
                      {temperature.toFixed(0)}°
                    </div>
                  </div>

                  {/* Weather Description */}
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                    {hour.cuaca}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-3 w-3" />
                      <span>{humidity.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="h-3 w-3" />
                      <span>{windSpeed.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-4">
          <div className="text-xs text-muted-foreground">
            Geser untuk melihat prakiraan 48 jam ke depan
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
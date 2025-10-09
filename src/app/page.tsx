'use client'

import { useState, useCallback } from 'react'
import { LocationSelector } from '@/components/weather/LocationSelector'
import { CurrentWeather } from '@/components/weather/CurrentWeather'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { WeatherError, NetworkStatus } from '@/components/layout/WeatherError'
import { useWeatherData } from '@/hooks/use-weather-data'
import { defaultRegionCode } from '@/lib/regions'
import { downloadCSV } from '@/lib/weather-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const [selectedLocationCode, setSelectedLocationCode] = useState(defaultRegionCode)
  
  const { 
    data: weatherData, 
    isLoading, 
    error, 
    refetch 
  } = useWeatherData(selectedLocationCode)

  const handleLocationChange = useCallback((locationCode: string) => {
    setSelectedLocationCode(locationCode)
  }, [])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleExport = useCallback(() => {
    if (weatherData && weatherData.length > 0) {
      downloadCSV(weatherData)
    }
  }, [weatherData])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header 
          selectedLocationCode={selectedLocationCode}
          onRefresh={handleRefresh}
          onExport={weatherData?.length ? handleExport : undefined}
          isLoading={isLoading}
        />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          <NetworkStatus />
          
          {/* Location Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pilih Lokasi</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationSelector
                selectedLocationCode={selectedLocationCode}
                onLocationChange={handleLocationChange}
              />
            </CardContent>
          </Card>

          {/* Weather Display */}
          {error ? (
            <WeatherError 
              error={error}
              onRetry={handleRefresh}
              isOffline={!navigator.onLine}
            />
          ) : (
            <CurrentWeather 
              data={weatherData}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          )}

          {/* Placeholder for future components */}
          {weatherData && weatherData.length > 0 && (
            <div className="grid gap-6">
              {/* Hourly Forecast - Coming Soon */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prakiraan Per Jam</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Fitur prakiraan per jam akan segera hadir
                  </div>
                </CardContent>
              </Card>

              {/* Daily Forecast - Coming Soon */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prakiraan Harian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Fitur prakiraan harian akan segera hadir
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}

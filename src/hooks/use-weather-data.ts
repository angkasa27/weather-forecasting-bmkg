'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchWeatherData, type ProcessedWeatherData } from '@/lib/weather-api'

export const useWeatherData = (regionCode: string) => {
  return useQuery<ProcessedWeatherData[], Error>({
    queryKey: ['weather-data', regionCode],
    queryFn: () => fetchWeatherData(regionCode),
    enabled: Boolean(regionCode),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

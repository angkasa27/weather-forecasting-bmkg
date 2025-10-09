"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProcessedWeatherData } from "@/lib/weather-api";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface CurrentWeatherProps {
  data?: ProcessedWeatherData[];
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

// Wind direction helper
const getWindDirection = (degrees: number): string => {
  const directions = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

// Temperature color helper
const getTemperatureColor = (temp: number): string => {
  if (temp >= 35) return "text-red-600";
  if (temp >= 30) return "text-orange-500";
  if (temp >= 25) return "text-yellow-500";
  if (temp >= 20) return "text-green-500";
  return "text-blue-500";
};

// Weather condition color helper
const getWeatherBadgeVariant = (
  condition: string
): "default" | "secondary" | "destructive" | "outline" => {
  const lower = condition.toLowerCase();
  if (lower.includes("hujan") || lower.includes("badai")) return "destructive";
  if (lower.includes("berawan") || lower.includes("mendung"))
    return "secondary";
  if (lower.includes("cerah") || lower.includes("sunny")) return "default";
  return "outline";
};

export function CurrentWeather({
  data,
  isLoading,
  onRefresh,
  className,
}: CurrentWeatherProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentWeather = useMemo(() => {
    if (!data || data.length === 0) return null;

    // If not on client, just return the first item to avoid hydration mismatch
    if (!isClient) {
      return data[0];
    }

    // Get the most recent weather data (only on client side)
    const now = new Date();
    const currentHour = now.getHours();

    // Find the closest time slot to current time
    const closest = data.reduce((prev, curr) => {
      const prevHour = parseInt(prev.jam.split(":")[0]);
      const currHour = parseInt(curr.jam.split(":")[0]);
      const prevDiff = Math.abs(prevHour - currentHour);
      const currDiff = Math.abs(currHour - currentHour);
      return currDiff < prevDiff ? curr : prev;
    });

    return closest;
  }, [data, isClient]);

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-16 w-20 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentWeather) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="text-muted-foreground">
              Tidak ada data cuaca tersedia
            </div>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Muat Ulang
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const temperature = parseFloat(currentWeather.suhu);
  const humidity = parseFloat(currentWeather.kelembapan);
  const windSpeedKmh = parseFloat(currentWeather.kecepatanAnginKmh);
  const windSpeedKnots = parseFloat(currentWeather.kecepatanAnginKnots);
  const windDirection = parseFloat(currentWeather.arahAngin);

  return (
    <Card
      className={cn(
        "w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Cuaca Saat Ini
            </h2>
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Clock className="h-4 w-4" />
              <span>
                {isClient
                  ? format(
                      new Date(
                        `${currentWeather.tanggal} ${currentWeather.jam}`
                      ),
                      "EEEE, dd MMMM yyyy • HH:mm",
                      { locale: id }
                    )
                  : `${currentWeather.tanggal} • ${currentWeather.jam}`}
              </span>
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Main Weather Display */}
        <div className="text-center space-y-3 lg:hidden">
          <div className="flex items-center justify-center gap-4">
            {currentWeather.iconUrl && (
              <img
                src={currentWeather.iconUrl}
                alt={currentWeather.cuaca}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="space-y-1">
              <div
                className={cn(
                  "text-4xl font-bold",
                  getTemperatureColor(temperature)
                )}
              >
                {temperature.toFixed(1)}°C
              </div>
              <Badge
                variant={getWeatherBadgeVariant(currentWeather.cuaca)}
                className="text-xs"
              >
                {currentWeather.cuaca}
              </Badge>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6 lg:items-center">
          {/* Main Weather Display - Desktop */}
          <div className="col-span-2 text-center space-y-3">
            <div className="flex items-center justify-center gap-6">
              {currentWeather.iconUrl && (
                <img
                  src={currentWeather.iconUrl}
                  alt={currentWeather.cuaca}
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="space-y-2">
                <div
                  className={cn(
                    "text-5xl font-bold",
                    getTemperatureColor(temperature)
                  )}
                >
                  {temperature.toFixed(1)}°C
                </div>
                <Badge
                  variant={getWeatherBadgeVariant(currentWeather.cuaca)}
                  className="text-sm"
                >
                  {currentWeather.cuaca}
                </Badge>
              </div>
            </div>
          </div>

          {/* Weather Details - Desktop */}
          <div className="col-span-3 grid grid-cols-2 gap-4">
            {/* Humidity */}
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Kelembapan
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {humidity.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Kec. Angin
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {windSpeedKmh.toFixed(1)}{" "}
                  <span className="text-lg">km/h</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {windSpeedKnots.toFixed(1)} knots
                </div>
              </div>
            </div>

            {/* Wind Direction */}
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Arah Angin
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {getWindDirection(windDirection)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {windDirection.toFixed(0)}°
                </div>
              </div>
            </div>

            {/* Feels Like Temperature */}
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Thermometer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Terasa Seperti
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {(
                    temperature + (humidity > 80 ? 2 : humidity > 60 ? 1 : 0)
                  ).toFixed(1)}
                  °C
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6 lg:hidden">
          {/* Humidity */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Droplets className="h-4 w-4" />
              <span className="text-xs font-medium">Kelembapan</span>
            </div>
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {humidity.toFixed(0)}%
            </div>
          </div>

          {/* Wind Speed */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Wind className="h-4 w-4" />
              <span className="text-xs font-medium">Kec. Angin</span>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {windSpeedKmh.toFixed(1)} km/h
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {windSpeedKnots.toFixed(1)} knots
              </div>
            </div>
          </div>

          {/* Wind Direction */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Compass className="h-4 w-4" />
              <span className="text-xs font-medium">Arah Angin</span>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {getWindDirection(windDirection)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {windDirection.toFixed(0)}°
              </div>
            </div>
          </div>

          {/* Feels Like Temperature */}
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Thermometer className="h-4 w-4" />
              <span className="text-xs font-medium">Terasa Seperti</span>
            </div>
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {(
                temperature + (humidity > 80 ? 2 : humidity > 60 ? 1 : 0)
              ).toFixed(1)}
              °C
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-6">
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Data dari BMKG • Diperbarui setiap 5 menit
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

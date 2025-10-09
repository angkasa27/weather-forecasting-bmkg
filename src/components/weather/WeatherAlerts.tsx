"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CloudRain,
  Wind,
  Zap,
  Thermometer,
  Eye,
  Info,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProcessedWeatherData } from "@/lib/weather-api";

interface WeatherAlertsProps {
  data?: ProcessedWeatherData[];
  isLoading?: boolean;
  className?: string;
}

interface WeatherAlert {
  id: string;
  type:
    | "extreme-heat"
    | "heavy-rain"
    | "strong-wind"
    | "low-visibility"
    | "high-humidity"
    | "info";
  severity: "info" | "warning" | "danger" | "critical";
  title: string;
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  timestamp: string;
  location?: string;
  duration?: string;
  advice?: string[];
}

// Alert thresholds
const ALERT_THRESHOLDS = {
  extremeHeat: 35, // °C
  heavyRain: 60, // Inferred from humidity > 85% + rain condition
  strongWind: 25, // km/h
  lowVisibility: 60, // Inferred from humidity > 90% + cloudy
  highHumidity: 85, // %
};

const getWeatherAlerts = (data: ProcessedWeatherData[]): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  const now = new Date();

  // Analyze current and next 6 hours
  const analysisData = data.slice(0, 6);

  analysisData.forEach((item, index) => {
    const temp = parseFloat(item.suhu) || 0;
    const humidity = parseFloat(item.kelembapan) || 0;
    const windSpeed = parseFloat(item.kecepatanAnginKmh) || 0;
    const condition = item.cuaca.toLowerCase();

    // Extreme Heat Alert
    if (temp >= ALERT_THRESHOLDS.extremeHeat) {
      alerts.push({
        id: `heat-${index}`,
        type: "extreme-heat",
        severity: temp >= 38 ? "critical" : temp >= 36 ? "danger" : "warning",
        title:
          temp >= 38 ? "Peringatan Cuaca Ekstrem" : "Peringatan Panas Tinggi",
        message: `Suhu sangat tinggi ${temp}°C pada jam ${item.jam}. Waspadai risiko heat stroke dan dehidrasi.`,
        icon: Thermometer,
        color: temp >= 38 ? "text-red-800!" : "text-red-600!",
        bgColor: temp >= 38 ? "bg-red-100" : "bg-orange-100",
        borderColor: temp >= 38 ? "border-red-200" : "border-orange-200",
        timestamp: item.jam,
        duration: "2-4 jam",
        advice: [
          "Hindari aktivitas di luar ruangan",
          "Minum air putih yang cukup",
          "Gunakan pakaian yang tipis dan berwarna terang",
          "Cari tempat yang teduh dan sejuk",
        ],
      });
    }

    // Heavy Rain Alert
    if (
      humidity >= ALERT_THRESHOLDS.heavyRain &&
      (condition.includes("hujan") || condition.includes("badai"))
    ) {
      alerts.push({
        id: `rain-${index}`,
        type: "heavy-rain",
        severity:
          condition.includes("lebat") || condition.includes("badai")
            ? "danger"
            : "warning",
        title: condition.includes("badai")
          ? "Peringatan Badai"
          : "Peringatan Hujan Lebat",
        message: `Potensi hujan lebat dengan kelembapan ${humidity}% pada jam ${item.jam}.`,
        icon: CloudRain,
        color: condition.includes("badai") ? "text-red-600!" : "text-blue-600!",
        bgColor: condition.includes("badai") ? "bg-red-100" : "bg-blue-100",
        borderColor: condition.includes("badai")
          ? "border-red-200"
          : "border-blue-200",
        timestamp: item.jam,
        duration: "1-3 jam",
        advice: [
          "Hindari perjalanan jika tidak mendesak",
          "Waspada genangan air di jalan",
          "Siapkan perlengkapan hujan",
          "Pantau kondisi cuaca terkini",
        ],
      });
    }

    // Strong Wind Alert
    if (windSpeed >= ALERT_THRESHOLDS.strongWind) {
      alerts.push({
        id: `wind-${index}`,
        type: "strong-wind",
        severity:
          windSpeed >= 40 ? "danger" : windSpeed >= 30 ? "warning" : "info",
        title:
          windSpeed >= 40
            ? "Peringatan Angin Kencang"
            : "Peringatan Angin Sedang",
        message: `Kecepatan angin ${windSpeed} km/h pada jam ${item.jam}. Waspada pohon tumbang.`,
        icon: Wind,
        color: windSpeed >= 40 ? "text-red-600!" : "text-orange-600!",
        bgColor: windSpeed >= 40 ? "bg-red-100" : "bg-orange-100",
        borderColor: windSpeed >= 40 ? "border-red-200" : "border-orange-200",
        timestamp: item.jam,
        duration: "30 menit - 2 jam",
        advice: [
          "Hindari area dengan banyak pohon",
          "Kencangkan benda-benda yang mudah terbang",
          "Waspada saat berkendara",
          "Jauhi papan reklame atau struktur tinggi",
        ],
      });
    }

    // Low Visibility Alert
    if (
      humidity >= ALERT_THRESHOLDS.lowVisibility &&
      (condition.includes("kabut") || condition.includes("mendung"))
    ) {
      alerts.push({
        id: `visibility-${index}`,
        type: "low-visibility",
        severity: "warning",
        title: "Peringatan Jarak Pandang Terbatas",
        message: `Jarak pandang terbatas karena kabut/mendung tebal pada jam ${item.jam}.`,
        icon: Eye,
        color: "text-gray-600!",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
        timestamp: item.jam,
        duration: "1-4 jam",
        advice: [
          "Nyalakan lampu kendaraan saat berkendara",
          "Kurangi kecepatan berkendara",
          "Jaga jarak aman dengan kendaraan lain",
          "Gunakan klakson dengan bijak",
        ],
      });
    }
  });

  // Remove duplicate alerts and sort by severity
  const uniqueAlerts = alerts.filter(
    (alert, index, self) =>
      index === self.findIndex((a) => a.type === alert.type)
  );

  return uniqueAlerts.sort((a, b) => {
    const severityOrder = { critical: 4, danger: 3, warning: 2, info: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};

export function WeatherAlerts({
  data,
  isLoading,
  className,
}: WeatherAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const alerts = useMemo(() => {
    if (!data || data.length === 0) return [];
    return getWeatherAlerts(data).filter(
      (alert) => !dismissedAlerts.includes(alert.id)
    );
  }, [data, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId]);
  };

  if (!data || data.length === 0 || isLoading) {
    return null;
  }

  if (alerts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Tidak ada peringatan cuaca khusus saat ini. Kondisi cuaca dalam batas
          normal.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={cn(
            "relative",
            alert.bgColor,
            alert.borderColor,
            "border-l-4"
          )}
        >
          <alert.icon className={cn("size-5", alert.color)} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={cn("font-semibold text-sm", alert.color)}>
                  {alert.title}
                </h3>
                <Badge
                  variant={
                    alert.severity === "critical"
                      ? "destructive"
                      : alert.severity === "danger"
                      ? "destructive"
                      : alert.severity === "warning"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-xs mt-1"
                >
                  {alert.severity === "critical"
                    ? "Kritis"
                    : alert.severity === "danger"
                    ? "Bahaya"
                    : alert.severity === "warning"
                    ? "Peringatan"
                    : "Info"}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <AlertDescription className={cn("mt-2 text-sm", alert.color)}>
              {alert.message}
            </AlertDescription>

            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
              <span>Jam: {alert.timestamp}</span>
              {alert.duration && <span>Durasi: {alert.duration}</span>}
            </div>

            {alert.advice && alert.advice.length > 0 && (
              <div className="mt-3 p-3 bg-background/50 rounded border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Saran Keselamatan:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {alert.advice.map((advice, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 text-xs text-muted-foreground">
              Peringatan berdasarkan analisis data BMKG. Selalu ikuti arahan
              resmi dari
              <a
                href="https://bmkg.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                BMKG
              </a>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}

export default WeatherAlerts;

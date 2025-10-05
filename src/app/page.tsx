import WeatherTable from "@/components/weather-table";
import { Cloud, Sun, CloudRain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sun className="h-8 w-8 text-yellow-300" />
              <CloudRain className="h-6 w-6 text-blue-200" />
              <Cloud className="h-7 w-7 text-gray-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Prakiraan Cuaca Indonesia
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Data resmi dari BMKG • Stasiun Meteorologi, Klimatologi dan Geofisika
              </p>
            </div>
          </div>
          
          {/* Hero Text */}
          <div className="text-center sm:text-left">
            <p className="text-lg text-blue-100 mb-2">
              Pantau cuaca di wilayah Anda dengan data akurat dan terpercaya
            </p>
            <p className="text-sm text-blue-200">
              Pilih lokasi hingga kelurahan/desa untuk informasi cuaca yang lebih detail
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <WeatherTable />
      </div>

      {/* Footer */}
      <div className="bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Prakiraan Cuaca Indonesia</strong> - Aplikasi prakiraan cuaca berbasis data BMKG
            </p>
            <p className="text-xs">
              Data cuaca diperbarui secara berkala dari server resmi Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



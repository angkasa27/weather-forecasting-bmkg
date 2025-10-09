'use client'

import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WeatherErrorProps {
  error?: Error | null
  onRetry?: () => void
  isOffline?: boolean
  className?: string
}

export function WeatherError({ error, onRetry, isOffline = false, className }: WeatherErrorProps) {
  const getErrorMessage = () => {
    if (isOffline) {
      return {
        title: 'Tidak Ada Koneksi Internet',
        description: 'Periksa koneksi internet Anda dan coba lagi.',
        icon: WifiOff
      }
    }

    if (error?.message?.includes('404')) {
      return {
        title: 'Data Tidak Ditemukan',
        description: 'Data cuaca untuk lokasi yang dipilih tidak tersedia. Silakan pilih lokasi lain.',
        icon: AlertCircle
      }
    }

    if (error?.message?.includes('timeout') || error?.message?.includes('network')) {
      return {
        title: 'Koneksi Bermasalah',
        description: 'Gagal memuat data cuaca. Periksa koneksi internet Anda.',
        icon: WifiOff
      }
    }

    if (error?.message?.includes('429')) {
      return {
        title: 'Terlalu Banyak Permintaan',
        description: 'Server sedang sibuk. Silakan coba lagi dalam beberapa menit.',
        icon: AlertCircle
      }
    }

    return {
      title: 'Gagal Memuat Data',
      description: error?.message || 'Terjadi kesalahan saat memuat data cuaca. Silakan coba lagi.',
      icon: AlertCircle
    }
  }

  const errorInfo = getErrorMessage()
  const Icon = errorInfo.icon

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Icon className="h-5 w-5" />
          {errorInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <Icon className="h-4 w-4" />
          <AlertDescription>
            {errorInfo.description}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry} size="sm" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
          )}
          
          {isOffline && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">
                Aplikasi akan mencoba memuat ulang secara otomatis ketika koneksi pulih
              </div>
            </div>
          )}
        </div>

        {/* Network Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {navigator.onLine ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Terhubung ke internet</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-500" />
              <span>Tidak ada koneksi internet</span>
            </>
          )}
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 p-3 bg-muted rounded-lg">
            <summary className="text-sm font-medium cursor-pointer">Detail Error (Development)</summary>
            <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

interface NetworkStatusProps {
  className?: string
}

export function NetworkStatus({ className }: NetworkStatusProps) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  if (isOnline) return null

  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.
      </AlertDescription>
    </Alert>
  )
}
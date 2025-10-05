'use client'

import { useQuery } from '@tanstack/react-query'
import { buildHierarchyFromCsv, type RegionHierarchy } from '@/lib/regions'

const REGION_CSV_PATH = '/data/base.csv'

const fetchRegions = async (): Promise<RegionHierarchy> => {
  const response = await fetch(REGION_CSV_PATH)
  if (!response.ok) {
    throw new Error('Gagal memuat data wilayah administrasi')
  }

  const csvText = await response.text()
  return buildHierarchyFromCsv(csvText)
}

export const useRegionHierarchy = () => {
  return useQuery<RegionHierarchy, Error>({
    queryKey: ['administrative-regions'],
    queryFn: fetchRegions,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

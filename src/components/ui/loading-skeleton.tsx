import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  title: string;
  lines?: number;
  hasChart?: boolean;
  hasGrid?: boolean;
}

export function LoadingSkeleton({
  title,
  lines = 2,
  hasChart = false,
  hasGrid = false,
}: LoadingSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic content lines */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
            />
          ))}
        </div>

        {/* Chart placeholder */}
        {hasChart && (
          <div className="space-y-2">
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        )}

        {/* Grid placeholder */}
        {hasGrid && (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-md" />
            <Skeleton className="h-32 rounded-md" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WeatherDetailsLoadingSkeleton() {
  return (
    <LoadingSkeleton
      title="Weather Analytics"
      lines={3}
      hasChart={true}
      hasGrid={true}
    />
  );
}

export function WeatherAlertsLoadingSkeleton() {
  return <LoadingSkeleton title="Weather Alerts" lines={2} />;
}

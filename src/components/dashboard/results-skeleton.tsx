"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResultsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex h-10 w-full items-center justify-center rounded-md bg-muted p-1">
             <Skeleton className="h-8 flex-1" />
             <Skeleton className="h-8 flex-1" />
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";

import { IconDatabase, IconMemory, IconRefresh, IconTrash, IconTrendingUp } from "@/assets/icons";

import { useCacheManagement } from "@/hooks/use-cache-management";

import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface CacheStats {
  totalKeys: number;
  searchKeys: number;
  memoryUsage: string;
  hitRate?: number;
}

interface CacheMemoryBreakdown {
  searchCache: number;
  sessionCache: number;
  otherCache: number;
}

interface CachePerformance {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

export function CacheManagement() {
  const {
    isLoading,
    error,
    getCacheStats,
    getCacheMemoryBreakdown,
    getCachePerformance,
    clearSearchCache,
    clearAllCache,
    clearError,
  } = useCacheManagement();

  const [stats, setStats] = useState<CacheStats | null>(null);
  const [memoryBreakdown, setMemoryBreakdown] = useState<CacheMemoryBreakdown | null>(null);
  const [performance, setPerformance] = useState<CachePerformance | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshData = async () => {
    const [statsData, memoryData, performanceData] = await Promise.all([
      getCacheStats(),
      getCacheMemoryBreakdown(),
      getCachePerformance(),
    ]);

    setStats(statsData);
    setMemoryBreakdown(memoryData);
    setPerformance(performanceData);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClearSearchCache = async () => {
    const result = await clearSearchCache();
    if (result.success) {
      await refreshData();
    }
  };

  const handleClearAllCache = async () => {
    const result = await clearAllCache();
    if (result.success) {
      await refreshData();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getHitRateColor = (hitRate: number): string => {
    if (hitRate >= 80) return "text-green-600";
    if (hitRate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Cache Management</h2>
          <p className="text-muted-foreground">Monitor and manage Redis cache performance and usage</p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-muted-foreground text-sm">Last updated: {lastRefresh.toLocaleTimeString()}</span>
          )}
          <Button disabled={isLoading} onClick={refreshData} size="sm" variant="outline">
            <IconRefresh className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button className="h-auto p-0" onClick={clearError} variant="link">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Cache Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Cache Keys</CardTitle>
            <IconDatabase className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats?.totalKeys || 0}</div>
            <p className="text-muted-foreground text-xs">{stats?.searchKeys || 0} search-related</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Memory Usage</CardTitle>
            <IconMemory className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats?.memoryUsage || "Unknown"}</div>
            <p className="text-muted-foreground text-xs">Total Redis memory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Cache Hit Rate</CardTitle>
            <IconTrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`font-bold text-2xl ${getHitRateColor(performance?.hitRate || 0)}`}>
              {performance?.hitRate ? `${performance.hitRate.toFixed(1)}%` : "N/A"}
            </div>
            <p className="text-muted-foreground text-xs">
              {performance?.cacheHits || 0} hits, {performance?.cacheMisses || 0} misses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Requests</CardTitle>
            <IconTrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{performance?.totalRequests || 0}</div>
            <p className="text-muted-foreground text-xs">All time requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Memory Breakdown */}
      {memoryBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Breakdown</CardTitle>
            <CardDescription>Detailed breakdown of cache memory usage by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Search Cache</Badge>
                  <span className="text-muted-foreground text-sm">Popular searches, suggestions, and results</span>
                </div>
                <span className="font-mono text-sm">{formatBytes(memoryBreakdown.searchCache)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Session Cache</Badge>
                  <span className="text-muted-foreground text-sm">User sessions and authentication</span>
                </div>
                <span className="font-mono text-sm">{formatBytes(memoryBreakdown.sessionCache)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Other Cache</Badge>
                  <span className="text-muted-foreground text-sm">Miscellaneous cached data</span>
                </div>
                <span className="font-mono text-sm">{formatBytes(memoryBreakdown.otherCache)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Actions</CardTitle>
          <CardDescription>Clear specific cache categories or all cache data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button disabled={isLoading} onClick={handleClearSearchCache} variant="outline">
              <IconTrash className="mr-2 size-4" />
              Clear Search Cache
            </Button>
            <Button disabled={isLoading} onClick={handleClearAllCache} variant="destructive">
              <IconTrash className="mr-2 size-4" />
              Clear All Cache
            </Button>
          </div>
          <p className="mt-2 text-muted-foreground text-xs">
            Clearing cache will temporarily impact performance until cache is rebuilt
          </p>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Detailed cache performance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="font-medium text-muted-foreground text-sm">Cache Hits</div>
                <div className="font-bold text-2xl text-green-600">{performance.cacheHits.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground text-sm">Cache Misses</div>
                <div className="font-bold text-2xl text-red-600">{performance.cacheMisses.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground text-sm">Hit Rate</div>
                <div className={`font-bold text-2xl ${getHitRateColor(performance.hitRate)}`}>
                  {performance.hitRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import {
  clearAllCache,
  clearSearchCache,
  getCacheKeyInfo,
  getCacheKeys,
  getCacheMemoryBreakdown,
  getCacheStats,
  monitorCachePerformance,
} from "@/lib/cache/cache-manager";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    // Check if user is authenticated and has admin privileges
    if (!session?.user || !session.user.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats": {
        const stats = await getCacheStats();
        return NextResponse.json(stats);
      }

      case "memory": {
        const memoryBreakdown = await getCacheMemoryBreakdown();
        return NextResponse.json(memoryBreakdown);
      }

      case "performance": {
        const performance = await monitorCachePerformance();
        return NextResponse.json(performance);
      }

      case "keys": {
        const pattern = searchParams.get("pattern") || "*";
        const keys = await getCacheKeys(pattern);
        return NextResponse.json({ keys });
      }

      case "key-info": {
        const key = searchParams.get("key");
        if (!key) {
          return NextResponse.json({ error: "Key parameter is required" }, { status: 400 });
        }
        const keyInfo = await getCacheKeyInfo(key);
        return NextResponse.json(keyInfo);
      }

      default: {
        // Return general cache stats by default
        const defaultStats = await getCacheStats();
        return NextResponse.json(defaultStats);
      }
    }
  } catch (error) {
    console.error("Cache management error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    // Check if user is authenticated and has admin privileges
    if (!session?.user || !session.user.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "search": {
        const searchResult = await clearSearchCache();
        return NextResponse.json(searchResult);
      }

      case "all": {
        const allResult = await clearAllCache();
        return NextResponse.json(allResult);
      }

      default:
        return NextResponse.json({ error: "Invalid cache type. Use 'search' or 'all'" }, { status: 400 });
    }
  } catch (error) {
    console.error("Cache deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

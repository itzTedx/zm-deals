import { sql } from "drizzle-orm";

import { stripeClient } from "@/lib/stripe/client";
import { db } from "@/server/db";

export interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "warning";
  message: string;
  responseTime?: number;
  error?: string;
}

export interface SystemHealth {
  database: HealthCheckResult;
  paymentGateway: HealthCheckResult;
  lastUpdated: Date;
}

/**
 * Check database connectivity and performance
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Test basic connectivity with a simple query
    const result = await db.execute(sql`SELECT 1 as test`);

    if (!result || result.length === 0) {
      return {
        status: "unhealthy",
        message: "Database query returned no results",
        responseTime: Date.now() - startTime,
      };
    }

    // Test a more complex query to check schema access
    const tableCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`
    );

    return {
      status: "healthy",
      message: "Database connection successful",
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: "Database connection failed",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

/**
 * Check Stripe payment gateway connectivity
 */
export async function checkPaymentGatewayHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Test Stripe connectivity by retrieving account information
    const account = await stripeClient.accounts.retrieve();

    if (!account || !account.id) {
      return {
        status: "unhealthy",
        message: "Payment gateway account not found",
        responseTime: Date.now() - startTime,
      };
    }

    // Check if the account is active
    if (account.charges_enabled === false) {
      return {
        status: "warning",
        message: "Payment gateway connected but charges not enabled",
        responseTime: Date.now() - startTime,
      };
    }

    return {
      status: "healthy",
      message: "Payment gateway connected and ready",
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: "Payment gateway connection failed",
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown payment gateway error",
    };
  }
}

/**
 * Perform comprehensive system health check
 */
export async function performSystemHealthCheck(): Promise<SystemHealth> {
  const [databaseHealth, paymentHealth] = await Promise.allSettled([
    checkDatabaseHealth(),
    checkPaymentGatewayHealth(),
  ]);

  return {
    database:
      databaseHealth.status === "fulfilled"
        ? databaseHealth.value
        : {
            status: "unhealthy",
            message: "Database health check failed",
            error: databaseHealth.reason?.message || "Unknown error",
          },
    paymentGateway:
      paymentHealth.status === "fulfilled"
        ? paymentHealth.value
        : {
            status: "unhealthy",
            message: "Payment gateway health check failed",
            error: paymentHealth.reason?.message || "Unknown error",
          },
    lastUpdated: new Date(),
  };
}

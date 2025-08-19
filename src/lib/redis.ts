import Redis from "ioredis";

import { env } from "./env/server";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  lazyConnect: true,
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("[Redis Error]", err);
});

export default redis;

import dotenv from "dotenv";
import Redis from "ioredis";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
});

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("Redis error:", err));
redis.on("close", () => console.log("Redis connection closed"));
redis.on("reconnecting", () => console.log("Reconnecting to Redis..."));

export default redis;

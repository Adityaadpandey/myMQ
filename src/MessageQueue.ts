import Redis from "ioredis";
import redis from "./redisClient";

interface Message {
    id: string;
    content: Record<string, unknown>;
    timestamp: Date;
}

export class MessageQueue {
    private queueKey: string;
    private pubSubChannel: string;
    private ttlSeconds: number | null;

    constructor(queueKey = "queue:messages", ttlSeconds: number | null = null) {
        this.queueKey = queueKey;
        this.pubSubChannel = `${queueKey}:channel`;
        this.ttlSeconds = ttlSeconds;
    }

    public async addMessage(content: Record<string, unknown>): Promise<void> {
        const message: Message = {
            id: this.generateId(),
            content,
            timestamp: new Date(),
        };

        const serialized = JSON.stringify(message);

        await redis.lpush(this.queueKey, serialized);

        if (this.ttlSeconds) {
            await redis.expire(this.queueKey, this.ttlSeconds);
        }

        await redis.publish(this.pubSubChannel, serialized);
    }

    public async getMessages(): Promise<Message[]> {
        const items = await redis.lrange(this.queueKey, 0, -1);
        return items.map((json) => {
            const msg = JSON.parse(json);
            return {
                ...msg,
                timestamp: new Date(msg.timestamp),
            } as Message;
        });
    }

    public async popMessage(): Promise<Message | null> {
        const json = await redis.rpop(this.queueKey);
        if (!json) return null;

        const msg = JSON.parse(json);
        return {
            ...msg,
            timestamp: new Date(msg.timestamp),
        } as Message;
    }

    public async clearQueue(): Promise<void> {
        await redis.del(this.queueKey);
    }

    public subscribe(onMessage: (msg: Message) => void): void {
        const subscriber = new Redis(redis.options); // separate Redis client for Pub/Sub

        subscriber.subscribe(this.pubSubChannel, () => {
            console.log(`Subscribed to ${this.pubSubChannel}`);
        });

        subscriber.on("message", (_channel, message) => {
            const parsed = JSON.parse(message);
            parsed.timestamp = new Date(parsed.timestamp);
            onMessage(parsed);
        });
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 10);
    }
}

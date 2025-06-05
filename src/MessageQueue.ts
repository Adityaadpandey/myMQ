import Redis from "ioredis";
import { v4 as uuidv4 } from 'uuid';

import redis from "./redisClient";


export enum MessageStatus {
    PENDING = "pending",
    PROCESSED = "processed",
    FAILED = "failed",
    RETRYING = "retrying"
}

export interface Message {
    id: string;
    content: Record<string, unknown>;
    status?: MessageStatus;
    retryCount?: number;
    maxRetries?: number;
    createdAt: Date;
}

export class MessageQueue {
    private queueKey: string;
    private pubSubChannel: string;
    private ttlSeconds: number | null;


    constructor(queueKey = "queue:messages", ttlSeconds: number | null = null, status: MessageStatus = MessageStatus.PENDING, maxRetries: number = 3) {
        this.queueKey = queueKey;
        this.pubSubChannel = `${queueKey}:channel`;
        this.ttlSeconds = ttlSeconds;
    }

    public async addMessage(content: Record<string, unknown>): Promise<void> {
        const message: Message = {
            id: uuidv4(), // using uuid for unique ID
            content,
            status: MessageStatus.PENDING,
            retryCount: 0,
            createdAt: new Date(),
        };

        const serialized = JSON.stringify(message);

        await redis.lpush(this.queueKey, serialized);

        if (this.ttlSeconds) {
            await redis.expire(this.queueKey, this.ttlSeconds);
        }

        await redis.publish(this.pubSubChannel, serialized);
    }

    public async updateMessageStatus(id: string, status: MessageStatus): Promise<void> {
        const items = await redis.lrange(this.queueKey, 0, -1);
        for (let i = 0; i < items.length; i++) {
            const msg = JSON.parse(items[i]);
            if (msg.id === id) {
                msg.status = status;
                await redis.lset(this.queueKey, i, JSON.stringify(msg));
                return;
            }
        }
    }

    public async getMessageById(id: string): Promise<Message | null> {
        const items = await redis.lrange(this.queueKey, 0, -1);
        for (const json of items) {
            const msg = JSON.parse(json);
            if (msg.id === id) {
                return {
                    ...msg,
                    timestamp: new Date(msg.createdAt),
                } as Message;
            }
        }
        return null;
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

    public async retryMessage(id: string): Promise<void> {
        const items = await redis.lrange(this.queueKey, 0, -1);
        for (let i = 0; i < items.length; i++) {
            const msg = JSON.parse(items[i]);
            if (msg.id === id) {
                if (msg.retryCount === undefined) msg.retryCount = 0;
                if (msg.maxRetries === undefined) msg.maxRetries = 3;

                if (msg.retryCount < msg.maxRetries) {
                    msg.status = MessageStatus.RETRYING;
                    msg.retryCount += 1;
                    await redis.lset(this.queueKey, i, JSON.stringify(msg));
                    await redis.publish(this.pubSubChannel, JSON.stringify(msg));
                } else {
                    msg.status = MessageStatus.FAILED;
                    await redis.lset(this.queueKey, i, JSON.stringify(msg));
                }
                return;
            }
        }
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

}

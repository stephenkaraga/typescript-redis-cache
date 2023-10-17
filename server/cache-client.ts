import { createClient, RedisClientType } from "redis";
import 'dotenv/config';

export class RedisCache {
  public readonly client: RedisClientType;
  private ttl: number;

    constructor(ttl: number) {
        this.ttl = ttl;
        this.client = createClient({
            socket: {
                port: parseInt(process.env.REDIS_PORT || "6379")
            }
        });
        this.client.on("connect", () => console.log(`Connected to Redis on port ${process.env.PORT}`));
        this.client.on("error", err => console.error(`Redis error: ${err}.`));
        this.client.on('ready', () => console.log('ready'));
        this.client.on('reconnecting', () => console.log('reconnecting'));
        this.client.on('end', () => console.log('end'));
    }

    async get<T>(key: string): Promise<string> {    
        return new Promise(async (resolve, reject) => {
            const value = await this.client.get(key);
            // If not in cache, can fetch from db and add to cache db.get()... and client.set()
            return value ? resolve(value) : reject('Missing from cache');
        });
    }

    hgetall(key: string) {
        return this.client.hGetAll(key);
    }

    hset(hash: string, key: string, value: string) {
        return this.client.hSet(hash, key, value);
    }

    hget(hash: string, key: string) {
        // If not in cache, check db
        return this.client.hGet(hash, key);
    }

  del(key: string) {
    return this.client.del(key);
  }

  flush() {
    this.client.flushAll();
  }
}
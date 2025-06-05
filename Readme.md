    ## 📨 MyMQ - Lightweight Redis Message Queue

    A simple, TypeScript-based message queue system powered by Redis. It supports:

    * ✅ Queue operations (push, pop, get all)
    * ✅ Optional TTL (auto-expiring queues)
    * ✅ Real-time message delivery via Redis Pub/Sub
    * ✅ JSON message structure with unique IDs and timestamps

    ---

    ## 📦 Features

    * **Message persistence** using Redis Lists
    * **Real-time delivery** with Redis Pub/Sub
    * **Automatic expiration** via optional TTL
    * **Type-safe** implementation using TypeScript
    * Simple and minimalistic — no external frameworks

    ---

    ## 🚀 Getting Started

    ### 1. **Clone the repo**

    ```bash
    git clone https://github.com/Adityaadpandey/myMQ.git
    cd myMQ
    ```

    ### 2. **Install dependencies**

    ```bash
    npm install
    ```

    ### 3. **Start Redis**

    Make sure Redis is running locally:

    ```bash
    docker run -d --name redisx -p 6379:6379 redis
    ```

    ### 4. **Run the project**

    Using `ts-node` (for development):

    ```bash
    npx ts-node src/index.ts
    ```

    Or compile:

    ```bash
    npm run build
    node dist/index.js
    ```

    ---

    ## 🛠 Project Structure

    ```
    src/
    ├── MessageQueue.ts       # MessageQueue class (Redis + Pub/Sub)
    ├── redisClient.ts        # Redis client setup
    ├── consumer.ts           # Consumer for Pub/Sub messages
    └── index.ts              # Example usage
    ```

    ---

    ## ✨ Example Usage

    ```ts
    import { MessageQueue } from "./MessageQueue.js";

    const queue = new MessageQueue("queue:my-messages", 3600); // 1-hour TTL

    await queue.addMessage({ text: "Hello, world!" });

    const messages = await queue.getMessages();
    console.log(messages);

    queue.subscribe((msg) => {
    console.log("🔔 New message received:", msg);
    });
    ```

    ---

    ## 🧪 Scripts

    ```bash
    npm run build     # Compiles TS to JS
    npm run dev       # Runs with ts-node (if set up)
    ```

    ---

    ## 📌 Tech Stack

    * **TypeScript**
    * **Redis**
    * **ioredis**

    ---

    ## 📄 License

    MIT

    ---

    ## 🙌 Contributing

    PRs are welcome! If you have ideas for retries, batch processing, or metrics, feel free to contribute.

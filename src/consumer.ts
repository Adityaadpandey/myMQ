
import { MessageQueue } from "./mq";

// Option 1: Wrap in an async function (recommended)
async function main() {
    const queue = new MessageQueue("queue:chat", 3600); // TTL of 1 hour

    try {
        // Subscribe for real-time messages
        queue.subscribe((msg) => {
            console.log("Received real-time message:", msg);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

// Call the main function
main();

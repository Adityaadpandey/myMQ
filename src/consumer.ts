
import { MessageQueue } from "./MessageQueue";

async function main() {
    const queue = new MessageQueue("queue:chat", 3600);

    try {
        // Subscribe for real-time messages
        queue.subscribe((msg) => {
            console.log("Received real-time message:", msg);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

main();

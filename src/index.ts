
import { MessageQueue } from "./MessageQueue";

// Option 1: Wrap in an async function (recommended)
async function main() {
    const queue = new MessageQueue("queue:chat", 3600); // TTL of 1 hour

    try {
        // Add a message
        await queue.addMessage({ user: "Alice", text: "Hello there!" });

        // Read all messages
        const messages = await queue.getMessages();
        console.log(messages);

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

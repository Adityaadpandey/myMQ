
import { MessageQueue } from "./MessageQueue";

async function main() {
    const queue = new MessageQueue("queue:chat", 1 * 60 * 60); // TTL of 1 hour

    try {
        // Adding a  message to the queue
        await queue.addMessage({ user: "Alice", text: "Hello there!" });

        // Read all messages
        const messages = await queue.getMessages();
        console.log(messages);

    } catch (error) {
        console.error("Error:", error);
    }
}

main();

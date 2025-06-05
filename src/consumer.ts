import { MessageQueue, MessageStatus } from "./MessageQueue";

const queue = new MessageQueue("queue:messages");

async function processJob(msg: any) {
    console.log("Processing message:", msg.id);

    try {
        // Simulate a task
        if (Math.random() < 0.3) {
            throw new Error("Random failure");
        }
        // Here you would typically process the message, e.g., send an email
        // For demonstration, we just log the payload
        if (!msg.content || !msg.content.payload || !msg.content.payload.to) {
            throw new Error("Invalid message format");
        }
        // Simulate processing the message
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate async work
        // Log the successful processing
        console.log(`>>>> Processed job: ${msg.content.payload?.to}`);
        await queue.updateMessageStatus(msg.id, MessageStatus.PROCESSED);
    } catch (error:any) {
        console.error(`xxxx Error processing job ${msg.id}:`, error.message);
        await queue.retryMessage(msg.id);
    }
}

// Subscribe to messages via Redis Pub/Sub
queue.subscribe((msg) => {
    processJob(msg).catch(console.error);
});

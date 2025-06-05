import { MessageQueue } from "./MessageQueue";

const queue = new MessageQueue("queue:messages");

async function produce() {
    for (let i = 0; i < 5; i++) {
        const jobData = {
            task: "email",
            payload: {
                to: `user${i}@example.com`,
                subject: `Welcome user${i}`,
                body: `Hello User ${i}!`
            }
        };

        await queue.addMessage(jobData);
        console.log(`Produced message ${i}`);
    }
}

produce().catch(console.error);

require("dotenv").config();

const queueService = require("../services/queueService");
const emailService = require("../services/emailService");

const pollInterval = Number(process.env.EMAIL_WORKER_POLL_INTERVAL || 5000);

async function processMessage(message) {
    const order = JSON.parse(message.content);
    await emailService.sendOrderEmail(order);
    await queueService.deleteMessage(message.receipt);
    console.log(`E-mail do pedido ${order.pedidoId} enviado para ${order.email}`);
}

async function loop() {
    while(true) {
        try {
            const messages = await queueService.getMessages(Number(process.env.EMAIL_WORKER_BATCH_SIZE || 5));
            for(const message of messages) {
                await processMessage(message);
            }
        }
        catch(error) {
            console.error("Erro ao consumir fila de e-mail:", error);
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
}

loop();

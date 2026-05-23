const queue = require("oci-queue");
const { getAuthenticationProvider } = require("./ociAuthProvider");

let clientPromise;

async function getClient() {
    if(clientPromise == null) {
        clientPromise = getAuthenticationProvider().then((provider) => {
            const client = new queue.QueueClient({
                authenticationDetailsProvider: provider
            });

            if(process.env.OCI_QUEUE_ENDPOINT) {
                client.endpoint = process.env.OCI_QUEUE_ENDPOINT;
            }

            return client;
        });
    }

    return clientPromise;
}

function getQueueId() {
    if(!process.env.OCI_QUEUE_OCID) {
        throw new Error("OCI_QUEUE_OCID nao configurado no .env");
    }

    return process.env.OCI_QUEUE_OCID;
}

async function publishOrderEmailEvent(payload) {
    const client = await getClient();

    await client.putMessages({
        queueId: getQueueId(),
        putMessagesDetails: {
            messages: [
                {
                    content: JSON.stringify(payload)
                }
            ]
        }
    });
}

async function getMessages(limit) {
    const client = await getClient();
    const response = await client.getMessages({
        queueId: getQueueId(),
        limit: limit || 5,
        timeoutInSeconds: Number(process.env.OCI_QUEUE_POLL_TIMEOUT || 20),
        visibilityInSeconds: Number(process.env.OCI_QUEUE_VISIBILITY_TIMEOUT || 30)
    });

    return response.getMessages.messages || [];
}

async function deleteMessage(receipt) {
    const client = await getClient();
    await client.deleteMessage({
        queueId: getQueueId(),
        messageReceipt: receipt
    });
}

module.exports = {
    publishOrderEmailEvent,
    getMessages,
    deleteMessage
};

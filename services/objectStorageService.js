const objectstorage = require("oci-objectstorage");
const path = require("path");
const { getAuthenticationProvider } = require("./ociAuthProvider");

let clientPromise;

async function getClient() {
    if(clientPromise == null) {
        clientPromise = getAuthenticationProvider().then((provider) => {
            const client = new objectstorage.ObjectStorageClient({
                authenticationDetailsProvider: provider
            });

            if(process.env.OCI_REGION) {
                client.regionId = process.env.OCI_REGION;
            }

            return client;
        });
    }

    return clientPromise;
}

function getPublicUrl(objectName) {
    const baseUrl = process.env.OCI_OBJECT_BASE_URL;
    if(baseUrl == null || baseUrl == "") {
        throw new Error("OCI_OBJECT_BASE_URL nao configurada no .env");
    }

    return `${baseUrl.replace(/\/$/, "")}/${encodeURIComponent(objectName)}`;
}

async function uploadProductImage(file) {
    if(!process.env.OCI_NAMESPACE || !process.env.OCI_BUCKET_NAME) {
        throw new Error("OCI_NAMESPACE e OCI_BUCKET_NAME devem estar configuradas no .env");
    }

    const client = await getClient();
    const ext = path.extname(file.originalname).toLowerCase();
    const objectName = `produtos/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    await client.putObject({
        namespaceName: process.env.OCI_NAMESPACE,
        bucketName: process.env.OCI_BUCKET_NAME,
        objectName: objectName,
        putObjectBody: file.buffer,
        contentLength: file.size,
        contentType: file.mimetype
    });

    return getPublicUrl(objectName);
}

module.exports = {
    uploadProductImage
};

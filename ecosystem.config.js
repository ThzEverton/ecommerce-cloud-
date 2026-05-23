module.exports = {
    apps: [
        {
            name: "ecommerce-web",
            script: "server.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "300M"
        },
        {
            name: "ecommerce-email-worker",
            script: "workers/emailConsumer.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "300M"
        }
    ]
};

const common = require("oci-common");

async function getAuthenticationProvider() {
    if(process.env.OCI_USE_INSTANCE_PRINCIPAL == "true") {
        return await common.InstancePrincipalsAuthenticationDetailsProviderBuilder.builder().build();
    }

    const configFilePath = process.env.OCI_CONFIG_FILE || undefined;
    const profile = process.env.OCI_CONFIG_PROFILE || "DEFAULT";
    return new common.ConfigFileAuthenticationDetailsProvider(configFilePath, profile);
}

module.exports = {
    getAuthenticationProvider
};

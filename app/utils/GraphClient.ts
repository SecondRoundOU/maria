import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

let _graphClient: Client | null = null;

function getGraphClient(): Client {
  if (!_graphClient) {
    const tenantId = process.env.NEXT_TENANT_ID;
    const appId = process.env.NEXT_APP_ID;
    const secretKey = process.env.NEXT_SECRET_KEY;

    if (!tenantId || !appId || !secretKey) {
      throw new Error(
        'Missing required Microsoft Graph credentials. Please ensure NEXT_TENANT_ID, NEXT_APP_ID, and NEXT_SECRET_KEY are set in your environment variables.'
      );
    }

    const credential = new ClientSecretCredential(tenantId, appId, secretKey);

    const authProvider = {
      getAccessToken: async () => {
        const token = await credential.getToken("https://graph.microsoft.com/.default");
        return token?.token ?? null;
      },
    };

    _graphClient = Client.initWithMiddleware({
      authProvider,
    });
  }

  return _graphClient;
}

export const graphClient = new Proxy({} as Client, {
  get: (target, prop) => {
    const client = getGraphClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

const credential = new ClientSecretCredential(
  process.env.NEXT_TENANT_ID!,
  process.env.NEXT_APP_ID!,
  process.env.NEXT_SECRET_KEY!
);

const authProvider = {
  getAccessToken: async () => {
    const token = await credential.getToken("https://graph.microsoft.com/.default");
    return token?.token ?? null; // Ensure the return value is string or null
  },
};

export const graphClient = Client.initWithMiddleware({
  authProvider,
});

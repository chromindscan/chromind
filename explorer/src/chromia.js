// src/services/clientService.js
import { createClient } from "postchain-client";

const directoryNodeUrlPool = ["https://dapps0.chromaway.com:7740"];

let clientInstance = null;

/**
 * Initializes the Postchain client if not already initialized.
 * @returns {Promise<Object>} The initialized client instance.
 */
export async function getClient() {
  if (!clientInstance) {
    try {
      clientInstance = await createClient({
        nodeUrlPool: directoryNodeUrlPool,
        blockchainRid:
          "E55CAEA35948B8FA13F9E19B201D5A93BAA664AD57E6CE52AE9022B5024B8083",
      });
      console.log("Postchain client initialized.");
    } catch (error) {
      console.error("Failed to initialize Postchain client:", error);
      throw error;
    }
  }
  return clientInstance;
}

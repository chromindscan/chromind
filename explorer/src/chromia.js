// src/services/clientService.js
import { createClient } from "postchain-client";

let clientInstance = null;

/**
 * Initializes the Postchain client if not already initialized.
 * @returns {Promise<Object>} The initialized client instance.
 */
export async function getClient() {
  if (!clientInstance) {
    try {
      clientInstance = await createClient({
        nodeUrlPool: "http://localhost:7740",
        blockchainIid: 0,
      });
      console.log("Postchain client initialized.");
    } catch (error) {
      console.error("Failed to initialize Postchain client:", error);
      throw error;
    }
  }
  return clientInstance;
}
<template>
  <div class="log-details">
    <div v-if="isLoading" class="status-message loading">
      Loading log details...
    </div>
    <div v-if="error" class="status-message error">
      {{ error }}
    </div>

    <div v-if="!isLoading && !error" class="details-container">
      <div class="detail-section">
        <div class="detail-title">Address:</div>
        <div class="detail-content">
          <router-link :to="`/address/${uint8ArrayToHex(log.address)}`" class="uuid-link">
            {{ uint8ArrayToHex(log.address) }}
          </router-link>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-title">Timestamp:</div>
        <div class="detail-content">{{ formatTimestamp(log.created_at) }}</div>
      </div>
      <div class="detail-section">
        <div class="detail-title">UUID:</div>
        <div class="detail-content">
          <router-link :to="`/log/${log.uuid}`" class="uuid-link">
            {{ log.uuid }}
          </router-link>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-title">User Question:</div>
        <div class="detail-content">{{ log.user_question }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Assistant Reply:</div>
        <div class="detail-content">{{ log.assistant_reply }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Chat ID:</div>
        <div class="detail-content">{{ log.chat_id }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Finish Reason:</div>
        <div class="detail-content">{{ log.finish_reason }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Request Messages:</div>
        <div class="detail-content">{{ log.request_messages }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Request Model:</div>
        <div class="detail-content">{{ log.request_model }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Request Raw:</div>
        <div class="detail-content">{{ parsedRequestRaw }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Created:</div>
        <div class="detail-content">
          {{ formatTimestamp(log.response_created) }}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Model:</div>
        <div class="detail-content">{{ log.response_model }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Object:</div>
        <div class="detail-content">{{ log.response_object }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Provider:</div>
        <div class="detail-content">{{ log.response_provider }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Raw:</div>
        <div class="detail-content">{{ parsedResponseRaw }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response System Fingerprint:</div>
        <div class="detail-content">{{ log.response_system_fingerprint }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Usage Completion Tokens:</div>
        <div class="detail-content">
          {{ log.response_usage_completion_tokens }}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Usage Prompt Tokens:</div>
        <div class="detail-content">{{ log.response_usage_prompt_tokens }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-title">Response Usage Total Tokens:</div>
        <div class="detail-content">{{ log.response_usage_total_tokens }}</div>
      </div>
      <router-link to="/" class="back-link"
        >&larr; Back to Log Explorer</router-link
      >
    </div>
  </div>
</template>

<script>
import { getClient } from "../chromia";
import { uint8ArrayToHex } from "../util";

export default {
  name: "LogDetails",
  props: {
    uuid: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      log: {},
      isLoading: true,
      error: null,
      parsedRequestRaw: "",
      parsedResponseRaw: "",
    };
  },
  computed: {
    parsedRequestRaw() {
      return this.parseJSON(this.log.request_raw);
    },
    parsedResponseRaw() {
      return this.parseJSON(this.log.response_raw);
    },
  },
  methods: {
    uint8ArrayToHex,
    formatTimestamp(timestamp) {
      if (!timestamp) return "N/A";
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    parseJSON(jsonString) {
      try {
        return JSON.stringify(JSON.parse(jsonString), null, 2);
      } catch (e) {
        return "Invalid JSON";
      }
    },
    async fetchLogDetails() {
      try {
        const client = await getClient();
        const result = await client.query({
          name: "get_log",
          args: {
            uuid: this.uuid,
          },
        });
        if (result) {
          this.log = result;
          console.log(result);
        } else {
          throw new Error("Log not found.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        this.error = "Failed to load log details. Please try again later.";
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.fetchLogDetails();
  },
};
</script>

<style scoped>
.log-details {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.status-message {
  text-align: center;
  margin: 10px 0;
  font-size: 1em;
}

.loading {
  color: #cb8fe9;
}

.error {
  color: #fdb3c2;
}

.details-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

/* Scrollbar Styles for WebKit Browsers */
:deep(.details-container::-webkit-scrollbar) {
  width: 12px;
}

:deep(.details-container::-webkit-scrollbar-track) {
  background: #2c2734;
}

:deep(.details-container::-webkit-scrollbar-thumb) {
  background-color: #ca67b7;
  border-radius: 6px;
  border: 3px solid #2c2734; /* Creates padding around the thumb */
}

/* Scrollbar Styles for Firefox */
:deep(.details-container) {
  scrollbar-width: thin; /* Options: auto, thin, none */
  scrollbar-color: #ca67b7 #2c2734; /* thumb color, track color */
}

.detail-section {
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid #444;
}

.detail-title {
  color: #cb8fe9;
  font-size: 1.1em;
  margin-bottom: 5px;
}

.detail-content {
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.uuid-link {
  color: #ca67b7;
  text-decoration: none;
}

.uuid-link:hover {
  text-decoration: underline;
}

.back-link {
  color: #ca67b7;
  text-decoration: none;
  margin-top: 10px;
  align-self: flex-start;
}

.back-link:hover {
  text-decoration: underline;
}
</style>

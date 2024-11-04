<!-- src/components/LogList.vue -->
<template>
  <div class="log-list">
    <h2>Address: {{address}}</h2>
    <div v-if="isLoading" class="status-message loading">Loading logs...</div>
    <div v-if="error" class="status-message error">{{ error }}</div>

    <div v-if="!isLoading && !error" class="log-container">
      <div v-for="log in logs" :key="log.uuid" class="log-entry">
        <div class="timestamp">{{ formatTimestamp(log.created_at) }}</div>

        <div class="uuid-section">
          <strong>UUID:</strong>
          <router-link :to="`/log/${log.uuid}`" class="uuid-link">
            {{ log.uuid }}
          </router-link>
        </div>

        <div class="messages">
          <div
            v-for="(message, index) in JSON.parse(log.request_messages)"
            :key="index"
            :class="['message', message.role]"
          >
            <span class="emoji" :aria-label="message.role === 'user' ? 'User' : 'Assistant'">
              {{ message.role === 'user' ? '👱‍♂️' : '🤖' }}
            </span>
            <span class="message-content">{{ message.content }}</span>
          </div>
          <div class="message assistant">
            <span class="emoji" aria-label="Assistant">🤖</span>
            <span class="message-content">{{ log.assistant_reply }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getClient } from '../chromia';

export default {
  name: 'LogList',
  props: {
    address: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      logs: [],
      message: 'Chromia Terminal Explorer',
      isLoading: true,
      error: null,
    };
  },
  methods: {
    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A';
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    async fetchLogs() {
      try {
        const client = await getClient();
        const result = await client.query({
          name: 'get_logs',
          args: {
            address: this.address,
            start_time: 0,
            end_time: Date.now(),
            pointer: 0,
            n_prompts: 10,
          },
        });

        if (result.logs && Array.isArray(result.logs)) {
          this.logs = result.logs;
        } else {
          throw new Error('Invalid data format received from the client.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        this.error = 'Failed to load logs. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.fetchLogs();
  },
};
</script>

<style scoped>
.log-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: Arial, sans-serif;
  color: #f0f0f0;
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

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

/* Scrollbar Styles for WebKit Browsers */
:deep(.log-container::-webkit-scrollbar) {
  width: 12px;
}

:deep(.log-container::-webkit-scrollbar-track) {
  background: #2c2734;
}

:deep(.log-container::-webkit-scrollbar-thumb) {
  background-color: #ca67b7;
  border-radius: 6px;
  border: 3px solid #2c2734; /* Creates padding around the thumb */
}

/* Scrollbar Styles for Firefox */
:deep(.log-container) {
  scrollbar-width: thin; /* Options: auto, thin, none */
  scrollbar-color: #ca67b7 #2c2734; /* thumb color, track color */
}

.log-entry {
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.timestamp {
  color: #cb8fe9;
  font-size: 0.85em;
  margin-bottom: 8px;
}

.uuid-section {
  margin-bottom: 12px;
}

.uuid-link {
  color: #ca67b7;
  text-decoration: none;
  font-weight: bold;
}

.uuid-link:hover {
  text-decoration: underline;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  display: flex;
  align-items: flex-start;
  max-width: 80%; /* Prevent messages from spanning the entire width */
}

.message.assistant {
  align-self: flex-start; /* Align to the left */
  flex-direction: row; /* Default direction */
}

.message.user {
  align-self: flex-end; /* Align to the right */
  flex-direction: row-reverse; /* Reverse direction for user messages */
}

.emoji {
  font-size: 1.5em;
  margin: 0 10px;
  flex-shrink: 0;
}

.message-content {
  background-color: #3a3750;
  padding: 10px 15px;
  border-radius: 15px;
  white-space: pre-wrap; /* Preserves spaces and line breaks */
  overflow-wrap: break-word; /* Break long words */
  word-wrap: break-word; /* For legacy browsers */
  color: #f0f0f0;
  flex: 1;
  /* Prevent content from overflowing */
  word-break: break-word;
}

.message.assistant .message-content {
  background-color: #4b3f68;
}

.message.user .message-content {
  background-color: #6a5acd; /* Different color for user messages */
}

@media (max-width: 600px) {
  .log-entry {
    padding: 10px;
  }

  .emoji {
    font-size: 1.2em;
    margin: 0 8px;
  }

  .message-content {
    padding: 8px 12px;
  }
}
</style>
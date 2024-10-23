<!-- src/components/Home.vue -->
<template>
  <div class="home">
    <h1>Welcome to Chromia Terminal Explorer</h1>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        @keyup.enter="performSearch"
        placeholder="Search logs by UUID or address..."
      />
      <button @click="performSearch">Search</button>
    </div>

    <div class="sample-addresses">
      <h2>Top Addresses</h2>
      <ul>
        <li v-for="{address} in topAddresses" :key="address">
          <router-link :to="`/address/${uint8ArrayToHex(address)}`">
            {{ uint8ArrayToHex(address) }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getClient } from "../chromia";
import { catchError, uint8ArrayToHex } from "../util";

export default {
  name: "Home",
  data() {
    return {
      searchQuery: "",
      topAddresses: [],
    };
  },
  methods: {
    uint8ArrayToHex,
    async fetchTopAddresses() {
      const client = await getClient();
      const [error, result] = await catchError(
        client.query({
          name: "get_top_allowlist",
        })
      );
      console.log(result);
      if (error) {
        console.error(error);
        return;
      }
      this.topAddresses = result;
    },
    async performSearch() {
      const query = this.searchQuery.trim();
      if (query === "") {
        alert("Please enter a search query.");
        return;
      }
      const client = await getClient();
      const [error, result] = await catchError(
        client.query({
          name: "check_allowlist",
          args: {
            address: query,
          },
        })
      );
      if (error) this.$router.push(`/log/${query}`);
      else this.$router.push(`/address/${query}`);
    },
  },
  mounted() {
    this.fetchTopAddresses();
  },
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #f0f0f0;
  background-color: #2c2734;
  height: 100vh;
  box-sizing: border-box;
}

h1 {
  color: #ca67b7;
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  width: 100%;
  max-width: 500px;
  margin-bottom: 30px;
}

.search-bar input {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1em;
  background-color: #3a3750;
  color: #f0f0f0;
}

.search-bar input::placeholder {
  color: #b0a9c6;
}

.search-bar button {
  padding: 10px 20px;
  border: none;
  background-color: #ca67b7;
  color: #f0f0f0;
  font-size: 1em;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  transition: background-color 0.3s ease;
}

.search-bar button:hover {
  background-color: #b35ca3;
}

.sample-addresses {
  width: 100%;
  max-width: 500px;
  margin-bottom: 40px;
}

.sample-addresses h2 {
  margin-bottom: 15px;
  color: #cb8fe9;
}

.sample-addresses ul {
  list-style: none;
  padding: 0;
}

.sample-addresses li {
  margin-bottom: 10px;
}

.sample-addresses a {
  color: #ca67b7;
  text-decoration: none;
  font-weight: bold;
  word-break: break-all;
  transition: color 0.3s ease;
}

.sample-addresses a:hover {
  color: #fdb3c2;
}

.navigation {
  width: 100%;
  max-width: 500px;
}

.navigation h2 {
  margin-bottom: 15px;
  color: #cb8fe9;
}

.navigation ul {
  list-style: none;
  padding: 0;
}

.navigation li {
  margin-bottom: 10px;
}

.navigation a {
  color: #ca67b7;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.navigation a:hover {
  color: #fdb3c2;
}

@media (max-width: 600px) {
  .search-bar {
    flex-direction: column;
  }

  .search-bar input,
  .search-bar button {
    width: 100%;
    border-radius: 4px;
  }

  .search-bar button {
    margin-top: 10px;
    border-radius: 4px;
  }
}
</style>

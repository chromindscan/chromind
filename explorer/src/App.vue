<template>
  <header class="app-header">
    <h1><a href="/">Chromia LLM Explorer</a></h1>
  </header>
  <main>
    <router-view></router-view>
  </main>
  <footer class="app-footer">
    <p>&copy; 2024 Chromia</p>
  </footer>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

h1 > a {
  font-size: 32px;
  text-decoration: none;
  color: inherit;
}

.app-header {
  text-align: center;
}

.app-footer {
  color: #cb8fe9;
  padding: 15px 20px;
  text-align: center;
  border-top: 1px solid #444;
  margin-top: auto;
}

main {
  flex: 1;
  overflow: hidden;
}
</style>

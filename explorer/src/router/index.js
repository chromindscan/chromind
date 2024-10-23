import { createRouter, createWebHistory } from 'vue-router';
import LogList from '../components/LogList.vue';
import LogDetails from '../components/LogDetails.vue';
import Home from '../components/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/address/:address',
    name: 'LogList',
    component: LogList,
    props: true,
  },
  {
    path: '/log/:uuid',
    name: 'LogDetails',
    component: LogDetails,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
import { createRouter, createWebHistory } from 'vue-router';
import LogList from '../components/LogList.vue';
import LogDetails from '../components/LogDetails.vue';

const routes = [
  {
    path: '/',
    name: 'LogList',
    component: LogList,
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
import Vue from 'vue';
import Router from 'vue-router';
import Fang from '@/components/Fang';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'kaipiao',
      component: Fang
    }
  ]
});

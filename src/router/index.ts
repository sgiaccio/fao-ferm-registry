import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import ProjectView from "../views/project/ProjectView.vue";
import ProjectRegistrationView from "../views/project/RegistrationView.vue";
import ProjectAoi from "../views/project/AoiView.vue";
import ProjectCharacteristics from "../views/project/CharacteristicsView.vue";
import ProjectActivities from "../views/project/ActivitiesView.vue";
import ProjectIndicators from "../views/project/IndicatorsView.vue";
import ProjectInformation from "../views/project/InformationView.vue";
import ProjectResults from "../views/project/ResultsView.vue";

import { useAuthStore } from "../stores/auth"


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: '/projects/:id',
      component: ProjectView,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'info',
          name: 'info',
          component: ProjectRegistrationView,
          meta: {
            requiresAuth: true
          }
        }, { 
          path: 'aoi',
          name: 'aoi',
          component: ProjectAoi,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'characteristics',
          name: 'characteristics',
          component: ProjectCharacteristics,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'activities',
          name: 'activities',
          component: ProjectActivities,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'indicators',
          name: 'indicators',
          component: ProjectIndicators,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'information',
          name: 'information',
          component: ProjectInformation,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'results',
          name: 'results',
          component: ProjectResults,
          meta: {
            requiresAuth: true
          }
        }
      ]
    }
  ],
});

// router.beforeEach(async (to) => {
//   // redirect to login page if not logged in and trying to access a restricted page 
//   const publicPages = ['/account/login', '/account/register'];
//   const authRequired = !publicPages.includes(to.path);
//   const authStore = useAuthStore();

//   if (authRequired && !authStore.user) {
//       authStore.returnUrl = to.fullPath;
//       return '/account/login';
//   }
// });

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  if (to.path === "/login" && authStore.user) {
    next("/");
    return;
  }

  if (to.matched.some(record => record.meta.requiresAuth && !authStore.user)) {
    next("/login");
    return;
  }

  next();
});



export default router;

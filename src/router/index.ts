import { useAuthStore } from "../stores/auth"
import { useUserPrefsStore } from "../stores/userPreferences"

import { createRouter, createWebHistory } from "vue-router";

// Project tabs are used both for editing and viewing projects, so define them once here
const projectTabs = [{
  path: 'info',
  component: () => import('../views/project/RegistrationView.vue'),
  meta: {
    requiresAuth: true
  }
}, {
  path: 'aoi',
  component: () => import('../views/project/AoiView.vue'),
  meta: {
    requiresAuth: true
  }
}, {
  path: 'characteristics',
  component: () => import('../views/project/characteristics/CharacteristicsView.vue'),
  meta: {
    requiresAuth: true
  }
}, {
  path: 'activities',
  component: () => import('../views/project/ActivitiesView.vue'),
  meta: {
    requiresAuth: true
  }
}, {
  path: 'ecosystems',
  component: () => import('../views/project/EcosystemsView.vue'),
  meta: {
    requiresAuth: true
  }
}, {
  path: 'indicators',
  component: () => import('../views/project/IndicatorsView.vue'),
  meta: {
    requiresAuth: true
  }
}, {
  path: 'results',
  component: () => import('../views/project/ResultsView.vue'),
  meta: {
    requiresAuth: true
  }
}];

const router = createRouter({
  scrollBehavior(_to, _from, _savedPosition) {
    // always scroll to top
    return {
      top: 0,
      behavior: 'smooth'
    }
  },
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import('../views/HomeView.vue')
    }, {
      path: "/login",
      name: "login",
      component: () => import('../views/LoginView.vue')
    }, {
      path: "/signup",
      name: "signup",
      component: () => import('../views/SignUpView.vue')
    }, {
      path: "/registration",
      name: "registration",
      component: () => import('../views/UserRegistrationView.vue'),
      meta: {
        requiresAuth: true
      },
    }, {
      path: "/admin",
      name: "admin",
      component: () => import('../views/admin/AdminView.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/admin/UserListView.vue'),
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'groups',
          name: 'groups',
          component: () => import('../views/admin/GroupListView.vue'),
          meta: {
            requiresAuth: true
          }
        }
      ]
    }, {
      path: '/initiatives',
      name: 'initiatives',
      component: () => import('../views/project/ProjectListView.vue'),
      meta: {
        requiresAuth: true
      },
    }, {
      path: '/initiatives/:id',
      name: 'initiative',
      component: () => import('../views/project/ProjectViewView.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'print',
          name: 'printProject',
          component: () => import('../views/project/ProjectPrintView.vue'),
          meta: {
            requiresAuth: true
          }
        },
        ...projectTabs
      ]
    }, {
      path: '/initiatives/:id/edit',
      name: 'initiative-edit',
      component: () => import('../views/project/ProjectEditView.vue'),
      // props: { edit: true },
      meta: {
        requiresAuth: true
      },
      children: [
        ...projectTabs
      ]
    }, {
      path: '/good-practices',
      component: () => import('../views/bestpractices/BestPracticeListView.vue'),
      meta: {
        requiresAuth: true
      }
    }, {
      path: '/good-practices/:id',
      component: () => import('../views/bestpractices/BestPracticeView.vue'),
      name: 'bestPractice',
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'print',
          name: 'printBestPractice',
          component: () => import('../views/bestpractices/BestPracticePrint.vue'),
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'objectives',
          name: 'objectives',
          component: () => import('../views/bestpractices/ObjectivesView.vue'),
          meta: {
            requiresAuth: true,
            dataPath: 'objectives'
          }
        }, {
          path: 'methodology',
          name: 'methodology',
          component: () => import('../views/bestpractices/MethodologyView.vue'),
          meta: {
            requiresAuth: true,
            dataPath: 'methodology'
          }
        }, {
          path: 'key-factors',
          name: 'key-factors',
          component: () => import('../views/bestpractices/KeyFactorsView.vue'),
          meta: {
            requiresAuth: true,
            dataPath: 'keyFactors'
          }
        }, {
          path: 'benefits',
          name: 'benefits',
          component: () => import('../views/bestpractices/BenefitsView.vue'),
          meta: {
            requiresAuth: true,
            dataPath: 'benefits'
          }
        }, {
          path: 'additional-resources',
          name: 'additional-resources',
          component: () => import('../views/bestpractices/AdditionalResourcesView.vue'),
          meta: {
            requiresAuth: true,
            dataPath: 'additionalResources'
          }
        }
      ]
    }, {
      path: '/:pathMatch(.*)',
      component: () => import('../views/NotFoundView.vue')
    }
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const userPrefsStore = useUserPrefsStore();

  // Fetch the registration data if the user is logged in
  if (authStore.user && !userPrefsStore.userPrefs.registrationData) {
    await userPrefsStore.fetchUserPrefs();
  }

  // If the user is logged in and filled the registration form and tries to access the registration page, redirect to home
  if (authStore.user && to.name === 'registration'  && userPrefsStore.userPrefs.registrationData) {
    return { name: 'home' };
  }

  // If the user is logged in but didn't fill the registration form, redirect to registration
  if (authStore.user && to.name !== 'registration' && !userPrefsStore.userPrefs.registrationData) {
    return { name: 'registration' };
  }

  // If the user is logged in and tries to access the login page, redirect to home
  if (authStore.user && to.name === 'login') {
    return { name: 'home' };
  }

  // If the user is not logged in and tries to access a page that requires auth, redirect to login
  if (to.matched.some(record => record.meta.requiresAuth) && authStore.authLoaded && !authStore.user) {
    authStore.returnUrl = to.fullPath;
    return { name: 'login' };
  }
});

export default router;

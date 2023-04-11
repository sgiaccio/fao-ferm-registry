import { useAuthStore } from "../stores/auth"
import { useUserPrefsStore } from "../stores/userPreferences"

import { createRouter, createWebHistory } from "vue-router";

// Initiatives tabs are used both for editing and viewing projects, so define them once here
// Can't set the route name here because they are used twice.
const projectTabs = [{
  path: 'info',
  component: () => import('../views/project/RegistrationView.vue')
}, {
  path: 'aoi',
  component: () => import('../views/project/AoiView.vue')
}, {
  path: 'characteristics',
  component: () => import('../views/project/characteristics/CharacteristicsView.vue')
}, {
  path: 'activities',
  component: () => import('../views/project/ActivitiesView.vue')
}, {
  path: 'ecosystems',
  component: () => import('../views/project/EcosystemsView.vue')
}, {
  path: 'indicators',
  component: () => import('../views/project/IndicatorsView.vue')
}, {
  path: 'results',
  component: () => import('../views/project/ResultsView.vue')
}];

// Good Practices tabs are used both for editing and viewing projects, so define them once here
const bestPracticeTabs = [{
  path: 'objectives',
  component: () => import('../views/bestpractices/ObjectivesView.vue'),
  meta: { dataPath: 'objectives' }
}, {
  path: 'methodology',
  component: () => import('../views/bestpractices/MethodologyView.vue'),
  meta: { dataPath: 'methodology' }
}, {
  path: 'key-factors',
  component: () => import('../views/bestpractices/KeyFactorsView.vue'),
  meta: { dataPath: 'keyFactors' }
}, {
  path: 'benefits',
  component: () => import('../views/bestpractices/BenefitsView.vue'),
  meta: { dataPath: 'benefits' }
}, {
  path: 'additional-resources',
  component: () => import('../views/bestpractices/AdditionalResourcesView.vue'),
  meta: { dataPath: 'additionalResources' }
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
      component: () => import('../views/HomeView.vue'),
      meta: { public: true }
    },
    
    // Authentication and registration
    {
      path: "/login",
      name: "login",
      component: () => import('../views/LoginView.vue'),
      meta: { public: true }
    }, {
      path: "/signup",
      name: "signup",
      component: () => import('../views/SignUpView.vue'),
      meta: { public: true }
    }, {
      path: "/registration",
      name: "registration",
      component: () => import('../views/UserRegistrationView.vue')
    },
    
    // Administration
    {
      path: "/admin",
      name: "admin",
      component: () => import('../views/admin/AdminView.vue'),
      children: [
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/admin/UserListView.vue')
        }, {
          path: 'groups',
          name: 'groups',
          component: () => import('../views/admin/GroupListView.vue')
        }
      ]
    },
    
    // Initiatives
    {
      path: '/initiatives',
      name: 'initiatives',
      component: () => import('../views/project/ProjectListView.vue')
    },
    
    // {
    //   path: '/initiatives/:id',
    //   name: 'initiative',
    //   component: () => import('../views/project/ProjectViewView.vue')
    //   children: [
    //     {
    //       path: 'print',
    //       name: 'printProject',
    //       component: () => import('../views/project/ProjectPrintView.vue')
    //     },
    //     ...projectTabs
    //   ]
    // }, {
    //   path: '/initiatives/:id/edit',
    //   name: 'initiative-edit',
    //   component: () => import('../views/project/ProjectEditView.vue'),
    //   // props: { edit: true },
    //   children: [...projectTabs]
    // },
    
    {
      path: '/initiatives/:id',
      component: () => import('../views/project/ProjectView.vue'),
      children: [
        {
          path: '',
          name: 'initiative',
          component: () => import('../views/project/ProjectViewView.vue'),
          children: [...projectTabs]
        }, {
          path: 'print',
          name: 'printInitiative',
          component: () => import('../views/project/ProjectPrintView.vue')
        }, {
          path: 'edit',
          name: 'editInitiative',
          component: () => import('../views/project/ProjectEditView.vue'),
          children: [...projectTabs]
        },
      ]
    },

    // Good Practices
    {
      path: '/good-practices',
      component: () => import('../views/bestpractices/BestPracticeListView.vue')
    }, {
      path: '/good-practices/:id',
      component: () => import('../views/bestpractices/BestPracticeView.vue'),
      children: [
        {
          path: '',
          name: 'bestPractice',
          component: () => import('../views/bestpractices/BestPracticeViewView.vue'),
          children: [...bestPracticeTabs]
        },
        {
          path: 'print',
          name: 'printBestPractice',
          component: () => import('../views/bestpractices/BestPracticePrint.vue')
        },
        {
          path: 'edit',
          name: 'editBestPractice',
          component: () => import('../views/bestpractices/BestPracticeEditView.vue'),
          children: [...bestPracticeTabs]
        },
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
  if (authStore.user && to.name === 'registration' && userPrefsStore.userPrefs.registrationData) {
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
  if (to.matched.some(record => !record.meta.public) && authStore.authLoaded && !authStore.user) {
    authStore.returnUrl = to.fullPath;
    return { name: 'login' };
  }
});

export default router;

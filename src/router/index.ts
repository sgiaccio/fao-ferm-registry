import { useAuthStore } from "../stores/auth"

import { createRouter, createWebHistory } from "vue-router";

const HomeView  = () => import('../views/HomeView.vue')
const LoginView = () => import('../views/LoginView.vue')
const AdminView = () => import('../views/admin/AdminView.vue')

// Projects
const ProjectView             = () => import('../views/project/ProjectView.vue')
const ProjectRegistrationView = () => import('../views/project/RegistrationView.vue')
const ProjectAoi              = () => import('../views/project/AoiView.vue')
const ProjectCharacteristics  = () => import('../views/project/characteristics/CharacteristicsView.vue')
const ProjectActivities       = () => import('../views/project/ActivitiesView.vue')
const ProjectEcosystems       = () => import('../views/project/EcosystemsView.vue')
const ProjectIndicators       = () => import('../views/project/IndicatorsView.vue')
const ProjectResults          = () => import('../views/project/ResultsView.vue')

// Best practices
const BestPracticeListView    = () => import('../views/bestpractices/BestPracticeListView.vue')
const BestPracticeView        = () => import('../views/bestpractices/BestPracticeView.vue')
const ObjectivesView          = () => import('../views/bestpractices/ObjectivesView.vue')
const MethodologyView         = () => import('../views/bestpractices/MethodologyView.vue')
const KeyFactorsView          = () => import('../views/bestpractices/KeyFactorsView.vue')
const BenefitsView            = () => import('../views/bestpractices/BenefitsView.vue')
const AdditionalResourcesView = () => import('../views/bestpractices/AdditionalResourcesView.vue')
const ProjectListViewVue      = () => import('../views/project/ProjectListView.vue')

// Admin
const UserListView = () => import ('../views/admin/UserListView.vue');

// Print
const BestPracticePrintView = () => import('../views/bestpractices/BestPracticePrint.vue')
const ProjectPrintView      = () => import('../views/project/ProjectPrint.vue')

const NotFoundView = () => import('../views/NotFoundView.vue');


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
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminView,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'users',
          name: 'users',
          component: UserListView,
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'groups',
          name: 'groups',
          component: UserListView,
          meta: {
            requiresAuth: true
          }
        }
      ]
    },
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/AboutView.vue"),
    // },
    {
      path: '/initiatives',
      name: 'initiatives',
      component: ProjectListViewVue,
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/initiatives/:id',
      name: 'initiative',
      component: ProjectView,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'print',
          name: 'printProject',
          component: ProjectPrintView,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'info',
          name: 'initiative-info',
          component: ProjectRegistrationView,
          meta: {
            requiresAuth: true
          },
          // props: { edit: true }
        }, {
          path: 'aoi',
          name: 'aoi',
          component: ProjectAoi,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'characteristics',
          name: 'initiative-characteristics',
          component: ProjectCharacteristics,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'activities',
          name: 'initiative-activities',
          component: ProjectActivities,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'ecosystems',
          name: 'initiative-ecosystems',
          component: ProjectEcosystems,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'indicators',
          name: 'initiative-indicators',
          component: ProjectIndicators,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'results',
          name: 'initiative-results',
          component: ProjectResults,
          meta: {
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: '/good-practices',
      component: BestPracticeListView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/good-practices/:id',
      component: BestPracticeView,
      name: 'bestPractice',
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'print',
          name: 'printBestPractice',
          component: BestPracticePrintView,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'objectives',
          name: 'objectives',
          component: ObjectivesView,
          meta: {
            requiresAuth: true,
            dataPath: 'objectives'
          }
        }, {
          path: 'methodology',
          name: 'methodology',
          component: MethodologyView,
          meta: {
            requiresAuth: true,
            dataPath: 'methodology'
          }
        }, {
          path: 'key-factors',
          name: 'key-factors',
          component: KeyFactorsView,
          meta: {
            requiresAuth: true,
            dataPath: 'keyFactors'
          }
        }, {
          path: 'benefits',
          name: 'benefits',
          component: BenefitsView,
          meta: {
            requiresAuth: true,
            dataPath: 'benefits'
          }
        }, {
          path: 'additional-resources',
          name: 'additional-resources',
          component: AdditionalResourcesView,
          meta: {
            requiresAuth: true,
            dataPath: 'additionalResources'
          }
        }
      ]
    },

    { path: '/:pathMatch(.*)', component: NotFoundView }
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.path === "/login" && authStore.user) {
    next("/");
    return;
  }

  if (to.matched.some(record => record.meta.requiresAuth) && !authStore.user) {
    authStore.returnUrl = to.fullPath;
    next("/login");
    return;
  }

  next();
});

export default router;

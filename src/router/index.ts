import { useAuthStore } from "../stores/auth"

import { createRouter, createWebHistory } from "vue-router";

// import HomeView from "../views/HomeView.vue";
// import LoginView from "../views/LoginView.vue";
// import ProjectView from "../views/project/ProjectView.vue";
// import ProjectRegistrationView from "../views/project/RegistrationView.vue";
// import ProjectAoi from "../views/project/AoiView.vue";

// import ProjectCharacteristics from "../views/project/CharacteristicsView.vue";
// import ProjectActivities from "../views/project/ActivitiesView.vue";
// import ProjectIndicators from "../views/project/IndicatorsView.vue";
// import ProjectInformation from "../views/project/InformationView.vue";
// import ProjectResults from "../views/project/ResultsView.vue";

// import BestPracticeListView from "../views/bestpractices/BestPracticeListView.vue";
// import BestPracticeView from "../views/bestpractices/BestPracticeView.vue";
// import ObjectivesView from "../views/bestpractices/ObjectivesView.vue";
// import MethodologyView from "../views/bestpractices/MethodologyView.vue";
// import KeyFactorsView from "../views/bestpractices/KeyFactorsView.vue";
// import BenefitsView from "../views/bestpractices/BenefitsView.vue";
// import AdditionalResourcesView from "../views/bestpractices/AdditionalResourcesView.vue";
// import ProjectListViewVue from "../views/project/ProjectListView.vue";

const HomeView = () => import('../views/HomeView.vue')
const LoginView = () => import('../views/LoginView.vue')
const ProjectView = () => import('../views/project/ProjectView.vue')
const ProjectRegistrationView = () => import('../views/project/RegistrationView.vue')
const ProjectAoi = () => import('../views/project/AoiView.vue')

const ProjectCharacteristics = () => import('../views/project/CharacteristicsView.vue')
const ProjectActivities = () => import('../views/project/ActivitiesView.vue')
const ProjectIndicators = () => import('../views/project/IndicatorsView.vue')
const ProjectInformation = () => import('../views/project/InformationView.vue')
const ProjectResults = () => import('../views/project/ResultsView.vue')

const BestPracticeListView = () => import('../views/bestpractices/BestPracticeListView.vue')
const BestPracticeView = () => import('../views/bestpractices/BestPracticeView.vue')
const ObjectivesView = () => import('../views/bestpractices/ObjectivesView.vue')
const MethodologyView = () => import('../views/bestpractices/MethodologyView.vue')
const KeyFactorsView = () => import('../views/bestpractices/KeyFactorsView.vue')
const BenefitsView = () => import('../views/bestpractices/BenefitsView.vue')
const AdditionalResourcesView = () => import('../views/bestpractices/AdditionalResourcesView.vue')
const ProjectListViewVue = () => import('../views/project/ProjectListView.vue')

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
      path: '/initiatives',
      name: 'initiatives',
      component: ProjectListViewVue,
      meta: {
        requiresAuth: true
      }
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
          path: 'info',
          name: 'initiative-info',
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
          path: 'indicators',
          name: 'initiative-indicators',
          component: ProjectIndicators,
          meta: {
            requiresAuth: true
          }
        }, {
          path: 'information',
          name: 'initiative-information',
          component: ProjectInformation,
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
    }
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.path === "/login" && authStore.user) {
    next("/");
    return;
  }

  if (to.matched.some(record => record.meta.requiresAuth)  && !authStore.user) {
    authStore.returnUrl = to.fullPath;
    next("/login");
    return;
  }

  next();
});



export default router;

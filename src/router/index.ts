import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

import ProjectView from "../views/project/ProjectView.vue";
import ProjectOverviewView from "../views/project/OverviewView.vue";
import ProjectAoi from "../views/project/AoiView.vue";
import ProjectCharacteristics from "../views/project/CharacteristicsView.vue";
import ProjectActivities from "../views/project/ActivitiesView.vue";
import ProjectIndicators from "../views/project/IndicatorsView.vue";
import ProjectInformation from "../views/project/InformationView.vue";
import ProjectResults from "../views/project/ResultsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
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
      children: [
        {
          path: 'info',
          name: 'info',
          component: ProjectOverviewView
        }, {
          path: 'aoi',
          name: 'aoi',
          component: ProjectAoi
        }, {
          path: 'characteristics',
          name: 'characteristics',
          component: ProjectCharacteristics
        }, {
          path: 'activities',
          name: 'activities',
          component: ProjectActivities
        }, {
          path: 'indicators',
          name: 'indicators',
          component: ProjectIndicators
        }, {
          path: 'information',
          name: 'information',
          component: ProjectInformation
        }, {
          path: 'results',
          name: 'results',
          component: ProjectResults
        }
      ]
    }
  ],
});

export default router;

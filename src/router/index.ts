import { useAuthStore } from "../stores/auth"
import { useUserPrefsStore } from "../stores/userPreferences"
import { useMenusStore } from "../stores/menus"

import { createRouter, createWebHistory } from "vue-router";


// Initiatives tabs are used both for editing and viewing projects, so define them once here
// Can't set the route name here because they are used twice.
const projectTabs = [{
    path: 'general',
    name: 'projectInfo',
    component: () => import('../views/project/RegistrationView.vue')
}, {
    path: 'area',
    name: 'projectAoi',
    component: () => import('../views/project/AoiView.vue')
}, {
    path: 'characteristics',
    name: 'projectCharacteristics',
    component: () => import('../views/project/characteristics/CharacteristicsView.vue')
}, {
    path: 'activities',
    name: 'projectActivities',
    component: () => import('../views/project/ActivitiesView.vue')
}, {
    path: 'ecosystems',
    name: 'projectEcosystems',
    component: () => import('../views/project/EcosystemsView.vue')
}, {
    path: 'indicators',
    name: 'projectIndicators',
    component: () => import('../views/project/IndicatorsView.vue')
}, {
    path: 'monitoring',
    name: 'projectMonitoring',
    component: () => import('../views/project/MonitoringView.vue')
}, {
    path: 'results',
    name: 'projectResults',
    component: () => import('../views/project/ResultsView.vue')
}];

// Good Practices tabs are used both for editing and viewing projects, so define them once here
const bestPracticeTabs = [{
    path: 'objectives',
    name: 'goodPracticesObjectives',
    component: () => import('../views/bestpractices/ObjectivesView.vue'),
    meta: { dataPath: 'objectives' }
}, {
    path: 'methodology',
    name: 'goodPracticesMethodology',
    component: () => import('../views/bestpractices/MethodologyView.vue'),
    meta: { dataPath: 'methodology' }
}, {
    path: 'key-factors',
    name: 'goodPracticesKeyFactors',
    component: () => import('../views/bestpractices/KeyFactorsView.vue'),
    meta: { dataPath: 'keyFactors' }
}, {
    path: 'benefits',
    name: 'goodPracticesBenefits',
    component: () => import('../views/bestpractices/BenefitsView.vue'),
    meta: { dataPath: 'benefits' }
}, {
    path: 'additional-resources',
    name: 'goodPracticesAdditionalResources',
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
        }, {
            path: "/registration",
            name: "registration",
            component: () => import('../views/UserRegistrationView.vue')
        },

        // Authentication and registration
        {
            path: "/login",
            name: "login",
            component: () => import('../views/LoginView.vue'),
            meta: { public: true }
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
                }, {
                    path: "submittedInitiatives",
                    name: "submittedInitiatives",
                    component: () => import('../views/admin/SubmittedInitiativesView.vue')
                }, {
                    path: "groupAssignments",
                    name: "groupAssignments",
                    component: () => import('../views/admin/GroupAssignmentRequests.vue')
                }, {
                    path: "newGroups",
                    name: "newGroups",
                    component: () => import('../views/admin/NewGroupRequestsView.vue')
                }, {
                    path: "appState",
                    name: "appState",
                    component: () => import('../views/admin/AppState.vue')
                }
            ]
        }, {
            path: '/registry',
            name: 'registry',
            component: () => import('../views/RegistryView.vue'),
            beforeEnter: async (_to, _from) => {
                const menusStore = useMenusStore();
                if (!menusStore.loaded) {
                    await menusStore.fetchMenus();
                }
            },
            redirect: { name: 'initiatives' },
            children: [
                {
                    path: 'newOrganization',
                    name: 'newOrganization',
                    component: () => import('../views/InstitutionAssignmentPage.vue')
                },

                // Initiatives
                {
                    path: 'initiatives',
                    name: 'initiatives',
                    component: () => import('../views/project/ProjectListView.vue'),
                }, {
                    path: 'initiatives/:id/collaborators',
                    name: 'projectCollaborators',
                    component: () => import('../views/project/CollaboratorsView.vue'),  
                }, {
                    path: 'initiatives/:id',
                    component: () => import('../views/project/ProjectView.vue'),
                    children: [
                        {
                            path: '',
                            name: 'initiative',
                            component: () => import('../views/project/ProjectViewView.vue'),
                            redirect: to => ({ name: 'projectInfo', params: { id: to.params.id } }),
                            children: [...projectTabs]
                        }, {
                            path: 'print',
                            name: 'printInitiative',
                            component: () => import('../views/project/ProjectPrintView.vue')
                        }, {
                            path: 'edit',
                            name: 'editInitiative',
                            component: () => import('../views/project/ProjectEditView.vue'),
                            children: projectTabs.map(tab => ({ ...tab, name: `${tab.name}Edit` }))
                        },
                    ]
                },

                // Good Practices
                {
                    path: 'good-practices',
                    component: () => import('../views/bestpractices/BestPracticeListView.vue')
                }, {
                    path: 'good-practices/:projectId/:id',
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
                            children: bestPracticeTabs.map(tab => ({ ...tab, name: `${tab.name}Edit` }))
                        },
                    ]
                }
            ]
        }, {
            path: '/support',
            name: 'support',
            component: () => import('../views/SupportView.vue'),
            meta: { public: true }
        }, {
            path: '/:pathMatch(.*)',
            component: () => import('../views/NotFoundView.vue'),
            meta: { public: true }
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

    // If the user is logged in and filled the registration form and tries to access the registration page, redirect to the registry
    if (authStore.user && to.name === 'registration' && userPrefsStore.userPrefs.registrationData) {
        return { name: 'initiatives' };
    }

    // If the user is logged in but didn't fill the registration form, redirect to registration
    if (authStore.user && to.name !== 'registration' && !userPrefsStore.userPrefs.registrationData) {
        return { name: 'registration' };
    }

    // If the user is logged in and tries to access the login page, redirect to the registry
    if (authStore.user && to.name === 'login') {
        return { name: 'initiatives' };
    }

    // If the user is not logged in and tries to access a page that requires auth, redirect to login
    if (to.matched.some(record => !record.meta.public) && authStore.authLoaded && !authStore.user) {
        authStore.returnUrl = to.fullPath;
        return { name: 'login' };
    }
});

export default router;

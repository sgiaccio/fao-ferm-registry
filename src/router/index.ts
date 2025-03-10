import { createRouter, createWebHistory } from 'vue-router';
import { useLoadingStore } from '../stores/loading';

import { getI18n, t, setLocale, SUPPORT_LOCALES } from '@/lib/i18n';

import { useMenusStore } from '../stores/menus';


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
},
    // {
    //     path: 'preview',
    //     name: 'projectResults',
    //     component: () => import('../views/project/ResultsView.vue')
    // }
];

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

const localesStr = `${SUPPORT_LOCALES.join('|')}`;

const router = createRouter({
    scrollBehavior(to, from, savedPosition) {
        // If this was triggered by browser navigation (Back / Forward), and the browser saved a scroll position, restore it.
        if (savedPosition) {
            return savedPosition
        }

        // If we are only changing locales (i.e., from the same route in a different locale), do NOT scroll — just keep the current scroll position.
        if (from.params.locale !== to.params.locale) {
            return {}
        }

        // If either the old route OR the new route includes a `modal` query param, skip auto-scroll. We assume a modal is open or transitioning.
        if (from.query.modal || to.query.modal) {
            return {}
        }

        // Otherwise, scroll to the top, smoothly.
        return {
            top: 0,
            behavior: 'smooth'
        }
    },
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: `/:locale(${localesStr})?`,
            name: 'home',
            component: () => import('../views/HomeView.vue'),
            meta: { public: true, title: 'FERM Homepage' }
        }, {
            // path: '/:locale?/registration',
            path: `/:locale(${localesStr})?/registration`,
            name: 'registration',
            component: () => import('../views/UserRegistrationView.vue')
        },

        // Authentication and registration
        {
            path: `/:locale(${localesStr})?/login`,
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { public: true }
        },
        {
            path: `/:locale(${localesStr})?/search`,
            name: 'search',
            redirect: { name: 'searchInitiatives' },
            meta: { public: true },
            children: [
                {
                    path: 'initiatives',
                    name: 'searchInitiatives',
                    component: () => import('../views/search/SearchView.vue'),
                    props: { type: 'initiatives' },
                    meta: { public: true }
                }, {
                    // results
                    path: 'initiatives/:id',
                    name: 'publicInitiativePage',
                    beforeEnter: async (_to, _from) => {
                        _loadMenus();
                    },
                    component: () => import('../views/search/project/ProjectView.vue'),
                    meta: { newLayout: true, public: true }
                }, {
                    path: 'good-practices',
                    name: 'searchGoodPractices',
                    component: () => import('../views/search/SearchView.vue'),
                    props: { type: 'goodPractices' },
                    meta: { public: true }
                }, {
                    path: 'good-practices/:id',
                    name: 'publicGoodPracticePage',
                    beforeEnter: async (_to, _from) => {
                        _loadMenus();
                    },
                    component: () => import('../views/search/bestPractice/BestPracticeView.vue'),
                    meta: { public: true }
                }
            ]
        },
        // {
        //     path: '/search/initiatives',
        //     name: 'searchInitiatives',
        //     component: () => import('../views/search/SearchView.vue'),
        //     props: { type: 'initiatives' },
        //     meta: { public: true }
        // },
        // {
        //     path: '/search/goodPractices',
        //     name: 'searchGoodPractices',
        //     component: () => import('../views/search/SearchView.vue'),
        //     props: { type: 'goodPractices' },
        //     meta: { public: true }
        // },
        // Administration
        {
            path: `/:locale(${localesStr})?/admin`,
            name: 'admin',
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
                    path: 'submittedInitiatives',
                    name: 'submittedInitiatives',
                    component: () => import('../views/admin/SubmittedInitiativesView.vue')
                }, {
                    path: 'groupAssignments',
                    name: 'groupAssignments',
                    component: () => import('../views/admin/GroupAssignmentRequests.vue')
                }, {
                    path: 'newGroups',
                    name: 'newGroups',
                    component: () => import('../views/admin/NewGroupRequestsView.vue')
                }, {
                    path: 'appState',
                    name: 'appState',
                    component: () => import('../views/admin/AppState.vue')
                }, {
                    path: 'qc',
                    name: 'qc',
                    component: () => import('../views/admin/QC.vue')
                }
            ]
        }, {
            path: `/:locale(${localesStr})?/registry`,
            name: 'registry',
            component: () => import('../views/RegistryView.vue'),

            beforeEnter: async (_to, _from) => {
                _loadMenus();
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
                }, {
                    path: 'auroraImport/:userKey/:auroraProjectId',
                    name: 'auroraImport',
                    component: () => import('../views/AuroraImport.vue'),
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
            path: `/:locale(${localesStr})?/support`,
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

function setTitle(title: string) {
    document.title = title || t('fermRegistry');
}

router.beforeEach(async (to) => {
    let paramsLocale =
        (to.params.locale as string)?.slice(0, 2).toLowerCase() ||
        navigator.language.slice(0, 2).toLowerCase();

    if (!SUPPORT_LOCALES.includes(paramsLocale)) {
        // get the default locale from i18n
        const defaultLocale = getI18n().global.fallbackLocale.value;
        if (to.name) {
            return { name: to.name, params: { ...to.params, locale: defaultLocale }, query: to.query, hash: to.hash };
        } else {
            // fallback in case the route name is not defined - each route should have a name anyway
            return { name: 'home', params: { locale: defaultLocale }, query: to.query, hash: to.hash };
        }
    }
    await setLocale(paramsLocale);

    setTitle(to.meta?.title as string);

    const loadingStore = useLoadingStore();

    if (to.matched.every(record => record.meta.public)) {
        return;
    }

    // if it's entering the registry page, or a subroute, show a loading screen
    if (to.name === 'registry' || to.matched.some(record => record.name === 'registry')) {
        if (!loadingStore.registryLoaded) {
            loadingStore.setLoading(true);
        }
    }

    const { useAuthStore } = await import('../stores/auth');
    const { useUserPrefsStore } = await import('../stores/userPreferences');

    const authStore = useAuthStore();
    const userPrefsStore = useUserPrefsStore();

    // if the user requested a page that requires auth and the auth store is not loaded, wait for it to load
    if (!authStore.authLoaded) {
        await authStore.fetchUser();
        // if the user is not logged in, redirect to login
        if (!authStore.user) {
            authStore.returnUrl = to.fullPath;
            return { name: 'login' };
        }
    }

    // Fetch the registration data if the user is logged in
    if (authStore.user) {
        if (!userPrefsStore.userPrefs.registrationData) {
            await userPrefsStore.fetchUserPrefs();
        }

        // If the user is logged in and filled the registration form and tries to access the registration page, redirect to the registry
        if (to.name === 'registration' && userPrefsStore.userPrefs.registrationData) {
            return { name: 'initiatives' };
        }

        // If the user is logged in but didn't fill the registration form, redirect to registration
        if (to.name !== 'registration' && !userPrefsStore.userPrefs.registrationData) {
            return { name: 'registration' };
        }

        // If the user is logged in and tries to access the login page, redirect to the registry
        if (to.name === 'login') {
            return { name: 'initiatives' };
        }
    }
    // // If the user is not logged in and tries to access a page that requires auth, redirect to login
    // if (to.matched.some(record => !record.meta.public) && authStore.authLoaded && !authStore.user) {
    //     authStore.returnUrl = to.fullPath;
    //     return { name: 'login' };
    // }
});

router.afterEach((to) => {
    const loadingStore = useLoadingStore();

    // hide the loading screen
    loadingStore.setLoading(false);

    if (to.name === 'registry' || to.matched.some(record => record.name === 'registry')) {
        loadingStore.setRegistryLoaded(true)
    }
});

async function _loadMenus() {
    const menusStore = useMenusStore();
    if (!menusStore.loaded) {
        await menusStore.fetchMenus();
    }
}

export default router;

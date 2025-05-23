import { createRouter, createWebHistory } from 'vue-router';
import { useLoadingStore } from '../stores/loading';

import { getI18n, setLocale, SUPPORT_LOCALES } from '@/lib/i18n';

import { useMenusStore } from '../stores/menus';
import { logEvent } from 'firebase/analytics';

import { analytics } from '@/firebase';

import { getPublicProject } from '@/firebase/functions';

// Initiatives tabs are used both for editing and viewing projects, so define them once here
// Can't set the route name here because they are used twice. Route name is set in the route definition
const projectTabs = [
    {
        path: 'general',
        name: 'projectInfo',
        component: () => import('../views/project/RegistrationView.vue'),
        meta: { title: 'Initiative Information' },
    },
    {
        path: 'area',
        name: 'projectAoi',
        component: () => import('../views/project/AoiView.vue'),
        meta: { title: 'Initiative Area of Interest' },
    },
    {
        path: 'characteristics',
        name: 'projectCharacteristics',
        component: () =>
            import('../views/project/characteristics/CharacteristicsView.vue'),
        meta: { title: 'Initiative Characteristics' },
    },
    {
        path: 'activities',
        name: 'projectActivities',
        component: () => import('../views/project/ActivitiesView.vue'),
        meta: { title: 'Initiative Activities' },
    },
    {
        path: 'ecosystems',
        name: 'projectEcosystems',
        component: () => import('../views/project/EcosystemsView.vue'),
        meta: { title: 'Initiative Ecosystems' },
    },
    {
        path: 'indicators',
        name: 'projectIndicators',
        component: () => import('../views/project/IndicatorsView.vue'),
        meta: { title: 'Initiative Indicators' },
    },
    {
        path: 'monitoring',
        name: 'projectMonitoring',
        component: () => import('../views/project/MonitoringView.vue'),
        meta: { title: 'Initiative Monitoring' },
    },
];

// Good Practices tabs are used both for editing and viewing projects, so define them once here
const bestPracticeTabs = [
    {
        path: 'objectives',
        name: 'goodPracticesObjectives',
        component: () => import('../views/bestpractices/ObjectivesView.vue'),
        meta: { title: 'Good Practice Objectives' },
    },
    {
        path: 'methodology',
        name: 'goodPracticesMethodology',
        component: () => import('../views/bestpractices/MethodologyView.vue'),
        meta: { title: 'Good Practice Methodology' },
    },
    {
        path: 'key-factors',
        name: 'goodPracticesKeyFactors',
        component: () => import('../views/bestpractices/KeyFactorsView.vue'),
        meta: {
            title: 'Good Practice Key Factors, Constraints and Lessons Learned',
        },
    },
    {
        path: 'benefits',
        name: 'goodPracticesBenefits',
        component: () => import('../views/bestpractices/BenefitsView.vue'),
        meta: { title: 'Good Practice Benefits and Validation' },
    },
    {
        path: 'additional-resources',
        name: 'goodPracticesAdditionalResources',
        component: () =>
            import('../views/bestpractices/AdditionalResourcesView.vue'),
        meta: { title: 'Good Practice Additional Resources' },
    },
];

const localesStr = `${SUPPORT_LOCALES.join('|')}`;

const router = createRouter({
    scrollBehavior(to, from, savedPosition) {
        // If this was triggered by browser navigation (Back / Forward), and the browser saved a scroll position, restore it.
        if (savedPosition) {
            return savedPosition;
        }

        // If we are only changing locales (i.e., from the same route in a different locale), do NOT scroll — just keep the current scroll position.
        if (from.params.locale !== to.params.locale) {
            return {};
        }

        // If either the old route OR the new route includes a `modal` query param, skip auto-scroll. We assume a modal is open or transitioning.
        if (from.query.modal || to.query.modal) {
            return {};
        }

        // Otherwise, scroll to the top, smoothly.
        return {
            top: 0,
            behavior: 'smooth',
        };
    },
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: `/:locale(${localesStr})?`,
            name: 'home',
            component: () => import('../views/HomeView.vue'),
            meta: {
                public: true,
                title: 'FERM Homepage',
            },
        },
        {
            path: `/:locale(${localesStr})?/registration`,
            name: 'registration',
            component: () => import('../views/UserRegistrationView.vue'),
            meta: {
                title: 'User Registration',
            },
        },

        // Authentication and registration
        {
            path: `/:locale(${localesStr})?/login`,
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: {
                public: true,
                title: 'Login',
            },
        },
        {
            path: `/:locale(${localesStr})?/search`,
            name: 'search',
            redirect: { name: 'searchInitiatives' },
            meta: {
                public: true,
            },
            children: [
                {
                    path: 'initiatives',
                    name: 'searchInitiatives',
                    component: () => import('../views/search/SearchView.vue'),
                    props: { type: 'initiatives' },
                    meta: {
                        public: true,
                        title: 'Search for Initiatives',
                    },
                },
                {
                    // results
                    path: 'initiatives/:id',
                    name: 'publicInitiativePage',
                    beforeEnter: async (_to, _from) => {
                        _loadMenus();
                    },
                    component: () =>
                        import('../views/search/project/ProjectView.vue'),
                    meta: {
                        newLayout: true,
                        public: true,
                        title: 'Initiative Details',
                    },
                },
                {
                    path: 'good-practices',
                    name: 'searchGoodPractices',
                    component: () => import('../views/search/SearchView.vue'),
                    props: { type: 'goodPractices' },
                    meta: {
                        public: true,
                        title: 'Search for Good Practices',
                    },
                },
                {
                    path: 'good-practices/:id',
                    name: 'publicGoodPracticePage',
                    beforeEnter: async (_to, _from) => {
                        _loadMenus();
                    },
                    component: () =>
                        import(
                            '../views/search/bestPractice/BestPracticeView.vue'
                        ),
                    meta: {
                        public: true,
                        title: 'Good Practice Details',
                    },
                },
            ],
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
            // meta: {
            //     title: 'Admin'
            // },
            children: [
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('../views/admin/UserListView.vue'),
                    meta: {
                        title: 'Administration - Users',
                    },
                },
                {
                    path: 'groups',
                    name: 'groups',
                    component: () => import('../views/admin/GroupListView.vue'),
                    meta: {
                        title: 'Administration - Institutions',
                    },
                },
                {
                    path: 'submittedInitiatives',
                    name: 'submittedInitiatives',
                    component: () =>
                        import('../views/admin/SubmittedInitiativesView.vue'),
                    meta: {
                        title: 'Administration - Submitted Initiatives',
                    },
                },
                {
                    path: 'groupAssignments',
                    name: 'groupAssignments',
                    component: () =>
                        import('../views/admin/GroupAssignmentRequests.vue'),
                    meta: {
                        title: 'Administration - Insitution Assignments requests',
                    },
                },
                {
                    path: 'newGroups',
                    name: 'newGroups',
                    component: () =>
                        import('../views/admin/NewGroupRequestsView.vue'),
                    meta: {
                        title: 'Administration - New Institution requests',
                    },
                },
                {
                    path: 'appState',
                    name: 'appState',
                    component: () => import('../views/admin/AppState.vue'),
                    meta: {
                        title: 'Administration - Application State',
                    },
                },
                {
                    path: 'tools',
                    name: 'tools',
                    component: () => import('../views/admin/Tools.vue'),
                    meta: {
                        title: 'Admininstation - Quality Control',
                    },
                },
            ],
        },
        {
            path: `/:locale(${localesStr})?/registry`,
            name: 'registry',
            component: () => import('../views/RegistryView.vue'),
            // meta: {
            //     title: 'Registry'
            // },

            beforeEnter: async (_to, _from) => {
                _loadMenus();
            },
            redirect: { name: 'initiatives' },

            children: [
                {
                    path: 'newOrganization',
                    name: 'newOrganization',
                    component: () =>
                        import('../views/InstitutionAssignmentPage.vue'),
                    meta: {
                        title: 'Create a New Organization',
                    },
                },

                // Initiatives
                {
                    path: 'initiatives',
                    name: 'initiatives',
                    component: () =>
                        import('../views/project/ProjectListView.vue'),
                    meta: {
                        title: 'Initiatives List',
                    },
                },
                {
                    path: 'initiatives/:id/collaborators',
                    name: 'projectCollaborators',
                    component: () =>
                        import('../views/project/CollaboratorsView.vue'),
                    meta: {
                        title: 'Initiative Collaborators',
                    },
                },
                {
                    path: 'initiatives/:id',
                    component: () => import('../views/project/ProjectView.vue'),
                    children: [
                        {
                            path: '',
                            name: 'initiative',
                            component: () =>
                                import('../views/project/ProjectViewView.vue'),
                            redirect: (to) => ({
                                name: 'projectInfo',
                                params: { id: to.params.id },
                            }),
                            // add 'View' to the title
                            children: projectTabs.map((tab) => ({
                                ...tab,
                                meta: {
                                    ...tab.meta,
                                    title: `${tab.meta.title}`,
                                },
                            })),
                        },
                        {
                            path: 'print',
                            name: 'printInitiative',
                            component: () =>
                                import('../views/project/ProjectPrintView.vue'),
                            meta: {
                                title: 'Print Initiative',
                            },
                        },
                        {
                            path: 'edit',
                            name: 'editInitiative',
                            component: () =>
                                import('../views/project/ProjectEditView.vue'),
                            children: projectTabs.map((tab) => ({
                                ...tab,
                                name: `${tab.name}Edit`,
                                meta: {
                                    ...tab.meta,
                                    title: `${tab.meta.title} Edit`,
                                },
                            })),
                        },
                    ],
                },
                {
                    path: 'auroraImport/:userKey/:auroraProjectId',
                    name: 'auroraImport',
                    component: () => import('../views/AuroraImport.vue'),
                    meta: {
                        title: 'Import Aurora Indicators',
                    },
                },

                // Good Practices
                {
                    path: 'good-practices',
                    component: () =>
                        import(
                            '../views/bestpractices/BestPracticeListView.vue'
                        ),
                    meta: {
                        title: 'Good Practices',
                    },
                },
                {
                    path: 'good-practices/:projectId/:id',
                    component: () =>
                        import('../views/bestpractices/BestPracticeView.vue'),
                    children: [
                        {
                            path: '',
                            name: 'bestPractice',
                            component: () =>
                                import(
                                    '../views/bestpractices/BestPracticeViewView.vue'
                                ),
                            children: bestPracticeTabs.map((tab) => ({
                                ...tab,
                                meta: {
                                    ...tab.meta,
                                    title: `${tab.meta.title}`,
                                },
                            })),
                            meta: {
                                title: 'Good Practice',
                            },
                        },
                        {
                            path: 'print',
                            name: 'printBestPractice',
                            component: () =>
                                import(
                                    '../views/bestpractices/BestPracticePrint.vue'
                                ),
                            meta: {
                                title: 'Print Good Practice',
                            },
                        },
                        {
                            path: 'edit',
                            name: 'editBestPractice',
                            component: () =>
                                import(
                                    '../views/bestpractices/BestPracticeEditView.vue'
                                ),
                            children: bestPracticeTabs.map((tab) => ({
                                ...tab,
                                name: `${tab.name}Edit`,
                                meta: {
                                    ...tab.meta,
                                    title: `${tab.meta.title} Edit`,
                                },
                            })),
                        },
                    ],
                },
            ],
        },
        {
            path: `/:locale(${localesStr})?/support`,
            name: 'support',
            component: () => import('../views/SupportView.vue'),
            meta: {
                public: true,
                title: 'Support',
            },
        },
        {
            path: '/:pathMatch(.*)',
            component: () => import('../views/NotFoundView.vue'),
            meta: {
                public: true,
                title: 'Not Found',
            },
        },
    ],
});

function setTitle(title: string, defaultTitle: string) {
    document.title = title ?? defaultTitle;
}

router.beforeEach(async (to) => {
    let paramsLocale =
        (to.params.locale as string)?.slice(0, 2).toLowerCase() ||
        navigator.language.slice(0, 2).toLowerCase();

    if (!SUPPORT_LOCALES.includes(paramsLocale)) {
        // get the default locale from i18n
        const defaultLocale = getI18n().global.fallbackLocale.value;
        if (to.name) {
            return {
                name: to.name,
                params: { ...to.params, locale: defaultLocale },
                query: to.query,
                hash: to.hash,
            };
        } else {
            // fallback in case the route name is not defined - each route should have a name anyway
            return {
                name: 'home',
                params: { locale: defaultLocale },
                query: to.query,
                hash: to.hash,
            };
        }
    }
    await setLocale(paramsLocale);

    // Set document.title from route meta, fallback to default
    const defaultTitle = 'FERM Registry';
    // if (to.meta && to.meta.title) {
    //     document.title = to.meta.title as string;
    // } else {
    //     document.title = defaultTitle;
    // }

    setTitle(to.meta?.title + ' - ' + defaultTitle, defaultTitle);

    const loadingStore = useLoadingStore();

    if (to.matched.every((record) => record.meta.public)) {
        return;
    }

    // if it's entering the registry page, or a subroute, show a loading screen
    if (
        to.name === 'registry' ||
        to.matched.some((record) => record.name === 'registry')
    ) {
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
        if (
            to.name === 'registration' &&
            userPrefsStore.userPrefs.registrationData
        ) {
            return { name: 'initiatives' };
        }

        // If the user is logged in but didn't fill the registration form, redirect to registration
        if (
            to.name !== 'registration' &&
            !userPrefsStore.userPrefs.registrationData
        ) {
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

let isFirstNavigation = true;
router.afterEach((to) => {
    const loadingStore = useLoadingStore();

    // hide the loading screen
    loadingStore.setLoading(false);

    if (
        to.name === 'registry' ||
        to.matched.some((record) => record.name === 'registry')
    ) {
        loadingStore.setRegistryLoaded(true);
    }

    // Firebase Analytics page_view tracking
    if (isFirstNavigation) {
        // If this is the first navigation, it's automatically tracked by Firebase and we don't need to track it again
        isFirstNavigation = false;
        return;
    }

    // const analytics = getAnalyticsInstance();
    const pageViewEvent = {
        page_path: to.fullPath,
        page_title: document.title,
        page_location: window.location.href,
    };
    if (analytics) {
        logEvent(analytics, 'page_view', pageViewEvent);
    }
});

async function _loadMenus() {
    const menusStore = useMenusStore();
    if (!menusStore.loaded) {
        await menusStore.fetchMenus();
    }
}

export default router;

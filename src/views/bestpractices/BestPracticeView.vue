<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { useRoute } from 'vue-router';

import router from '../../router';

import { useUserPrefsStore } from '@/stores/userPreferences';

import Guidelines from './Guidelines.vue';

const { t } = useI18n();

const route = useRoute();
const userPrefsStore = useUserPrefsStore();

const tabs = [
    {
        name: computed(() => t('goodPractices.objectives.title')),
        path: 'objectives',
    },
    {
        name: computed(() => t('goodPractices.methodology.title')),
        path: 'methodology',
    },
    {
        name: computed(() => t('goodPractices.keyFactors.title')),
        path: 'key-factors',
    },
    {
        name: computed(() => t('goodPractices.benefitsAndValidation.title')),
        path: 'benefits',
    },
    {
        name: computed(() => t('goodPractices.additionalResources.title')),
        path: 'additional-resources',
    },
];

const currentRouteIdx = computed(() =>
    tabs.findIndex((tab) => route.path.endsWith(tab.path)),
);

const firstTab = computed(() => {
    return currentRouteIdx.value === 0;
});

const lastTab = computed(() => {
    return currentRouteIdx.value === tabs.length - 1;
});

function gotoNextTab() {
    if (!lastTab.value) {
        router.push(tabs[currentRouteIdx.value + 1].path);
    }
}

function gotoPreviousTab() {
    if (!firstTab.value) {
        router.push(tabs[currentRouteIdx.value - 1].path);
    }
}

const showGuidelines = ref(false);
const bpConsentAccepted = ref(false);

onMounted(() => {
    const id = route.params.id;
    const projectId = route.params.projectId;
    if (id === 'new') {
        let nextRoute = {
            path: `/registry/good-practices/${projectId}/new/edit/objectives`,
        };
        router.push(nextRoute);
    }

    showGuidelines.value = !userPrefsStore.userPrefs.bpConsentAccepted;
    bpConsentAccepted.value = !!userPrefsStore.userPrefs.bpConsentAccepted;
});

async function closeGuidelines(accepted: boolean) {
    showGuidelines.value = false;
    bpConsentAccepted.value = accepted;
    if (accepted) {
        await userPrefsStore
            .acceptBpConsent()
            .catch((_) => alert('Error in saving consent status'));
    }
}
</script>

<template>
    <!-- Guidelines and feedback links -->
    <Teleport to="#content-specific">
        <div
            class="flex space-x-4 cursor-pointer"
            @click="showGuidelines = true"
        >
            <span
                class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
                {{ t('guidelines.title') }}</span
            >
        </div>
        <div class="flex space-x-4">
            <a
                target="_blank"
                href="https://forms.office.com/Pages/ResponsePage.aspx?id=aMQ6Frir0ESB_dnbFeOvltHYPNSbGydEq11y7AZvREZUMFhUTUNaRlZYQzBYT0xGNVdBUkFET0pXQS4u"
                class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
                {{ t('common.feedback') }}
            </a>
        </div>
    </Teleport>

    <guidelines
        :open="showGuidelines"
        :consentAccepted="bpConsentAccepted"
        @close="closeGuidelines"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <div class="mt-4 md:mt-6 mb-6 md:mb-8">
                <div class="sm:hidden">
                    <label for="tabs" class="sr-only">Select a tab</label>
                    <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
                    <select
                        id="tabs"
                        name="tabs"
                        class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option
                            v-for="tab in tabs"
                            :key="tab.name"
                            :selected="route.path.endsWith(tab.path)"
                        >
                            {{ tab.name }}
                        </option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex" aria-label="Tabs">
                            <router-link
                                v-for="tab in tabs"
                                :key="tab.name"
                                :to="tab.path"
                                :class="[
                                    route.path.endsWith(tab.path)
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium',
                                ]"
                                :aria-current="
                                    route.path.endsWith(tab.path)
                                        ? 'page'
                                        : undefined
                                "
                                >{{ tab.name }}</router-link
                            >
                        </nav>
                    </div>
                </div>
            </div>

            <router-view
                :previous="gotoPreviousTab"
                :next="gotoNextTab"
                :first="firstTab"
                :last="lastTab"
            />
        </div>
    </div>
</template>

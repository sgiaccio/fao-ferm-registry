<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import router from '../../router';

import { useUserPrefsStore } from '../../stores/userPreferences';

import Guidelines from './Guidelines.vue';


const route = useRoute();
const userPrefsStore = useUserPrefsStore()

const tabs = [
    { name: 'Objectives and Context', html: 'Objectives<br>and Context', path: 'objectives' },
    { name: 'Methodology', html: 'Methodology', path: 'methodology' },
    { name: 'Key Factors, Constraints and Lessons Learned', html: 'Key Factors, Constraints<br>and Lessons Learned', path: 'key-factors' },
    { name: 'Benefits and Validation', html: 'Benefits<br>and Validation', path: 'benefits' },
    { name: 'Additional Resources', html: 'Additional Resources', path: 'additional-resources' }
];

const currentRouteIdx = computed(() => tabs.findIndex(tab => route.path.endsWith(tab.path)));

const firstTab = computed(() => {
    return (currentRouteIdx.value === 0);
});

const lastTab = computed(() => {
    return (currentRouteIdx.value === tabs.length - 1);
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
        }
        router.push(nextRoute);
    }

    showGuidelines.value = !userPrefsStore.userPrefs.bpConsentAccepted;
    bpConsentAccepted.value = !!userPrefsStore.userPrefs.bpConsentAccepted;
});

async function closeGuidelines(accepted: boolean) {
    showGuidelines.value = false;
    bpConsentAccepted.value = accepted;
    if (accepted) {
        await userPrefsStore.acceptBpConsent().catch(_ => alert('Error in saving consent status'));
    }
}
</script>

<template>
    <!-- Guidelines and feedback links -->
    <Teleport to="#content-specific">
        <div class="flex space-x-4 cursor-pointer"
             @click="showGuidelines = true">
            <span class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Guidelines</span>
        </div>
        <div class="flex space-x-4">
            <a target="_blank"
               href="https://forms.office.com/Pages/ResponsePage.aspx?id=aMQ6Frir0ESB_dnbFeOvltHYPNSbGydEq11y7AZvREZUMFhUTUNaRlZYQzBYT0xGNVdBUkFET0pXQS4u"
               class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Feedback
            </a>
        </div>
    </Teleport>

    <guidelines :open="showGuidelines"
                :consentAccepted="bpConsentAccepted"
                @close="closeGuidelines" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <!-- Old nav bar -->
            <!-- <div>
                <div class="sm:hidden">
                    <label for="tabs" class="sr-only">Select a tab</label>
                    <!- - Use an "onChange" listener to redirect the user to the selected tab URL. - ->
                    <select id="tabs" name="tabs"
                        class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <option v-for="tab in tabs" :key="tab.name" :selected="route.name === tab.href">{{ tab.name }}
                        </option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex" aria-label="Tabs">
                            <router-link v-for="tab in tabs" :key="tab.name" :to="tab.href"
                                :class="[route.name === tab.href ? 'border-indigo-500  text-indigo-600 dark:text-indigo-100' : 'border-transparent text-gray-500 dark:text-indigo-300 hover:text-gray-700 dark:hover:text-indigo-200 hover:border-gray-300', 'w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm']"
                                :aria-current="route.name === tab.href ? 'page' : undefined">{{
                                    tab.name
                                }}</router-link>
                        </nav>
                    </div>
                </div>
            </div> -->

            <!-- New nav bar -->
            <!-- <nav aria-label="Section">
                <ol role="list"
                    class="mt-4 md:mt-6 mb-6 md:mb-8 divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                    <li v-for="(step, stepIdx) in tabs"
                        :key="step.name"
                        class="relative md:flex md:flex-1">
                        <!- - <a v-if="step.status === 'complete'" :href="step.href" class="group flex w-full items-center">
                        <span class="flex items-center px-6 py-4 text-sm font-medium">
                            <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                            <CheckIcon class="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                            <span class="ml-4 text-sm font-medium text-gray-900">{{ step.name }}</span>
                        </span>
                        </a> - ->
                        <router-link v-if="route.path.endsWith(step.href)"
                                     :to="step.href"
                                     class="flex items-center py-4 text-sm font-medium"
                                     aria-current="step">
                            <!- - <span
                                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                                <span class="text-indigo-600">{{ step.id }}</span>
                            </span> - ->
                            <span class="ml-4 text-sm font-medium text-indigo-600">{{ step.name }}</span>
                        </router-link>

                        <router-link v-else
                                     :to="step.href"
                                     :key="step.name"
                                     class="group flex items-center">
                            <span class="flex items-center py-4 text-sm font-medium">
                                <span class="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{{ step.name }}</span>
                            </span>
                        </router-link>
                        <template v-if="stepIdx !== tabs.length - 1">
                            <!- - Arrow separator for lg screens and up - ->
                            <div class="absolute top-0 right-0 hidden h-full w-5 md:block"
                                 aria-hidden="true">
                                <svg class="h-full w-full text-gray-300"
                                     viewBox="0 0 22 80"
                                     fill="none"
                                     preserveAspectRatio="none">
                                    <path d="M0 -2L20 40L0 82"
                                          vector-effect="non-scaling-stroke"
                                          stroke="currentcolor"
                                          stroke-linejoin="round" />
                                </svg>
                            </div>
                        </template>
                    </li>
                </ol>
            </nav> -->

            <div class="mt-4 md:mt-6 mb-6 md:mb-8">
                <div class="sm:hidden">
                    <label for="tabs"
                           class="sr-only">Select a tab</label>
                    <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
                    <select id="tabs"
                            name="tabs"
                            class="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <option v-for="tab in tabs"
                                :key="tab.name"
                                :selected="route.path.endsWith(tab.path)">{{ tab.name }}</option>
                    </select>
                </div>
                <div class="hidden sm:block">
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex"
                             aria-label="Tabs">
                            <router-link v-for="tab in tabs"
                                         :key="tab.name"
                                         :to="tab.path"
                                         :class="[route.path.endsWith(tab.path) ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium']"
                                         :aria-current="route.path.endsWith(tab.path) ? 'page' : undefined">{{ tab.name }}</router-link>
                        </nav>
                    </div>
                </div>
            </div>

            <router-view :previous="gotoPreviousTab" :next="gotoNextTab" :first="firstTab" :last="lastTab"/>

            <!-- <button class="absolute left-0 border hover:text-amber-800 text-amber-500 dark:text-amber-900 font-semibold border-gray-300 dark:border-gray-900 bg-gray-200 dark:bg-gray-800 rounded py-2 px-3 transition ease-in-out duration-270 delay-50"
                    @click="toggleJson">JSON</button>
            <pre v-if="showJson"
                 class="mb-10 text-xs font-medium text-amber-700 dark:text-amber-600 top-20">{{ JSON.stringify(store.bestPractice, null, 2) }}</pre> -->
        </div>
    </div>
</template>

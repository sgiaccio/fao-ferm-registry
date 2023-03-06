<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

import router from '../../router';

import { useBestPracticesStore } from '../../stores/bestpractices';
import { useUserPrefsStore } from '../../stores/userPreferences';

import Guidelines from './Guidelines.vue';

import { validate } from "../../validators/validate-bestpractice";

console.log(validate);
const route = useRoute();
const store = useBestPracticesStore();
const userPrefsStore = useUserPrefsStore()

const canSubmit = ref<boolean>()

const currentRouteIdx = computed(() => tabs.findIndex(tab => tab.href === route.name));

const lastTab = computed(() => {
    return (currentRouteIdx.value === tabs.length - 1);
});

const tabs = [
    { name: 'Objectives and Context', html: 'Objectives<br>and Context', href: 'objectives' },
    { name: 'Methodology', html: 'Methodology', href: 'methodology' },
    { name: 'Key Factors, Constraints and Lessons Learned', html: 'Key Factors, Constraints<br>and Lessons Learned', href: 'key-factors' },
    { name: 'Benefits and Validation', html: 'Benefits<br>and Validation', href: 'benefits' },
    { name: 'Additional Resources', html: 'Additional Resources', href: 'additional-resources' }
];

onBeforeMount(async () => {
    if (route.params.id === 'new') {
        if (!route.query.projectId) throw Error('Didn\'t get project id in request query');
        store.createEmpty(route.query.projectId as string);
    } else {
        await store.fetch(route.params.id as string);
    }
    canSubmit.value = await store.canSetStatus('submitted');
});


const showGuidelines = ref(false);
const bpConsentAccepted = ref(false);

// onMounted(async () => {
//     const id = route.params.id;
//     let nextRoute = { name: 'objectives', params: { id } }
//     if (id === 'new') {
//         nextRoute = { ...nextRoute, query: { projectId: route.query.projectId } }
//     }
//     router.push(nextRoute);

//     showGuidelines.value = !userPrefsStore.userPrefs.bpConsentAccepted;
//     bpConsentAccepted.value = !!userPrefsStore.userPrefs.bpConsentAccepted;
// });

onMounted(() => {
    const id = route.params.id;
    if (id === 'new') {
        let nextRoute = {
            name: 'objectives',
            params: { id },
            query: { projectId: route.query.projectId }
        }
        router.push(nextRoute);
    }

    showGuidelines.value = !userPrefsStore.userPrefs.bpConsentAccepted;
    bpConsentAccepted.value = !!userPrefsStore.userPrefs.bpConsentAccepted;
});

async function saveAndExit() {
    await store.saveAndExit();
    router.push({ name: 'initiatives' });
}

async function saveAndNext() {
    await store.save();

    if (lastTab.value) {
        router.push({ name: 'initiatives' });
    } else {
        router.push(tabs[currentRouteIdx.value + 1].href);
    }
}

function cancel() {
    if (confirm("Are you sure you want to cancel? You will loose the changes you made.")) {
        store.resetBestPracticeState();
        router.push({ name: 'initiatives' });
    }
}

async function submit() {
    if (confirm("Are you sure you want submit this Good Practice?")) {
        try {
            await store.submit(store.id!);
        } catch (e) {
            alert(`Error updating status: ${e}`)
        }
        router.push({ name: 'initiatives' });
    }
}

const showJson = ref(false)
function toggleJson() {
    showJson.value = !showJson.value;
}

async function closeGuidelines(accepted: boolean) {
    showGuidelines.value = false;
    bpConsentAccepted.value = accepted;
    if (accepted) {
        await userPrefsStore.acceptBpConsent().catch(_ => alert('Error in saving consent status'));
    }
}

function print() {
    const routeData = router.resolve({ name: 'printBestPractice' });
    window.open(routeData.href, '_blank');
}
</script>

<template>
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

            <nav aria-label="Section">
                <ol role="list"
                    class="mt-4 md:mt-6 divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                    <li v-for="(step, stepIdx) in tabs"
                        :key="step.name"
                        class="relative md:flex md:flex-1">
                        <!-- <a v-if="step.status === 'complete'" :href="step.href" class="group flex w-full items-center">
                        <span class="flex items-center px-6 py-4 text-sm font-medium">
                            <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                            <CheckIcon class="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                            <span class="ml-4 text-sm font-medium text-gray-900">{{ step.name }}</span>
                        </span>
                        </a> -->
                        <router-link v-if="route.name === step.href"
                                     :to="step.href"
                                     class="flex items-center py-4 text-sm font-medium"
                                     aria-current="step">
                            <!-- <span
                                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                                <span class="text-indigo-600">{{ step.id }}</span>
                            </span> -->
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
                            <!-- Arrow separator for lg screens and up -->
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
            </nav>

            <!-- TODO, important -->
            <router-view v-slot="{ Component, route }"
                         v-if="store.bestPractice">
                <keep-alive include="BestPracticeObjectivesView">
                    <component :is="Component"
                               :key="route.path" />
                </keep-alive>
            </router-view>

            <div class="w-full mb-8 flex gap-x-6">
                <div class="shrink">
                    <button @click="saveAndExit"
                            type="button"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Save and exit
                    </button>
                </div>
                <div v-if="!lastTab"
                     class="shrink">
                    <button @click="saveAndNext"
                            type="button"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Save and next
                    </button>
                </div>
                <div class="shrink">
                    <button @click="cancel"
                            type="button"
                            class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Cancel
                    </button>
                </div>
                <div class="grow relative flex flex-row">
                    <div class="grow"></div>
                    <button v-if="canSubmit"
                            @click="submit"
                            type="button"
                            class="shrink inline-flex items-center rounded-full border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                        Submit for review
                    </button>
                    <button @click="print"
                            type="button"
                            class="ml-6 shrink inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Print
                    </button>
                </div>
            </div>
            ================================
            <button class="absolute left-0 border hover:text-amber-800 text-amber-500 dark:text-amber-900 font-semibold border-gray-300 dark:border-gray-900 bg-gray-200 dark:bg-gray-800 rounded py-2 px-3 transition ease-in-out duration-270 delay-50"
                    @click="toggleJson">JSON</button>
            <pre v-if="showJson"
                 class="text-xs font-medium text-amber-700 dark:text-amber-600 top-20">{{ JSON.stringify(store.bestPractice, null, 2) }}</pre>
        </div>
    </div>
</template>

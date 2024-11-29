<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';

import ResultPanel from './ResultPanel.vue';


const props = defineProps<{
    projectId: string
}>();

const bestPracticesTitles = ref([]);
const bestPracticesIds = ref([]);

const loading = ref(true);
const loadError = ref(false);

function checkResourceWithIframe(url: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.display = 'none'; // Hide the iframe
        document.body.appendChild(iframe);

        // Handle successful load
        iframe.onload = () => {
            resolve(true); // Resource exists
            document.body.removeChild(iframe);
        };

        // Handle loading error
        iframe.onerror = () => {
            resolve(false); // Resource does not exist
            document.body.removeChild(iframe);
        };
    });
}

onBeforeMount(async () => {
    if (!props.projectId) return;

    // fetch data from this URL https://data.apps.fao.org/fao-ferm/initiative/<projectId>
    try {
        const response = await fetch(`https://data.apps.fao.org/fao-ferm/initiative/${props.projectId}`);
        const data = await response.json();

        const allIds = data.best_practices_ids;
        const allTitles = data.best_practices_titles;

        // for each id, fetch the practice and add it to the list if it's available (returns 200). This is a workaround to filter out practices that are not available. Will improve later
        const filteredIds_ = await Promise.all(allIds.map(async (id: string) => {
            const url = `https://ferm-search.fao.org/practices/${id}`;
            return await checkResourceWithIframe(url) ? id : null;
        }));

        // now remove the null values from filteredIds and also remove the corresponding titles
        const filteredTitles = allTitles.filter((title: string, i: number) => filteredIds_[i] !== null);
        const filteredIds = filteredIds_.filter((id: string | null) => id !== null);


        bestPracticesTitles.value = filteredTitles;
        bestPracticesIds.value = filteredIds;
    } catch (error) {
        loadError.value = true;
        console.error(error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <ResultPanel title="Good Practices">
        <div
            v-if="loading"
            class="italic text-gray-500"
        >Loading good practices...</div>
        <div
            v-else-if="loadError"
            class="italic text-gray-500"
        >Error loading good practices</div>
        <div
            v-else-if="bestPracticesTitles.length === 0"
            class="italic text-gray-500"
        >No good practices available for this project</div>
        <div
            v-else
            v-for="(title, i) in bestPracticesTitles"
            :key="title"
            :class="i === bestPracticesTitles.length - 1 ? '' : 'mb-2'"
        >
            <a
                :href="`https://ferm-search.fao.org/practices/${bestPracticesIds[i]}`"
                target="_blank"
                class="text-blue-700 hover:underline"
            >
                {{ title }}
            </a>
        </div>
    </ResultPanel>
</template>
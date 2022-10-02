<script setup lang="ts">
import { ref } from 'vue';

import { useProjectStore } from '../../../stores/project'

import MapInput from './MapInput.vue'


const props = defineProps<{
  modelValue: {
    siteName: string,
    uuid: string,
    activities: number[]
  }
}>()

const emit = defineEmits(['update:modelValue']);

const projectStore = useProjectStore();

const selectedFile = ref<File | null>(null);
const uploadStatus = ref('idle');

function setSelectedFile(event: Event) {
    selectedFile.value = (event.target as HTMLInputElement).files![0];
}

async function uploadFile() {
    if (!selectedFile.value) return;
    if (uploadStatus.value !== 'idle') return;

    uploadStatus.value = 'uploading';

    const formData = new FormData();
    formData.append('project_id', projectStore.id!);
    formData.append('file', selectedFile.value, selectedFile.value.name);

    return fetch(
        'https://europe-west3-fao-ferm.cloudfunctions.net/load_shapefile',
        {
            method: 'POST',
            headers: {
                // 'Authorization': `Bearer ${authStore.user.accessToken}`,
                // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: formData
        }).then(
            response => response.text()
        ).then(uuid => {
            alert(`File uploaded with uuid ${uuid}`);
            uploadStatus.value = 'uploaded'
            emit('update:modelValue', { ...props.modelValue, uuid: uuid });
        }).catch(error => {
            alert('Error uploading the Shapefile');
            uploadStatus.value = 'idle';
        }).finally(() => {
            uploadStatus.value = 'idle';
            // TODO reset input
        });
}

  
</script>

<template>
<div v-if="!modelValue.uuid">
    <label for="file" class="block text-sm font-medium text-gray-700" />
    <div class="mt-1 flex rounded-md shadow-sm">
        <div class="flex-grow focus-within:z-10">
            <input
                type="file"
                name="file"
                class="pl-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                @change="setSelectedFile">
        </div>
        <button
                type="button"
                class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md bg-gray-50 focus:outline-none"
                :class="[uploadStatus === 'idle' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 cursor-default']"
                @click="uploadFile()">
                <svg xmlns="http://www.w3.org/2000/svg"
                     class="h-5 w-5 text-gray-400" :class="[ selectedFile ? 'animate-bounce' : '' ]"
                     viewBox="0 0 20 20"
                    fill="currentColor"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd">
                    <path
                        fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"></path>
            </svg>
        </button>
    </div>
    <div v-if="selectedFile" class="text-red-500 text-sm">Remember to click the upload button before saving.</div>
</div>
<div v-else>
    <MapInput :model-value="props.modelValue"></MapInput>
</div>
</template>


<!-- 
[:div
[:label {:for "file", :class "block text-sm font-medium text-gray-700"} ""]
(if @data
  (when @geojson
    [map-view (clj->js @geojson)])

  [:<>
   [:div {:class "mt-1 flex rounded-md shadow-sm"}

    [:div {:class "flex-grow focus-within:z-10"}
     [:input {:ref #(reset! input-ref %)
              :type "file"
              :name "file"
              :class "pl-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
              :placeholder placeholder}]]
    [:button {
              :type "button"
              :class (str "-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border "
                          "border-gray-300 text-sm font-medium rounded-r-md bg-gray-50 focus:outline-none "
                          (if @upload-active "text-gray-700 hover:bg-gray-100" "text-gray-200 cursor-default"))}
     [:svg {:xmlns "http://www.w3.org/2000/svg", :class "h-5 w-5 text-gray-400", :viewBox "0 0 20 20", :fill "currentColor"}
      [:path {:fill-rule "evenodd", :d "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z", :clip-rule "evenodd"}]]
     [:span (if @upload-active "Upload" "Uploading")]]]
   [:div {:class "mt-2 text-sm text-gray-500"}
    [:p "Please upload a zip file containing all the shapefile files (.shp, .shx, .dbf, ...)."]
    [:p {:class "mt-2"} [:span {:class "text-red-600 font-bold"} "Important: "] "Please remember to save the changes at the end of this session or the shapefiles will be lost"]]])])) -->

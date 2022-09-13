<script setup lang="ts">
import { ref } from 'vue'

import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import SelectFormGroup from "../../components/inputs/base/SelectFormGroup.vue";

import * as menus from "../../components/project/menus";


type AdditionalResources = {
    links?: string,
    details?: string,
}

const data = ref<AdditionalResources> ({});

const yesNo = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 }
]
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300">Benefits and validation</h1>
        <div class="divide-y divide-stone-900">
            <TextareaFormGroup
                v-model="data.links"
                label="Links"
                description="Please provide links to pictures, positive testimonials from the field, websites, and social media pages (Facebook, YouTube, Instagram etc.) related to the implementation and impacts of the good practice." />
            <SelectFormGroup
                v-model="data.details"
                :options="yesNo"
                label="Details"
                :required="true"
                description="Are you interested in providing more details regarding the cost and benefits of the good practice? If so, you will be contacted by the FAO´s team on Economics of Ecosystem Restoration (TEER)." />
        </div>
    </div>
    <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre>
</template>

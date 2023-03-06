<script setup lang="ts">
import { useBestPracticesStore } from '../../stores/bestpractices';

import TextareaFormGroup from "../../components/inputs/base/TextareaFormGroup.vue";
import SelectFormGroup from "../../components/inputs/base/SelectFormGroup.vue";
import ImageUploadFormGroup from "../../components/inputs/base/ImageUploadFormGroup.vue";


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

// type AdditionalResources = {
//     links?: string,
//     details?: string,
// }

const store = useBestPracticesStore();

const yesNo = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 }
]
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-4xl dark:text-zinc-300 font-roboto-slab">Additional Resources</h1>
        <div v-if="store.bestPractice" class="divide-y divide-stone-300 dark:divide-stone-900">
            <TextareaFormGroup
                v-model="store.bestPractice.links"
                label="5.1 Links"
                description="Please provide links to pictures, scientific articles and publications, positive testimonials from the field, websites, and social media pages (Facebook, YouTube, Instagram etc.) related to the implementation and impacts of the good practice."
                :edit=edit />
            <SelectFormGroup
                v-model="store.bestPractice.details"
                :options="yesNo"
                label="5.2 Additional information on costs and benefits"
                :required="true"
                description="Are you interested in providing more details regarding the cost and benefits of the good practice? If so, you will be contacted by the FAO's Team on Economics of Ecosystem Restoration (TEER)."
                :edit=edit />
            <TextareaFormGroup
                v-model="store.bestPractice.additionalComments"
                label="5.3 Additional comments"
                description="Feel free to share any additional information regarding the practice."
                :edit=edit />
            <ImageUploadFormGroup
                label="5.4 Please upload a picture of the practice"
                bucket-url="gs://fao-ferm-goodpractices"
                :folder="`${store.id}/images/`"
                :edit=edit />
        </div>
    </div>
    <!-- <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre> -->
</template>

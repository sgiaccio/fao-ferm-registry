<script setup lang="ts">
import { useBestPracticesStore } from '../../stores/bestpractices';

import TabTemplate from "../TabTemplate.vue"

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
    <TabTemplate title="Additional Resources">
        <template #default>
            <template v-if="store.bestPractice">
                <TextareaFormGroup v-model="store.bestPractice.links"
                                   label="5.1 Links"
                                   description="Please provide links to pictures, testimonials or references from local stakeholders, videos, scientific articles and publications, outreach materials, websites and/or social media pages (Facebook, YouTube, Instagram etc.) related to the implementation and impacts of the good practice."
                                   :edit="edit" />
                <SelectFormGroup v-model="store.bestPractice.details"
                                 :options="yesNo"
                                 label="5.2 Additional information on costs and benefits"
                                 :required="true"
                                 description="Are you interested in providing more details regarding the cost and benefits of the good practice? If so, you will be contacted by the FAO's Team on Economics of Ecosystem Restoration (TEER)."
                                 :edit="edit" />
                <TextareaFormGroup v-model="store.bestPractice.additionalComments"
                                   label="5.3 Additional comments"
                                   description="Feel free to share any additional information regarding the practice."
                                   :edit="edit" />
                <ImageUploadFormGroup label="5.4 Please upload a picture of the practice"
                                      bucket-url="gs://fao-ferm-goodpractices"
                                      :folder="`${store.id}/images/`"
                                      :edit="edit" />
            </template>
        </template>
    </TabTemplate>
</template>

<script setup lang="ts">
import { useBestPracticesStore } from '@/stores/bestpractices';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from "../TabTemplate.vue"

import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
import MultiInputFormGroup from "@/components/inputs/MultiInputFormGroup.vue";
import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue";
import Constraint from "@/components/inputs/Constraint.vue"

// import { keyFactors } from "../../components/project/menus";


// type KeyFactors = {
//     keyFactors?: number[],
//     specifyKeyFactors?: string,
//     constraints?: {
//         constraint?: string,
//         addressing?: string,
//     }[],
//     lessonsLearned?: string,
// }

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useBestPracticesStore();
const menus = useMenusStore().menus;

const constraintsComponents = {
    constraint: {
        component: Constraint,
        newData: {},
        addItemLabel: "Add constraint",
    }
}

</script>

<template>
    <TabTemplate title="Key factors, constraints and lessons learned">
        <template #default>
            <template v-if="store.bestPractice">
                <div>
                    <MultiSelectFormGroup :options="menus.keyFactors"
                                          v-model="store.bestPractice.keyFactors"
                                          label="3.1 Key factors"
                                          description="What are the key factors that need to be in place for the successful implementation of the practice."
                                          :required="true"
                                          :edit=edit />
                    <TextareaFormGroup label="3.2 Key factors additional information"
                                       v-model="store.bestPractice.specifyKeyFactors"
                                       description="Please provide additional information on the key factors required for the successful implementation of the practice."
                                       :edit=edit />
                </div>
                <MultiInputFormGroup label="3.3 Constraints"
                                     description="What are the technical, economic, social and environmental challenges, constraints and/or risks encountered in applying the practice? How were they addressed?"
                                     :inputComponents="constraintsComponents"
                                     v-model="store.bestPractice.constraints"
                                     :edit=edit />
                <TextareaFormGroup v-model="store.bestPractice.lessonsLearned"
                                   label="3.4 Lessons learned/Recommendations"
                                   :required="true"
                                   description="What lessons learned/recommendations would you like to share with other practitioners intending to replicate, adapt or scale up this practice?"
                                   :edit=edit />
            </template>
        </template>
    </TabTemplate>
    <!-- <pre class="text-white">{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>

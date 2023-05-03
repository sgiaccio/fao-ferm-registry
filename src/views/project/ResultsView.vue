<script setup lang="ts">

import { useProjectStore } from '../../stores/project';

import TabTemplate from "../TabTemplate.vue"

// import SelectFormGroup from "@/components/inputs/base/SelectFormGroup.vue";

// import { achieved, achievingTargets } from "../../components/project/menus";


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

// const store = useProjectStore();
</script>
      

      
<template>


    <TabTemplate title="Results">
        <!-- <template #description>
            <p>Results are calculated for selected indicators in each area of interests. The indicator calculation is based on available global layers and cloud computing environment such as SEPAL. The standard operating procedure to assess ecosystem restoration indicators is under preparation.</p>
        </template> -->
        <template #default>
            <div class="font-semibold pt-10 pb-20 text-3xl text-center">Under development</div>
            <!-- <SelectFormGroup :edit="edit"
                             :options="achieved"
                             v-model="store.project.results.achieved"
                             label="Achievements"
                             description="Were the restoration objectives achieved?" />

            <SelectFormGroup :edit="edit"
                             :options="achievingTargets"
                             v-model="store.project.results.achievingTargets"
                             label="Results achieved based on targets" /> -->

        </template>
    </TabTemplate>
</template>

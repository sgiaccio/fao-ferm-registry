<script setup lang="ts">
import { ref } from 'vue'

import TextFormGroup from "../inputs/base/TextFormGroup.vue";
import DateFormGroup from "../inputs/base/DateFormGroup.vue";
import TextareaFormGroup from "../inputs/base/TextareaFormGroup.vue";
import PointsOfContact from "../inputs/pointsOfContact/PointsOfContact.vue"
import KeywordsInputGroup from "../inputs/KeywordsInputGroup.vue"
import MultiSelectFormGroup from "../inputs/base/MultiSelectFormGroup.vue"
import AreaFormGroup from "../inputs/AreaFormGroup.vue"
import Organizations from "../inputs/organizations/Organizations.vue"

import { objectives } from "./menus";

// import { h } from 'vue'

const data = ref({
    keywords: ["keyword1"],
    uuid: "c4e57e20-c61f-4950-8265-43640cf1b4fe",
    reportingProcess: "ferm",
    startingDate: "2022-08-23",
    topicCategories: [
      {
        topicCategory: "Inland waters"
      }
    ],
    pointsOfContact: [
      {
        poc: {
          email: "asdf",
          organization: "asdf",
          individualName: "asdf",
          // address: null
        }
      }
    ],
    objectives: [1],
    endingDate: "2022-08-21",
    description: "description",
    title: "test admin",
    website: "website.com",
    testSelect: 1,
    targetArea: { value: 10, units: "ha" },
    organizations: []
  },
  // updateTime: {
  //   seconds: 1659502327,
  //   nanoseconds: 151000000
  // },
  // createTime: {
  //   seconds: 1651849897,
  //   nanoseconds: 160000000
  // },
  // group: "fMBz8DktwRHxLjVgMSpg"
)

// export default defineComponent({
//   setup() {
    
//   },
// })

// const DynamicHeading = (props, context) => {
//   return h(`h${props.level}`, context.attrs, context.slots)
// }

// DynamicHeading.props = ['level']


</script>


<template>
  <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
    <h1 class="text-3xl dark:text-zinc-300">Initiative Registration</h1>
    <p class="dark:text-zinc-200">In this tab, basic information about your initiative is needed. The title and a summary of the aims and expected results of the initiative can be provided in the description section. You also need to provide further information such as when the initiative is expected to start and end, sources of funding and responsible organisms.</p>
    <div class="my-6 font-bold dark:text-zinc-300">uuid:
      <span class="font-mono">{{data.uuid}}</span>
    </div>

    <div class="divide-y divide-stone-900">
      <TextFormGroup
          v-model="data.title"
          label="Title"
          description="Title of the initiative/project as stated in the official project document">
      </TextFormGroup>
      <TextareaFormGroup
          v-model="data.description"
          label="Description"
          description="Short description of the initiative/project (max xx characters)"></TextareaFormGroup>
      <TextFormGroup
          v-model="data.website"
          label="Website"
          description="Website of the project"
          placeholder="www.example.com">
      </TextFormGroup>
      <AreaFormGroup
          label="Target area"
          v-model="data.targetArea"
          description="Area of the restoration target"></AreaFormGroup>
      <DateFormGroup
          v-model="data.startingDate"
          label="Starting date"
          description="Date when the initiative started"></DateFormGroup>
      <DateFormGroup
          v-model="data.endingDate"
          label="Ending date"
          description="Date when the initiative finished or is expected to finish"></DateFormGroup>
      <TextFormGroup
          v-model="data.document"
          label="Document"
          description="Upload one project document (xx formats accepted, max xx MB)">
      </TextFormGroup> <!-- TODO -->
      <!-- <TextareaFormGroup
          v-model="data.purpose"
          label="Initiative Objectives"
          description="Summary of the intentions with which the resource(s) was developed"></TextareaFormGroup> -->
      <MultiSelectFormGroup
          :options="objectives"
          v-model="data.objectives"
          label="Objectives"
          description="Objectives of the initiatives"></MultiSelectFormGroup>
      <PointsOfContact
          v-model="data.pointsOfContact"></PointsOfContact>
      <KeywordsInputGroup 
        v-model="data.keywords"
        label="Keywords">
      </KeywordsInputGroup>
      <Organizations
          v-model="data.organizations"></Organizations>
      <!-- <SelectFormGroup :options="objectives"
                      v-model="data.objectives"
                      label="Objectives"
                      description="Objectives of the initiatives"></SelectFormGroup> -->
    </div>
  </div>

  <!-- <DynamicHeading level=2>asdf</DynamicHeading> -->
  <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre>
  <!-- <MultiInput :inputComponents="multiInputComponents"
              v-model="mi"></MultiInput>
  <br>
  <br>
  <MultiInputFormGroup label="Same content"
                       :inputComponents="multiInputComponents"
                       v-model="mi"></MultiInputFormGroup>
  <br> -->
  <!-- <TextFormGroup v-model="ttt" label="asdf" description="tet"></TextFormGroup>
  <br>
  <DateFormGroup v-model="ddd" label="qwer" dangerousHtmlDescription="<b>test!!!</b>"></DateFormGroup>
  <br>
  <TextareaFormGroup v-model="ta" label="qwer" dangerousHtmlDescription="<b>TEXTAREA</b>"></TextareaFormGroup>
  <br> -->
  
  <!-- <span class="text-white">data.testSelect = {{data.testSelect}}</span>
  <SelectFormGroup :options="[{value: 1, label: 'a'}, {value: 2, label: 'b'}]"
                   v-model="data.testSelect"
                   label="Select"
                   description="Test"></SelectFormGroup> -->
  <!-- <div class="greetings">
    <h1 class="green">Info</h1>
    <h3>
      You’ve successfully created a project with
      <a target="_blank" href="https://vitejs.dev/">Vite</a> +
      <a target="_blank" href="https://vuejs.org/">Vue 3</a>. What's next?
    </h3>
  </div> -->
</template>

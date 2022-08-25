<script setup lang="ts">
// import { defineComponent } from '@vue/composition-api'
import TextInput from "../inputs/base/TextInput.vue";
import TextFormGroup from "../inputs/base/TextFormGroup.vue";
import DateFormGroup from "../inputs/base/DateFormGroup.vue";
import TextareaFormGroup from "../inputs/base/TextareaFormGroup.vue";
import SelectFormGroup from "../inputs/base/SelectFormGroup.vue";
import MultiInput from "../inputs/MultiInput.vue";
import MultiInputFormGroup from "../inputs/MultiInputFormGroup.vue";
import PointsOfContact from "../inputs/pointsOfContact/PointsOfContact.vue"
import KeywordsInput from "../inputs/KeywordsInput.vue"
import { ref } from 'vue'


// import { h } from 'vue'

const data = ref({
    keywords: [
      {
        keywordGroup: {
          type: "stratum",
          keywords: [
            {
              keyword: "sdf"
            }
          ]
        }
      },
      {
        keywordGroup: {
          keywords: [
            {
              keyword: "wwer"
            },
            {
              keyword: "wrwer"
            }
          ],
          type: "place"
        }
      }
    ],
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
          role: "author",
          organization: "asdf",
          individualName: "asdf",
          // address: null
        }
      }
    ],
    purpose: "objectives",
    endingDate: "2022-08-21",
    description: "description",
    title: "test admin"
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

const ttt = ref('Hello from parent')
const ddd = ref('2022-08-03')
const ta = ref('')
const s = ref(null)
const mi = ref([{ keyword: 'this is a text field in an MultiInput' },
                { stucazz: '' }])
const multiInputComponents = {
    keyword: {
        component: TextInput,
        props: { placeholder: "Please write some text" },
        newData: "",
        addItemLabel: "text",
    },
    stucazz: {
        component: DateFormGroup,
        props: { label: "date" },
        newData: "",
        addItemLabel: "date",
    }
}

// const DynamicHeading = (props, context) => {
//   return h(`h${props.level}`, context.attrs, context.slots)
// }

// DynamicHeading.props = ['level']


</script>


<template>
  <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
    <h1 class="text-3xl dark:text-white">Project Registration</h1>
    <p class="dark:text-white">In this tab, basic information about your project is needed. The title and a summary of the aims and expected results of the project can be provided in the description section. You also need to provide further information such as when the project is expected to start and end, sources of funding and responsible organisms.</p>
    <div class="my-6 font-bold dark:text-white">uuid:
      <span class="font-mono">{{data.uuid}}</span>
    </div>

    <div class="divide-y divide-purple-800">
      <TextFormGroup
          v-model="data.title"
          label="Title"
          description="Provide the title of your project as it is stated in the official project document">
      </TextFormGroup>
      <TextareaFormGroup
          v-model="data.description"
          label="Description"
          description="Describe briefly the main objective(s) and activity of your project (maximum 4 lines)"></TextareaFormGroup>
      <DateFormGroup
          v-model="data.startingDate"
          label="Starting date"
          description="Date when the project started"></DateFormGroup>
      <DateFormGroup
          v-model="data.endingDate"
          label="Ending date"
          description="Date when the project finished"></DateFormGroup>
      <TextFormGroup
          v-model="data.document"
          label="Document">
      </TextFormGroup> <!-- TODO -->
      <TextareaFormGroup
          v-model="data.purpose"
          label="Project Objectives"
          description="Summary of the intentions with which the resource(s) was developed"></TextareaFormGroup>
      <PointsOfContact
          v-model="data.pointsOfContact"></PointsOfContact>
      <KeywordsInput></KeywordsInput>
    </div>
  </div>

  <!-- <DynamicHeading level=2>asdf</DynamicHeading> -->
  <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre>
  <MultiInput :inputComponents="multiInputComponents"
              v-model="mi"></MultiInput>
  <br>
  <br>
  <MultiInputFormGroup label="Same content"
                       :inputComponents="multiInputComponents"
                       v-model="mi"></MultiInputFormGroup>
  <br>
  <!-- <TextFormGroup v-model="ttt" label="asdf" description="Stocazzo"></TextFormGroup>
  <br>
  <DateFormGroup v-model="ddd" label="qwer" dangerousHtmlDescription="<b>STOCAZZO!!!</b>"></DateFormGroup>
  <br>
  <TextareaFormGroup v-model="ta" label="qwer" dangerousHtmlDescription="<b>TEXTAREA</b>"></TextareaFormGroup>
  <br> -->
  
  <!-- <SelectFormGroup :options="[{value: 1, label: 'a'}, {value: 2, label: 'b'}]"
                   v-model="s"
                   label="Select"
                   description="Speriamo bene?"></SelectFormGroup> -->
  <!-- <div class="greetings">
    <h1 class="green">Info</h1>
    <h3>
      You’ve successfully created a project with
      <a target="_blank" href="https://vitejs.dev/">Vite</a> +
      <a target="_blank" href="https://vuejs.org/">Vue 3</a>. What's next?
    </h3>
  </div> -->
</template>


<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>

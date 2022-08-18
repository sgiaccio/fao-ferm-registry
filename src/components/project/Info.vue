<script setup lang="ts">
// import { defineComponent } from '@vue/composition-api'
import TextInput from "../inputs/TextInput.vue";
import TextFormGroup from "../inputs/TextFormGroup.vue";
import DateFormGroup from "../inputs/DateFormGroup.vue";
import TextareaFormGroup from "../inputs/TextareaFormGroup.vue";
import SelectFormGroup from "../inputs/SelectFormGroup.vue";
import MultiInput from "../inputs/MultiInput.vue";
import MultiInputFormGroup from "../inputs/MultiInputFormGroup.vue";

import { ref } from 'vue'


import { h } from 'vue'

const sampleData = {
  created_by: "0nLfgGHB4uYvklHbzjlJP4K4Fv13",
  project: {
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
          address: null
        }
      }
    ],
    purpose: "objectives",
    endingDate: "2022-08-21",
    description: "description",
    title: "test admin asdf"
  },
  updateTime: {
    seconds: 1659502327,
    nanoseconds: 151000000
  },
  createTime: {
    seconds: 1651849897,
    nanoseconds: 160000000
  },
  group: "fMBz8DktwRHxLjVgMSpg"
}

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
  <!-- <DynamicHeading level=2>asdf</DynamicHeading> -->
  {{JSON.stringify(mi, null, 2)}}
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

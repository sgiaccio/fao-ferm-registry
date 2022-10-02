<script setup lang="ts">
import { getStorage, ref, uploadBytes, listAll } from 'firebase/storage';
import * as vue from 'vue';



import { useProjectStore } from '../../stores/project';

  import TextFormGroup from "@/components/inputs/base/TextFormGroup.vue";
  import DateFormGroup from "@/components/inputs/base/DateFormGroup.vue";
  import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
  import KeywordsInputGroup from "@/components/inputs/KeywordsInputGroup.vue"
  import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue"
  import AreaFormGroup from "@/components/inputs/AreaFormGroup.vue"
  import MultiInputFormGroup from "@/components/inputs/MultiInputFormGroup.vue"
  import Organization from "@/components/inputs/organizations/Organization.vue"
  import PointOfContact from "@/components/inputs/pointsOfContact/pointOfContact.vue"
  
  import { objectives } from "../../components/project/menus";
  
  // import { h } from 'vue'
  
  // const data = ref({
  //     keywords: ["keyword1"],
  //     uuid: "c4e57e20-c61f-4950-8265-43640cf1b4fe",
  //     reportingProcess: "ferm",
  //     startingDate: "2022-08-23",
  //     topicCategories: [
  //       {
  //         topicCategory: "Inland waters"
  //       }
  //     ],
  //     pointsOfContact: [
  //       {
  //         poc: {
  //           email: "asdf",
  //           organization: "asdf",
  //           individualName: "asdf",
  //           // address: null
  //         }
  //       }
  //     ],
  //     objectives: [1],
  //     endingDate: "2022-08-21",
  //     description: "description",
  //     title: "test admin",
  //     website: "website.com",
  //     testSelect: 1,
  //     targetArea: { value: 10, units: "ha" },
  //     organizations: [],
  //     adminAreas: []
  //     // adminArea: null
  //   },
  //   // updateTime: {
  //   //   seconds: 1659502327,
  //   //   nanoseconds: 151000000
  //   // },
  //   // createTime: {
  //   //   seconds: 1651849897,
  //   //   nanoseconds: 160000000
  //   // },
  //   // group: "fMBz8DktwRHxLjVgMSpg"
  // )
  
  // export default defineComponent({
  //   setup() {
      
  //   },
  // })
  
  // const DynamicHeading = (props, context) => {
  //   return h(`h${props.level}`, context.attrs, context.slots)
  // }
  
  // DynamicHeading.props = ['level']

  const organizations = {
    organization: {
        component: Organization,
        newData: {},
        addItemLabel: "Add organization",
    },
  }

const pointsOfContact = {
    poc: {
        component: PointOfContact,
        newData: {},
        addItemLabel: "Add point of contact",
    },
  }

  const store = useProjectStore();


  const selectedFile = vue.ref(null);
  const uploadStatus = vue.ref('idle');
  function setSelectedFile(event: Event) {
    selectedFile.value = (event.target as HTMLInputElement).files![0];
  }

  const storage = getStorage();
  function uploadFile(projectId: string) {
    const storageRef = ref(storage, `${projectId}/documents/${selectedFile.value!.name}`);
    const uploadTask = uploadBytes(storageRef, selectedFile.value!);
    uploadTask.then(snapshot => console.log(snapshot));
  }

  async function listFiles(projectId: string) {
    const dirRef = ref(storage, projectId + '/documents/');
    return listAll(dirRef);
  }

  // (defn list-files [path]
  // (let [dir-ref (ref storage path)
  //       ;; _ (js/console.log project-id)
  //       ;; _ (js/console.log path)
  //       ]
  //   (listAll dir-ref)))

  const fileName = vue.ref<string>();
  vue.watch(() => store.id as string, async (id) => {
    const fList = await listFiles(id);
    fileName.value = fList.items && fList.items.length && fList.items[0].name // only one file can be uploaded
  })
  </script>
  
  
  <template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
      <h1 class="text-3xl dark:text-zinc-300">Initiative Registration</h1>
      <p class="dark:text-zinc-200">In this tab, basic information about your initiative is needed. The title and a summary of the aims and expected results of the initiative can be provided in the description section. You also need to provide further information such as when the initiative is expected to start and end, sources of funding and responsible organisms.</p>
      <!-- <div class="my-6 font-bold dark:text-zinc-300">uuid: -->
        <!-- <span class="font-mono">{{data.uuid}}</span> -->
      <!-- </div> -->
  
      <div class="divide-y divide-stone-900">
        <TextFormGroup
            v-model="store.project.project.title"
            label="Title"
            description="Title of the initiative as stated in the official initiative document">
        </TextFormGroup>
        <TextareaFormGroup
            v-model="store.project.project.description"
            label="Description"
            description="Short description of the initiative (max xx characters)"></TextareaFormGroup>
        <TextFormGroup
            v-model="store.project.project.website"
            label="Website"
            description="Website of the initiative"
            placeholder="www.example.com">
        </TextFormGroup>
        <AreaFormGroup
            label="Target area"
            v-model="store.project.project.targetArea"
            description="Area of the restoration target"></AreaFormGroup>
        <DateFormGroup
            v-model="store.project.project.startingDate"
            label="Starting date"
            description="Date when the initiative started"></DateFormGroup>
        <DateFormGroup
            v-model="store.project.project.endingDate"
            label="Ending date"
            description="Date when the initiative finished or is expected to finish"></DateFormGroup>

  <div v-if="!fileName">
    <div>Upload one initiative document</div>
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
                :class="['idle' === 'idle' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 cursor-default']"
                @click="uploadFile(store.id)">
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
<div class="dark:text-white" v-else>Initiative file: {{fileName}}</div>

<!-- <TextFormGroup
            v-model="store.project.project.document"
            label="Document"
            description="Upload one initiative document (xx formats accepted, max xx MB)">
        </TextFormGroup> TODO -->
        <!-- <TextareaFormGroup
            v-model="store.project.project.purpose"
            label="Initiative Objectives"
            description="Summary of the intentions with which the resource(s) was developed"></TextareaFormGroup> -->
        <MultiSelectFormGroup
            :options="objectives"
            v-model="store.project.project.objectives"
            label="Objectives"
            description="Objectives of the initiatives"></MultiSelectFormGroup>
        <MultiInputFormGroup
          label="Points of contact"
          :inputComponents="pointsOfContact"
          v-model="store.project.project.pointsOfContact"></MultiInputFormGroup>
        <KeywordsInputGroup 
          v-model="store.project.project.keywords"
          label="Keywords">
        </KeywordsInputGroup>
        <MultiInputFormGroup
          label="Organizations"
          description="Organizations that implement the project/initiative"
          :inputComponents="organizations"
          v-model="store.project.project.organizations" />
        <!-- <Organizations
            v-model="store.project.project.organizations"></Organizations> -->
        <!-- <SelectFormGroup :options="objectives"
                        v-model="data.objectives"
                        label="Objectives"
                        description="Objectives of the initiatives"></SelectFormGroup> -->
        </div>
    </div>
  
    <!-- <DynamicHeading level=2>asdf</DynamicHeading> -->
    <!-- <pre class="text-white">{{JSON.stringify(data, null, 2)}}</pre> -->
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
  
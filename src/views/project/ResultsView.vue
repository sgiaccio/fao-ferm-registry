<script setup lang="ts">
    // import { getStorage, ref, uploadBytes, listAll } from 'firebase/storage';
    // import * as vue from 'vue';
    
    
    
    import { useProjectStore } from '../../stores/project';
    
      import SelectFormGroup from "@/components/inputs/base/SelectFormGroup.vue";
    //   import TextFormGroup from "@/components/inputs/base/TextFormGroup.vue";
    //   import DateFormGroup from "@/components/inputs/base/DateFormGroup.vue";
    //   import TextareaFormGroup from "@/components/inputs/base/TextareaFormGroup.vue";
    //   import KeywordsInputGroup from "@/components/inputs/KeywordsInputGroup.vue"
    //   import MultiSelectFormGroup from "@/components/inputs/base/MultiSelectFormGroup.vue"
    //   import AreaFormGroup from "@/components/inputs/AreaFormGroup.vue"
    //   import MultiInputFormGroup from "@/components/inputs/MultiInputFormGroup.vue"
    //   import Organization from "@/components/inputs/organizations/Organization.vue"
    //   import PointOfContact from "@/components/inputs/pointsOfContact/pointOfContact.vue"

    import * as menus from "../../components/project/menus";
      
    //   import { objectives } from "../../components/project/menus";
      
    //   // import { h } from 'vue'
      
    //   // const data = ref({
    //   //     keywords: ["keyword1"],
    //   //     uuid: "c4e57e20-c61f-4950-8265-43640cf1b4fe",
    //   //     reportingProcess: "ferm",
    //   //     startingDate: "2022-08-23",
    //   //     topicCategories: [
    //   //       {
    //   //         topicCategory: "Inland waters"
    //   //       }
    //   //     ],
    //   //     pointsOfContact: [
    //   //       {
    //   //         poc: {
    //   //           email: "asdf",
    //   //           organization: "asdf",
    //   //           individualName: "asdf",
    //   //           // address: null
    //   //         }
    //   //       }
    //   //     ],
    //   //     objectives: [1],
    //   //     endingDate: "2022-08-21",
    //   //     description: "description",
    //   //     title: "test admin",
    //   //     website: "website.com",
    //   //     testSelect: 1,
    //   //     targetArea: { value: 10, units: "ha" },
    //   //     organizations: [],
    //   //     adminAreas: []
    //   //     // adminArea: null
    //   //   },
    //   //   // updateTime: {
    //   //   //   seconds: 1659502327,
    //   //   //   nanoseconds: 151000000
    //   //   // },
    //   //   // createTime: {
    //   //   //   seconds: 1651849897,
    //   //   //   nanoseconds: 160000000
    //   //   // },
    //   //   // group: "fMBz8DktwRHxLjVgMSpg"
    //   // )
      
    //   // export default defineComponent({
    //   //   setup() {
          
    //   //   },
    //   // })
      
    //   // const DynamicHeading = (props, context) => {
    //   //   return h(`h${props.level}`, context.attrs, context.slots)
    //   // }
      
    //   // DynamicHeading.props = ['level']
    
    //   const organizations = {
    //     organization: {
    //         component: Organization,
    //         newData: {},
    //         addItemLabel: "Add organization",
    //     },
    //   }
    
    // const pointsOfContact = {
    //     poc: {
    //         component: PointOfContact,
    //         newData: {},
    //         addItemLabel: "Add point of contact",
    //     },
    //   }
    
      const store = useProjectStore();
    
    
    //   const selectedFile = vue.ref(null);
    //   const uploadStatus = vue.ref('idle');
    //   function setSelectedFile(event: Event) {
    //     selectedFile.value = (event.target as HTMLInputElement).files![0];
    //   }
    
    //   const storage = getStorage();
    //   function uploadFile(projectId: string) {
    //     const storageRef = ref(storage, `${projectId}/documents/${selectedFile.value!.name}`);
    //     const uploadTask = uploadBytes(storageRef, selectedFile.value!);
    //     uploadTask.then(snapshot => console.log(snapshot));
    //   }
    
    //   async function listFiles(projectId: string) {
    //     const dirRef = ref(storage, projectId + '/documents/');
    //     return listAll(dirRef);
    //   }
    
    //   // (defn list-files [path]
    //   // (let [dir-ref (ref storage path)
    //   //       ;; _ (js/console.log project-id)
    //   //       ;; _ (js/console.log path)
    //   //       ]
    //   //   (listAll dir-ref)))
    
    //   const fileName = vue.ref<string>();
    //   vue.watch(() => store.id as string, async (id) => {
    //     const fList = await listFiles(id);
    //     fileName.value = fList.items && fList.items.length && fList.items[0].name // only one file can be uploaded
    //   })
      </script>
      
      
      <template>
        <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
          <h1 class="text-3xl dark:text-zinc-300">Results</h1>
          <p class="dark:text-zinc-200">Results are calculated for selected indicators in each area of interests. The indicator calculation is based on available global layers and cloud computing environment such as SEPAL. The standard operating procedure to assess ecosystem restoration indicators is under preparation.</p>
          <!-- <div class="my-6 font-bold dark:text-zinc-300">uuid: -->
            <!-- <span class="font-mono">{{data.uuid}}</span> -->
          <!-- </div> -->
      
          <div class="divide-y divide-stone-900">
            <SelectFormGroup
                    :options="menus.achieved"
                    v-model="store.project.results.achieved"
                    label="Achievements"
                    description="Were the restoration objectives achieved?" />


                    <!-- [inputs/multi-form-group {:input-components {:reason #(inputs/select-input {:options menus/partially-achieved-reasons
                                                                                  :data    %
                                                                                  :edit    @edit})}
                                :new-data   {:reason nil}
                                :label      "If partially achieved, choose from list"
                                :add-labels {:reason "reason"}
                                :data       (cursor data [:partially-achieved-reasons])
                                :edit       @edit}] -->

            <SelectFormGroup
                    :options="menus.achievingTargets"
                    v-model="store.project.results.achievingTargets"
                    label="Results achieved based on targets" />

                </div>
</div>
      </template>
      
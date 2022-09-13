<script setup lang="ts">
import { TrashIcon } from '@heroicons/vue/outline';

const props = defineProps({
    modelValue: { type: null },
    inputComponents: null,
    numbering: Boolean,
    deleteConfirmMsg: String
});

// Sample inputComponents:
// [
//     keyword: {
//         component: "TextInput",
//         props: { placeholder: "Please write some text" }
//         newData: "",
//         addItemLabel: "text"
//     }
// ]

const emit = defineEmits(["update:modelValue"]);

function getKey(obj: any) {
    const kyz = Object.keys(obj);
    if (kyz.length === 1) {
        return kyz[0];
    } else {
       throw Error(`One and only one key is allowed - found ${kyz.length}`);
    }
}


function addNewItem(type: string) {
    // Not updtqeing modelValue directly, is it needed?
    const tempProp = props.modelValue ? [...props.modelValue] : []
    tempProp.push({ [type]: props.inputComponents[type].newData });
    emit('update:modelValue', tempProp)
}

function deleteItem(i: number) {
    if (confirm("Are you sure you want to delete this item?")) {
        const tempProp = props.modelValue ? [...props.modelValue] : []
        tempProp.splice(i, 1);
        emit('update:modelValue', tempProp)
    }
}
</script>

<template>
    <div class="border-2 rounded-md divide-y-2 border-stone-700 divide-stone-700">
        <div v-for="v, i in modelValue" class="p-3">
            <component
                :key="v"
                :is="inputComponents[getKey(v)].component"
                v-bind="inputComponents[getKey(v)].props"
                v-model="v[getKey(v)]" />
            <div class="w-full text-orange-600 text-right hover:text-orange-500">
                <button
                    type="button"
                    @click="deleteItem(i)">
                    <TrashIcon class="h-6 w-6" ></TrashIcon>
                </button>
            </div>
        </div>
        <div class="p-3">
            <button
                type="button"
                @click="addNewItem(getKey(props.inputComponents))"
                class="inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add
            </button>
        </div>
    </div>
</template>


<!-- (defn multi-input
  "Creates a multi-input from an input-component, adding \"add\" and \"delete\"
   buttons to add/delete items. @data must be a vector. Can handle multiple input types
   
   Sample arg:
   
   {:input-components {:keyword #(inputs/keywords {:data %})
                       :text    #(inputs/text-input {:data %})}
    :new-data         {:keyword {:type :author :keywords [\"kw\"]}
                       :text \"new text \"}
    :label            \"Keywords or text \"
    :add-labels       {:text \"Text \" :keyword \"Keyword\"}
    :data             [[:keyword {:type :discipline :keywords [\"kw1\" \"kw2\"]}]
                       [:text \"text \"]]}"
  [{:keys [input-components description data new-data add-labels edit numbering delete-confirm-message]
    :or {numbering false delete-confirm-message "Are you sure you want to delete this item?"}}]
  (with-let [;;button-id (gen-dom-id)
            ;;  _ (js/console.log (clj->js @data))
             ]
    [:div {:class "border p-3 rounded rounded-md divide-y"}
     (doall (for [n (range (count @data))]
              ; TODO using n as a key for now - will find a proper one
              [:div {:key n}
               (when numbering
                ;;  [:div {:class "mt-5"}]
                 [:span {:href "#", :class "mt-5 flex items-center text-sm font-medium", :aria-current "n"}
                  [:span {:class "flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-indigo-600 rounded-full"}
                   [:span {:class "text-indigo-600"} (+ 1 n)]]])
               [:div {:class "flex flex-row my-5 w-full"}
                (let [input-component-def  (nth @data n)
                      input-component-type (-> input-component-def first first) ; get key - there's only one
                      input-component-data (cursor data [n input-component-type])
                      input-component      (get input-components input-component-type)]
                  [:div {:class "pl-0 w-full"} (input-component input-component-data)])
                (when edit
                  [:div {:class "pl-3 pt-3"}
                   [:div {:class "text-red-600 cursor-pointer"
                          :on-click (fn []
                                      (when (js/confirm delete-confirm-message)
                                        (swap! data #(vec-remove n %))))}
                    icons/trash]])]]))
     (when description [:p {:class "mt-1 text-sm text-gray-500"} description])

     ; "Add" button
     (when edit
       (if (> (count input-components) 1)
       ; If there's more than one input component, show a dropdown menu
         [:div {:class "flex gap-4 pt-4"}
          [:div "Add"]

          (doall (for [component input-components
                       :let [k (key component)]]
                   [:button {:key      k
                             :type     "button"
                             :on-click (fn [] (reset! data (into [] (conj @data {k (get new-data k)}))))
                             :class    "inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
                    (get add-labels k)]
                    ;; [:a {:key      k
                    ;;                  ; Not using swap! - Using into and reset!
                    ;;                  ; because (conj nil x) returns (x) instead of [x].
                    ;;                  ; Causes problems when adding the first item
                    ;;      :on-click (fn [] (reset! data (into [] (conj @data {k (get new-data k)}))))}
                    ;;  (get add-labels k)]
                   ))]
         ; Otherwise, show just a button
         [:button {:type "button" 
                   :on-click #(reset! data (into [] (conj @data new-data)))
                   :class "inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
          "Add " (-> add-labels first val)]))]))

        ;;  [:div.btn.btn-primary.btn-sm {:type "button"
        ;;                              ; Using into and reset! - see comment above
        ;;                                :on-click #(reset! data (into [] (conj @data new-data)))}
        ;;   "Add " (-> add-labels first val)]
          -->

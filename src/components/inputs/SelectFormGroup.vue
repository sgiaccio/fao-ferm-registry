<script setup lang="ts">
import type { PropType } from 'vue'

import baseProps from "./formGroupProps"
import FormGroup from "./FormGroup.vue"

// label: { type: String, required: true },
// description: { type: String },
// dangerousHtmlDescription: { type: String }

defineProps({
    ...baseProps,
    ...{
        options: { type: Array as PropType<Array<{value: any, label: String}>> },
        placeholder: { type: String },
        modelValue: { type: null },
    }
});

// export interface Props {
//   options: any[] // TODO
//   placeholder?: string
//   modelValue: String
//   label: String
//   description?: String
//   dangerousHtmlDescription?: String
// }

// const props = withDefaults(defineProps<Props>(), {
//   placeholder: 'Please select',
// })

const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <select class="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                :value="modelValue"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)">
            <option value="">{{placeholder}}</option>
            <option v-for="option in options"
                    :key="option.value"
                    :value="option.value">
                {{option.label}}
            </option>
        </select>
    </FormGroup>
</template>

<!-- (defn select-input [{:keys [options placeholder description info data edit] :or {placeholder "Please select"}}]
  [:<>
   (if edit
     [:select {:class "max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
               :value (or @data "")
               :on-change #(reset! data (-> % .-target .-value empty-to-nil keyword))}
      [:option {:value ""} placeholder]
      (for [[value label] options]
        [:option {:key value :value (or value label)} (or label value)])]

     (get-select-label @data options))
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])
   (when info [:div {:class "text-yellow-500"
                     :on-click #(show-info info)} icons/info])])
 -->

<script setup lang="ts">
    import type { PropType } from "vue";
    import TextAreaFormGroup from "./base/TextareaFormGroup.vue"
    
    
    defineProps({
        modelValue: {
            type: Object as PropType<{
                constraint?: string,
                addressing?: string,
            }>,
            default: {}
        },
        edit: { type: Boolean, default: true }
    });
    
    </script>
    
    <template>
        <div>
            <TextAreaFormGroup
                v-model="modelValue.constraint"
                label="Constraints / Challenges / Risks"
                :edit="edit" />
            <TextAreaFormGroup
                v-model="modelValue.addressing"
                label="How can they be addressed?"
                :edit="edit" />
        </div>
    </template>
    
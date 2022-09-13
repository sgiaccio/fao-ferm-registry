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
    });
    
    </script>
    
    <template>
        <div>
            <TextAreaFormGroup
                v-model="modelValue.constraint"
                label="Constraints / Challenges / Risks" />
            <TextAreaFormGroup
                v-model="modelValue.addressing"
                label="How can they be addressed?" />
        </div>
    </template>
    
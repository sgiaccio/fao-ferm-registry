<script setup lang="ts">
import baseProps from "./formGroupProps"

defineProps(baseProps);
</script>

<template>
    <fieldset>
        <div class="sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start sm:border-t_ sm:border-gray-200_ sm:py-5 sm:content-center">
            <legend class="block text-sm font-medium text-gray-700 sm:mt-px">
                {{label}}
            </legend>
            <div class="mt-1 sm:mt-0 sm:col-span-3">
                <slot></slot>
            </div>
            <p v-if="description"
               class="mt-2 text-sm text-gray-500">
                {{description}}
            </p>
            <p v-else-if="dangerousHtmlDescription"
               v-html="dangerousHtmlDescription"
               class="mt-2 text-sm text-gray-500">
            </p>
        </div>
    </fieldset>
    
</template>

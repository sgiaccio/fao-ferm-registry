<script setup lang="ts">
import baseProps from "./formGroupProps"

defineProps(baseProps);
</script>

<template>
    <fieldset>
        <div class="sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start py-5 sm:content-center">
            <legend class="block text-sm font-bold text-gray-700 dark:text-zinc-300 sm:mt-px">
                {{label}}
            </legend>
            <div class="sm:col-span-3">
                <p
                    v-if="description"
                    class="font-semibold mb-3 text-sm text-gray-500 dark:text-gray-400">
                    {{description}}
                </p>
                <p
                    v-else-if="dangerousHtmlDescription"
                    v-html="dangerousHtmlDescription"
                    class="font-semibold mb-3 text-sm text-gray-500 dark:text-gray-400" />
                <slot></slot>
            </div>
        </div>
    </fieldset>
    
</template>

<script
    setup
    lang="ts"
>
import { computed, ref } from 'vue';

import { useI18n } from 'vue-i18n';

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { XMarkIcon } from '@heroicons/vue/16/solid';

import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxLabel,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/vue';

import countries from './countries.json';


// define a modelValue string prop
defineProps<{
    modelValue: string[],
}>();

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const query = ref('');
// const selectedCountries = ref([]);
const filteredCountries = computed(() =>
    query.value === ''
        ? countries
        : countries.filter(country => country.name.toLowerCase().includes(query.value.toLowerCase()))
)

function updateModelValue(value: string[]) {
    emit('update:modelValue', value);
}
</script>

<template>
    <Combobox
        multiple
        as="div"
        :modelValue="modelValue"
        @update:modelValue="updateModelValue"
        v-slot="{ open }"
    >
        <ComboboxLabel class="flex flex-row w-full font-bold uppercase text-gray-600 cursor-pointer items-center text-md leading-6">{{ t('home.countries') }}</ComboboxLabel>
        <div class="relative mt-2">
            <ComboboxInput
                class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                @change="query = $event.target.value"
                :display-value="country => country?.name"
                :placeholder="t('publicSearch.selectCountries')"
            />
            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                <ChevronUpDownIcon
                    class="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                />
            </ComboboxButton>


            <transition
                leave-active-class="transition duration-200 ease-out"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
                @after-leave="query = ''"
            >
                <ComboboxOptions
                    v-if="filteredCountries.length > 0"
                    class="absolute bottom-10 z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                    <ComboboxOption
                        v-for="country in filteredCountries"
                        :key="country.ISO3"
                        :value="country"
                        as="template"
                        v-slot="{ active, selected }"
                    >
                        <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                            <div class="flex items-center">
                                <img
                                    :src="`/flags/iso3/${country.ISO3}.svg`"
                                    :alt="`${country.name} flag`"
                                    class="h-6 w-6 flex-shrink-0 rounded-full"
                                />
                                <span :class="['ml-3 truncate', selected && 'font-semibold']">
                                    {{ country.name }}
                                </span>
                            </div>

                            <span
                                v-if="selected"
                                :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']"
                            >
                                <CheckIcon
                                    class="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </span>
                        </li>
                    </ComboboxOption>
                </ComboboxOptions>

            </Transition>
        </div>
    </Combobox>
    <!-- list of selected countries as a horizontal list, with flag on the left and a close button on the right -->
    <!-- <ul class="mt-0 flex flex-wrap gap-1.5 max-w-full"> -->
    <TransitionGroup
        name="list"
        tag="ul"
        class="mt-3 flex flex-wrap gap-1.5 max-w-full"
    >
        <li
            v-for="country in modelValue.sort((a, b) => a.name.localeCompare(b.name))"
            :key="country.ISO3"
            class="flex items-center bg-indigo-100 rounded-full px-[0.320rem] py-[0.145rem] max-w-full"
        >
            <div class="flex items-center max-w-full">
                <img
                    :src="`/flags/iso3/${country.ISO3}.svg`"
                    :alt="`${country.name} flag`"
                    class="h-4 w-4 flex-shrink-0 rounded-full"
                />
                <span class="ml-2 text-sm font-medium text-indigo-800 truncate">{{ country.name }}</span>
                <button
                    @click="emit('update:modelValue', modelValue.filter(c => c.ISO3 !== country.ISO3))"
                    type="button"
                    class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full flex items-center justify-center text-indigo-800 hover:text-white hover:bg-indigo-800 focus:outline-none"
                >
                    <span class="sr-only">Remove</span>
                    <XMarkIcon
                        class="h-4 w-4"
                        aria-hidden="true"
                    />
                </button>
            </div>
        </li>
    </TransitionGroup>
    <!-- </ul> -->
</template>

<style scoped>
/* For moving elements */
.list-move {
    transition: transform 0.3s ease-in-out;
}

/* For entering elements */
.list-enter-active {
    transition: opacity 0.3s ease-in-out;
}

.list-enter-from {
    opacity: 0;
}

.list-enter-to {
    opacity: 1;
}

/* For leaving elements */
.list-leave-active {
    transition: opacity 0.3s ease-in-out;
}

.list-leave-from {
    opacity: 1;
}

.list-leave-to {
    opacity: 0;
}
</style>

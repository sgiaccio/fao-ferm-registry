<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
import { CheckIcon } from '@heroicons/vue/20/solid';

import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/vue'

import CountrySelect from './CountrySelect.vue'


const props = defineProps<{
    query: {
        queryName: string;
        queryValues: { value: string; label: string }[]
    }[];
    searchTerms: any;
}>();

const { t } = useI18n();

const countries = defineModel('countries');
// const searchTerms = defineModel('searchTerms');

const emit = defineEmits(['update:searchTerms']);

function toggleSearchTerm(queryName: string, value: string) {
    const current = props.searchTerms[queryName];
    if (current.includes(value)) {
        // Remove the value from the array
        emit('update:searchTerms', {
            ...props.searchTerms,
            [queryName]: current.filter((v: string) => v !== value)
        })
        // searchTerms[queryName] = current.filter((v) => v !== value)
    } else {
        // Add the value to the array
        emit('update:searchTerms', {
            ...props.searchTerms,
            [queryName]: [...current, value]
        });
    }
}
</script>

<template>
    <nav class="flex flex-1 flex-col pt-6">
        <ul
            role="list"
            class="flex flex-1 flex-col gap-y-5"
        >
            <Disclosure
                v-for="item in query"
                class="border-b-2 border-b-gray-100"
                as="li"
                v-slot="{ open }"
                :defaultOpen="true"
            >
                <DisclosureButton class="flex flex-row w-full font-bold uppercase text-gray-600 cursor-pointer items-center">
                    <ChevronRightIcon
                        v-if="!open"
                        class="h-5 w-5 text-gray-800"
                    />
                    <ChevronDownIcon
                        v-else
                        class="h-5 w-5 text-gray-800"
                    />
                    <span>{{ t(`publicSearch.initiatives.${item.queryName}.label`) }}</span>
                </DisclosureButton>
                <DisclosurePanel
                    as="ul"
                    role="list"
                    class="mx-2 mt-1 mb-2 space-y-1"
                >
                    <li
                        v-for="{ value, label } in item.queryValues"
                        :key="label"
                        :class="[searchTerms[item.queryName].includes(label) ? 'bg-blue-100' : '', 'flex flex-row justify-between text-sm cursor-pointer hover:bg-blue-100 rounded-full py-1 pl-3 items-center']"
                        @click="() => toggleSearchTerm(item.queryName, label)"
                    >
                        <div class="flex flex-row items-center justify-between w-full">
                            <span class="text-gray-700">{{ t(`publicSearch.initiatives.${item.queryName}.terms.${value}`) }}</span>
                            <CheckIcon
                                :class="[searchTerms[item.queryName].includes(label) ? 'visible' : 'invisible', 'h-4 w-4 text-gray-800 mr-2 flex-shrink-0']"
                                aria-hidden="true"
                            />
                        </div>
                    </li>
                </DisclosurePanel>
            </Disclosure>
            <div class="pl-5">
                <CountrySelect v-model="countries" />
            </div>
        </ul>
    </nav>
</template>
<script setup lang="ts">
import { watch } from 'vue';

import { useI18n } from 'vue-i18n';

import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/20/solid';
import { CheckIcon } from '@heroicons/vue/20/solid';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';

import SelectInput from '@/components/inputs/base/SelectInput.vue';
import CountrySelect from '../CountrySelect.vue';

const props = defineProps<{
    query: {
        queryName: string;
        queryValues: { value: string; label: string }[];
    }[];
    labelTranslations: {
        [key: string]: { [key: string]: { [key: string]: string } };
    };
    searchTerms: any;
}>();

const { t } = useI18n();

const countries = defineModel<{ ISO3: string; name: string }[]>('countries', {
    required: true,
});
// const searchTerms = defineModel('searchTerms');
const language = defineModel<'en' | 'es' | 'fr'>('language', {
    required: true,
});

const emit = defineEmits(['update:searchTerms']);

function translateLabel(queryName: string, value: string, key: string) {
    // props.labelTranslations?.[language]?.[
    //     item.queryName
    // ]?.[value],
    const translatedLabel =
        props.labelTranslations?.[language.value]?.[queryName]?.[key];
    return translatedLabel || value;
}

function toggleSearchTerm(queryName: string, value: string, key: string) {
    const current = props.searchTerms[queryName];
    const translatedLabel = translateLabel(queryName, value, key);
    if (current.includes(translatedLabel)) {
        emit('update:searchTerms', {
            ...props.searchTerms,
            [queryName]: current.filter((v: string) => v !== translatedLabel),
        });
    } else {
        emit('update:searchTerms', {
            ...props.searchTerms,
            [queryName]: [...current, translatedLabel],
        });
    }
}

// Watch for language changes and update search terms accordingly
// This is needed because data is stored in different languages on the DB
// TODO this is quite bloated, but it works for now. TODO: keep query terms ids in an internal state
watch(language, (newLanguage, oldLanguage) => {
    if (newLanguage === oldLanguage) return;

    const updatedSearchTerms = { ...props.searchTerms };

    // Process each filter category
    props.query.forEach((item) => {
        const queryName = item.queryName;
        const currentTerms = props.searchTerms[queryName] || [];

        if (currentTerms.length > 0) {
            updatedSearchTerms[queryName] = [];

            // For each possible value in this query
            item.queryValues.forEach(({ value, label }) => {
                // Get all possible translations and labels for this value
                const possibleMatches = [];

                // Add translation in old language if available
                const oldTranslation =
                    props.labelTranslations?.[oldLanguage]?.[queryName]?.[
                        value
                    ];
                if (oldTranslation) possibleMatches.push(oldTranslation);

                // Add translations in other languages
                Object.keys(props.labelTranslations).forEach((lang) => {
                    const translation =
                        props.labelTranslations[lang]?.[queryName]?.[value];
                    if (translation) possibleMatches.push(translation);
                });

                // Always add the label as a fallback match
                possibleMatches.push(label);

                // Check if any possible match exists in the current terms
                const isSelected = currentTerms.some((term) =>
                    possibleMatches.includes(term),
                );

                if (isSelected) {
                    // Get translation in the new language, with fallback to label
                    const newTranslation =
                        props.labelTranslations?.[newLanguage]?.[queryName]?.[
                            value
                        ] || label;
                    updatedSearchTerms[queryName].push(newTranslation);
                }
            });
        }
    });

    // Update the search terms with the new translations
    emit('update:searchTerms', updatedSearchTerms);
});
</script>

<template>
    <nav class="flex flex-1 flex-col pt-6">
        <ul role="list" class="flex flex-1 flex-col gap-y-5">
            <Disclosure
                v-for="item in query"
                class="border-b-2 border-b-gray-100"
                as="li"
                v-slot="{ open }"
                :defaultOpen="true"
            >
                <DisclosureButton
                    class="flex flex-row w-full font-bold uppercase text-gray-600 cursor-pointer items-center"
                >
                    <ChevronRightIcon
                        v-if="!open"
                        class="h-5 w-5 text-gray-800"
                    />
                    <ChevronDownIcon v-else class="h-5 w-5 text-gray-800" />
                    <span>{{
                        t(`publicSearch.goodPractices.${item.queryName}.label`)
                    }}</span>
                </DisclosureButton>
                <DisclosurePanel
                    as="ul"
                    role="list"
                    class="mx-2 mt-1 mb-2 space-y-1"
                >
                    <li
                        v-for="{ value, label } in item.queryValues"
                        :key="value"
                        :class="[
                            searchTerms[item.queryName].includes(
                                translateLabel(item.queryName, label, value),
                            )
                                ? 'bg-blue-100'
                                : '',
                            'flex flex-row justify-between text-sm cursor-pointer hover:bg-blue-100 rounded-full py-1 pl-3 items-center',
                        ]"
                        @click="
                            () => toggleSearchTerm(item.queryName, label, value)
                        "
                    >
                        <div
                            class="flex flex-row items-center justify-between w-full"
                        >
                            <span class="text-gray-700">{{
                                t(
                                    `publicSearch.goodPractices.${item.queryName}.terms.${value}`,
                                )
                            }}</span>
                            <CheckIcon
                                :class="[
                                    searchTerms[item.queryName].includes(
                                        translateLabel(
                                            item.queryName,
                                            label,
                                            value,
                                        ),
                                    )
                                        ? 'visible'
                                        : 'invisible',
                                    'h-4 w-4 text-gray-800 mr-2 flex-shrink-0',
                                ]"
                                aria-hidden="true"
                            />
                        </div>
                    </li>
                </DisclosurePanel>
            </Disclosure>
            <li>
                <div class="pl-5 border-b-2 border-b-gray-100 pb-4">
                    <div
                        class="flex flex-row w-full font-bold uppercase text-gray-600 cursor-pointer items-center text-md leading-6 pb-2"
                    >
                        {{ t('publicSearch.language') }}
                    </div>
                    <SelectInput
                        v-model="language"
                        :options="[
                            { label: t('common.english'), value: 'en' },
                            { label: t('common.french'), value: 'fr' },
                            { label: t('common.spanish'), value: 'es' },
                        ]"
                        :edit="true"
                    />
                </div>
                <div class="pt-5 pl-5">
                    <CountrySelect v-model="countries" />
                </div>
            </li>
        </ul>
    </nav>
</template>

<script setup lang="ts">
import { LinkIcon } from '@heroicons/vue/20/solid';

import Thumbnail from './Thumbnail.vue';

import Tooltip from '@/components/Tooltip.vue';

import { useI18n } from 'vue-i18n';

const props = defineProps<{
    title?: string;
    shortDescription?: string;
    lastUpdated?: number;
    organizations: string[];
    url: string;
    source: string;
    previewImage?: string;
    countryIso3Codes: string[];
    countryNames: string[];
    viewFullText: string;
}>();

const { t } = useI18n();

const sourceLinks = {
    ferm: 'https://ferm.fao.org',
    goprofor: 'https://www.lifegoprofor.eu',
    panorama: 'https://panorama.solutions',
    wocat: 'https://www.wocat.net',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
});

// transform the URL if the source is 'FERM' and it's a project, not a best practice
const source = props.source.toLowerCase();
let _url = props.url;
if (
    (props.source === 'FERM' ||
        props.source === 'GEF' ||
        props.source === 'RESULT Asia-Pacific') &&
    props.url.includes('/initiatives/')
) {
    const projectId = props.url.split('/').pop();
    _url = `/search/initiatives/${projectId}`;
}

function changeSource(event: MouseEvent, source: string) {
    const img = event.target as HTMLImageElement;
    img.src = `/interop_logos/${source.toLowerCase()}.png`;
}
</script>

<template>
    <div class="flex flex-row flex-grow gap-x-4 bg-gray-50 h-1">
        <!-- hide on mobile -->
        <Thumbnail
            :previewImage="previewImage"
            :source="source"
            class="flex-shrink-0 object-cover h-64 hidden sm:flex"
        />
        <div class="py-4 flex flex-col w-full mr-4 ml-4 sm:ml-0">
            <div class="flex-1 flex flex-col">
                <div class="flex-1">
                    <h3 class="text-md font-medium line-clamp-2">
                        {{ title }}
                    </h3>
                    <p
                        v-if="shortDescription"
                        class="text-sm text-gray-700 line-clamp-2 w-auto mt-3"
                    >
                        <span class="font-semibold"
                            >{{ t('common.description') }}: </span
                        >{{ shortDescription }}
                    </p>
                    <p v-if="lastUpdated" class="text-sm text-gray-700">
                        <span class="font-semibold"
                            >{{ t('publicSearch.detail.lastUpdated') }}: </span
                        >{{ dateFormatter.format(new Date(lastUpdated)) }}
                    </p>
                    <p
                        v-if="organizations?.length > 0"
                        class="text-sm text-gray-700 line-clamp-2"
                    >
                        <span class="font-semibold text-gray-700"
                            >{{
                                t('publicSearch.detail.organizations', {
                                    n: organizations.length,
                                })
                            }}:
                        </span>
                        <!-- <div>
                            <p v-for="(org, index) in organizations">
                                {{ org }}
                            </p>
                        </div> -->

                        <template v-for="(org, index) in organizations">
                            {{ org
                            }}<template v-if="index < organizations.length - 1"
                                >,
                            </template>
                        </template>
                    </p>
                </div>
                <div class="flex flex-row gap-x-1.5 my-1">
                    <div v-for="(iso3, i) in countryIso3Codes">
                        <!-- <div class="group relative inline-block text-blue-500">
                            <img
                                class="w-6 h-6"
                                :src="`/flags-iso3/${iso3}.svg`"
                                alt="flag"
                            />
                            <!- - Tooltip - ->
                            <span class="tooltip absolute left-1/2 transform -translate-x-1/2 -top-2 -translate-y-full max-w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700 whitespace-nowrap">
                                {{ countryNames[i] }}
                            </span>
                        </div> -->

                        <!-- <div>{{ lc.value }}</div> -->
                        <!-- <span class="text-sm font-semibold">{{ countryNames[i] }}</span> -->
                        <!-- <img
                            class="w-6 h-6"
                            :src="`/flags-iso3/${iso3}.svg`"
                            alt="flag"
                        /> -->

                        <Tooltip>
                            <img
                                class="w-6 h-6"
                                :src="`/flags/iso3/${iso3}.svg`"
                                alt="flag"
                            />
                            <template #description>
                                {{ countryNames[i] }}
                            </template>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-between items-center">
                <a
                    :href="_url"
                    target="_blank"
                    class="text-gray-700 font-semibold flex items-center gap-x-2 whitespace-nowrap text-base hover:text-blue-600"
                >
                    <LinkIcon class="h-5 w-5 inline" />{{ viewFullText }}
                </a>
                <a
                    v-if="source"
                    :href="sourceLinks[source.toLowerCase()]"
                    target="_blank"
                >
                    <img
                        v-if="source"
                        :src="`/interop_logos/${source.toLowerCase()}.svg`"
                        @error="changeSource($event, source)"
                        alt="source"
                        class="max-w-32 max-h-8 w-full object-contain"
                    />
                </a>
            </div>
        </div>
    </div>
</template>

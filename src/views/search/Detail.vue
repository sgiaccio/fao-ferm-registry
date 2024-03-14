<script
    setup
    lang="ts"
>

import { LinkIcon } from '@heroicons/vue/20/solid'

import Thumbnail from './Thumbnail.vue'


defineProps<{
    title: string;
    short_description: string;
    last_updated: string;
    organizations: string[];
    url: string;
    source: string;
    previewImage: string;
    country_iso3_codes: string[];
    country_names: string[];
}>();

const sourceLinks = {
    ferm: 'https://ferm.fao.org',
    goprofor: 'https://www.lifegoprofor.eu',
    panorama: 'https://panorama.solutions',
    wocat: 'https://www.wocat.net',
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
});
</script>

<template>
    <div class="flex flex-row flex-grow gap-x-4 bg-gray-50 h-1">
        <!-- hide on mobile -->
        <Thumbnail
            :previewImage="previewImage"
            :source="source"
            class="flex-shrink-0 object-cover h-64 hidden sm:flex"
        />
        <!-- <img
            v-if="preview_image"
            :src="preview_image"
            alt="thumbnail"
            class="aspect-square overflow-hidden flex-shrink-0 object-cover h-full max-h-64 hidden sm:flex"
        />
        <div
            v-else
            class="flex justify-center h-full bg-gray-100"
        >
            <PhotoIcon class="h-32 w-32 text-gray-300 mt-6" />
        </div> -->
        <div class="py-4 flex flex-col justify-between w-full mr-4 ml-4 sm:ml-0">
            <div>
                <div class="flex flex-col gap-y-4 mb-2 ml-2 justify-between flex-shrink-0 float-right">
                    <div class="flex flex-col gap-y-2">
                        <div
                            class="flex flex-row items-center gap-x-2 w-full justify-end"
                            v-for="iso3, i in country_iso3_codes"
                        >
                            <span class="text-sm font-semibold">{{ country_names[i] }}</span>
                            <img
                                class="w-7 h-7"
                                :src="`/flags-iso3/${iso3}.svg`"
                                alt="flag"
                            />
                        </div>
                    </div>
                </div>



                <h3 class="text-md font-medium line-clamp-2">{{ title }}</h3>
                <p
                    v-if="short_description"
                    class="text-sm text-gray-700 line-clamp-3 w-auto mt-3"
                ><span class="font-semibold">Description: </span>{{ short_description }}</p>
                <p
                    v-if="last_updated"
                    class="text-sm text-gray-700"
                ><span class="font-semibold">Last updated: </span>{{ dateFormatter.format(new Date(last_updated)) }}</p>
                <!-- <div
                        v-if="organizations?.length > 0"
                        class="flex flex-row gap-x-2 text-sm mt-2"
                    > -->
                <p
                    v-if="organizations?.length > 0"
                    class="text-sm text-gray-700 line-clamp-2"
                >
                    <span class="font-semibold text-gray-700">Organization<template v-if="organizations.length > 1">s</template>: </span>
                    <!-- <div>
                            <p v-for="(org, index) in organizations">
                                {{ org }}
                            </p>
                        </div> -->

                    <template v-for="(org, index) in organizations">
                        {{ org }}<template v-if="index < organizations.length - 1">, </template>
                    </template>
                </p>
                <!-- </div> -->
            </div>
            <div class="flex flex-row justify-between items-end">
                <a
                    :href="url"
                    target="_blank"
                    class="text-gray-700 font-semibold flex items-center gap-x-2 whitespace-nowrap text-sm"
                >
                    <LinkIcon class="h-5 w-5 inline" />View full practice
                </a>
                <a
                    v-if="source"
                    :href="sourceLinks[source.toLowerCase()]"
                    target="_blank"
                >
                    <img
                        v-if="source"
                        :src="`/interop_logos/${source.toLowerCase()}.svg`"
                        alt="source"
                        class="max-w-32 max-h-8 w-full"
                    />
                </a>
            </div>
        </div>
    </div>
</template>
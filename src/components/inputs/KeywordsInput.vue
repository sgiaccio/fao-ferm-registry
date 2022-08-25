<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/solid'
// import ArchiveIcon from './archive-icon.vue'
// import DuplicateIcon from './duplicate-icon.vue'
// import MoveIcon from './move-icon.vue'
// import EditIcon from './edit-icon.vue'
// import DeleteIcon from './delete-icon.vue'

const inputRef = ref<HTMLDivElement>();

const tempKeywords = ["keyword1", "keyword2", "test", "testdicaz"]

const keywords = ref(["asdf", "qwer"]);

const searchText = ref("");
const matchingKeywords = computed(() => {
    if (searchText.value.length > 2) {
        return tempKeywords
                    .filter(k => k.toLowerCase())
                    .filter(k => !keywords.value.some(kw => kw.toLowerCase() === k)) // already selected keywords
                    .filter(k => k.indexOf(searchText.value.toLowerCase()) !== -1)
    }
    return [];
});

function clickListener() {
    showMenu.value = false;
    if (inputRef.value)
        inputRef.value.focus();
    addKeyword(searchText.value);
    document.removeEventListener("click", clickListener);
}

const showMenu = ref(false);
watch(matchingKeywords, async (kwList, _) => {
    if (kwList.length && !showMenu.value) {
        document.addEventListener("click", clickListener);
        showMenu.value = true;
    } else if (!kwList.length && showMenu.value) {
        showMenu.value = false;
    }
});

function addKeywordFromInput(keyword: string) {
    if (showMenu && matchingKeywords.value.length) return // menu is open
    addKeyword(keyword);
}

function addKeyword(keyword: string) {
    if (keyword.length) {
        if (!keywords.value.some(k => k.toLowerCase() === keyword.toLowerCase())) {
            keywords.value.push(keyword);
            searchText.value = "";
        } else {
            searchText.value = "";
        }
    }
}

function deleteKeyword(i: number) {
    keywords.value.splice(i, 1);
}

console.log(matchingKeywords.value);
</script>

<template>
<div class="relative">
    <div class="cursor-default flex text-sm items-center space-x-2 px-2 min-h-20 bg-white block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
        <div v-for="keyword, i in keywords" class="flex items-center rounded-full pl-2.5 pr-1 bg-pink-200 h-7 border border-gray-700">
            <span class="align-middle mr-1">
                {{keyword}}
            </span>
            <svg @click="deleteKeyword(i)" class="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
            </svg>
        </div>
        <div class="grow" @focusout="addKeywordFromInput(searchText)" >
            <input ref="inputRef" @keyup.enter="addKeyword(searchText)" v-model="searchText" type="text" class="border-none focus:border-none focus:ring-0 h-8 p-0 m-0 w-full">
            <div v-if="showMenu"
                 class="mt-1 absolute">
                <ul class="asolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                    <!--
                        Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

                        Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
                    -->
                    <li v-for="keyword in matchingKeywords"
                        @click="addKeyword(keyword)"
                        class="cursor-pointer text-gray-900 hover:text-white hover:bg-blue-600 cursor-default select-none relative py-2 pl-3 pr-9" id="listbox-option-0" role="option">
                        <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                        <span class="font-normal block truncate">{{keyword}}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <!-- <div v-if="matchingKeywords.length" class="text-white">--- {{matchingKeywords}}</div> -->
</div>
</template>
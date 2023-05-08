<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'

import baseProps from "./formGroupProps"
import FormGroup from "./FormGroup.vue"

// import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'


const props = defineProps({
    ...baseProps,
    ...{
        modelValue: { type: Array as PropType<Array<String>>, default: [] }
    }
});

const emit = defineEmits(['update:modelValue'])

const tempKeywords = ["keyword1", "keyword2", "test"]

const inputRef = ref<HTMLDivElement>();
const inputText = ref("");
const searchText = ref("");
const caretPosition = ref(0)

/**
 * Returns the caret (cursor) position of the specified text field.
 * Return value range is 0-oField.value.length.
 */
function getCaretPosition() {
  // https://stackoverflow.com/a/4812022/1143732
  if (window.getSelection && window.getSelection()?.getRangeAt) {
    const range = window.getSelection()?.getRangeAt(0);
    const selectedObj = window.getSelection();
    let rangeCount = 0;
    const childNodes = selectedObj?.anchorNode?.parentNode?.childNodes;
    if (selectedObj && childNodes) {
        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i] == selectedObj.anchorNode) {
                break;
            }
            if (childNodes[i].outerHTML)
                rangeCount += childNodes[i].outerHTML.length;
            else if (childNodes[i].nodeType === 3) {
                rangeCount += childNodes[i].textContent.length;
            }
        }
        return range.startOffset + rangeCount;
    }
  }
  return -1;
}

/**
 * Sets the caret (cursor) position of the specified text field.
 * Valid positions are 0-oField.value.length.
 */
function setCaret(position: number) {
    const el = inputRef.value;
    const range = document.createRange();
    const sel = window.getSelection();
    
    range.setStart(el.childNodes[0], position);
    range.collapse(true);
    
    sel.removeAllRanges();
    sel.addRange(range);
}

watch(inputText, text => {
    searchText.value = text;
});

const matchingKeywords = computed(() => {
    // find keywords that match the input text
    if (searchText.value.length > 2) {
        return tempKeywords
                    .filter(k => k.toLowerCase())
                    .filter(k => !props.modelValue.some(kw => kw.toLowerCase() === k)) // already selected keywords
                    .filter(k => k.indexOf(searchText.value.toLowerCase()) !== -1)
    }
    return [];
});

function clickListener(evt: Event) {
    evt.stopPropagation();
    
    searchText.value = "";
    setCaret(caretPosition.value)

    // addKeyword(searchText.value);
    document.removeEventListener("click", clickListener);
}

const showMenu = computed(() => matchingKeywords.value.length)

watch(matchingKeywords, (kwList, prev) => {
    if (kwList.length && !prev.length) {
        document.addEventListener("click", clickListener);
    } else if (!kwList.length && prev.length) {
        document.removeEventListener("click", clickListener);
    }
});


function onFocusOut(keyword: string) {
    if (showMenu.value && matchingKeywords.value.length) {
        caretPosition.value = getCaretPosition();
        return; // menu is open
    }
    addKeyword(keyword);
}

function addKeyword(keyword: string) {
    const t = [ ... props.modelValue ];
    if (keyword.length) {
        if (!t.some(k => k.toLowerCase() === keyword.toLowerCase())) {
            t.push(keyword);
            inputText.value = "";
        } else {
            inputText.value = "";
        }
    }
    emit('update:modelValue', t);
}

function deleteKeyword(i: number) {
    const t = [ ...props.modelValue ];
    t.splice(i, 1);
    emit('update:modelValue', t);
}

function onInput(e: any) { //TODO
    inputText.value = e.target.innerText
}
</script>

<template>
    <FormGroup :label="label"
               :description="description"
               :dangerousHtmlDescription="dangerousHtmlDescription">
        <template v-if="edit">
            <div class="relative content-center cursor-default flex flex-wrap gap-x-2 gap-y-1 text-sm items-center px-2 py-0.5 h-10_ bg-white w-full shadow-sm border-gray-300 border rounded-md dark:text-zinc-400 max-w-lg_ sm:text-sm dark:border-black dark:focus:border-black dark:bg-zinc-900">    
                <div v-for="keyword, i in props.modelValue || []" class="text-stone-900 m-0 flex items-center rounded-full pl-2.5 pr-1 bg-amber-400 dark:bg-amber-500 h-7 border border-stone-800">
                    <span class="align-middle">
                        {{keyword}}
                    </span>
                    <svg @click="deleteKeyword(i)" class="ml-0.5 w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="grow h-9" @focusout="onFocusOut(inputText)" >
                    <div contenteditable="true" @input="onInput" ref="inputRef" @keydown.enter="addKeyword(inputText)" @keyup.enter="inputText = ''" type="text"
                        class="cursor-text border-none focus:border-none focus:ring-0 p-0 m-0 w-full mt-1.5 dark:bg-zinc-900">
                        {{inputText}}
                    </div>
                    <div v-if="showMenu"
                        class="mt-1 absolute">
                        <ul class="asolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                            <li v-for="keyword in matchingKeywords"
                                @click="addKeyword(keyword)"
                                class="cursor-pointer text-gray-900 hover:text-white hover:bg-blue-600 select-none relative py-2 pl-3 pr-9" id="listbox-option-0" role="option">
                                <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
                                <span class="font-normal block truncate">{{keyword}}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </template>
        <div v-else>
            {{ (modelValue || []).join(', ') }}
        </div>
    </FormGroup>
</template>

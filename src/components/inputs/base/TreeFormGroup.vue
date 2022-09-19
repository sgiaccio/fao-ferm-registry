<!--
A nested tree component that recursively renders itself.
You can double click on an item to turn it into a folder.
-->

<script setup lang="ts">
import TreeItem from './TreeItem.vue';
import { activities } from '../../../components/project/menus'
</script>

<template>
    <TreeItem class="item" :treeData="activities"></TreeItem>
</template>

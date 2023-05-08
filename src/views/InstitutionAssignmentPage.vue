<script setup lang="ts">
import router from '@/router';

import InstitutionAssignment from './InstitutionsAssignment.vue'


function gotoToProjectList() {
    router.push({ name: 'initiatives' })
}
</script>

<template>
    <div class="mt-10">
        <InstitutionAssignment :onFinished="gotoToProjectList" />
    </div>
</template>

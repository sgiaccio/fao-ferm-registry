<script setup lang="ts">
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';

    import Navbar from '@/views/Navbar.vue';
    import Footer from '@/views/Footer.vue';

    // get current route path
    const route = useRoute();
    const currentPath = computed(() => route.fullPath);
</script>

<template>
    <div class="print:hidden">
        <Navbar class="top-0 left-0 right-0" :class="currentPath.includes('/initiatives/') ? 'fixed' : ''" />
    </div>
    <router-view />
    <Footer class="print:hidden" />
</template>

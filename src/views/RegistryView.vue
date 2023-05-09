<script setup lang="ts">
    import Navbar from '@/views/Navbar.vue';
    import Footer from '@/views/Footer.vue';
</script>

<template>
    <div class="dark:bg-slate-900">
        <Navbar />
    </div>
    <router-view />
    <Footer />
</template>

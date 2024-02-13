<script setup lang="ts">
    import Navbar from '@/views/Navbar.vue';
    import Footer from '@/views/Footer.vue';
</script>

<template>
    <div class="print:hidden">
        <Navbar />
    </div>
    <router-view />
    <Footer class="print:hidden" />
</template>

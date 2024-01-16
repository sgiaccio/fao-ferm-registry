<script setup lang="ts">
    import Navbar from '@/views/Navbar.vue';
    import Footer from '@/views/Footer.vue';
</script>

<template>
    <div>
        <Navbar />
    </div>
    <router-view />
    <Footer />
</template>

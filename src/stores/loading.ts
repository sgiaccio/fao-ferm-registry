// loading.ts
import { defineStore } from 'pinia';

export const useLoadingStore = defineStore({
  id: 'loading',
  state: () => ({
    isLoading: true,
    registryLoaded: false
  }),
  actions: {
    setLoading(value: boolean) {
      this.isLoading = value;
    },
    setRegistryLoaded(value: boolean) {
      this.registryLoaded = value;
    }
  },
});

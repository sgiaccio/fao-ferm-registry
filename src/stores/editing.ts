import { defineStore } from "pinia";

export const useEditingStore = defineStore({
  id: "edit",
  state: () => ({
    editing: false,
  }),
  actions: {
    toggleEditing() {
      this.editing = !this.editing;
    },
  },
});

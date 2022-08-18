import { defineStore } from "pinia";

export const useEditingStore = defineStore({
  id: "edit",
  state: () => ({
    editing: false,
  }),
//   getters: {
//     doubleCount: (state) => state.counter * 2,
//   },
  actions: {
    toggleEditing() {
      this.editing = !this.editing;
    },
  },
});

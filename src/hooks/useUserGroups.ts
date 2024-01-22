import { ref, onMounted, computed } from 'vue';

import { fetchAllGroupNames } from '@/firebase/firestore';

import { useAuthStore } from '@/stores/auth';
import { useCustomAlert} from '@/hooks/useCustomAlert';


export function useUserGroups() {
    const authStore = useAuthStore();
    const customAlert = useCustomAlert();
    const userGroups = ref<{ [key: string]: string }>({});

    onMounted(async () => {
        try {
            await (async () => userGroups.value = authStore.isAdmin ? await fetchAllGroupNames() : authStore.userGroups)()
        } catch (e) {
            console.error(e);
            customAlert('Error', 'Error fetching user groups', 'error');
        }
    });

    const getGroupName = computed(() => (id: string) => userGroups.value[id] || id);

    return { userGroups, getGroupName };
}

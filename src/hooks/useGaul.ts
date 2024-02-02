import { ref, onMounted } from 'vue';
import { getGaulLevel0 } from '@/firebase/firestore';

export function useGaul() {
    const gaulLevel0 = ref([]);

    onMounted(async () => {
        gaulLevel0.value = await getGaulLevel0();
    });

    const findGaulByIso2 = (iso2) => {
        // return gaulLevel0.value.find(i => i.iso2 === iso2)?.value;
        return gaulLevel0.value.find(i => i.iso2 === iso2);
    }

    return { gaulLevel0, findGaulByIso2 };
}

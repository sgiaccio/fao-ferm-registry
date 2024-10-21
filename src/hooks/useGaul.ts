import { ref, onMounted } from 'vue';
import { getGaulLevel0 } from '@/firebase/firestore';

export function useGaul() {
    const gaulLevel0 = ref<any[]>([]);

    onMounted(async () => {
        gaulLevel0.value = await getGaulLevel0();
    });

    const findGaulByIso2 = (iso2: string) => {
        // return gaulLevel0.value.find(i => i.iso2 === iso2)?.value;
        return gaulLevel0.value.find(i => i.iso2 === iso2);
    }

    const getCountryNameByIso2 = (iso2: string) => {
        const gaul = findGaulByIso2(iso2);
        return gaul ? gaul.label : iso2;
    }

    return { gaulLevel0, findGaulByIso2, getCountryNameByIso2 };
}

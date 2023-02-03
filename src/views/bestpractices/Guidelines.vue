<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'


const props = defineProps<{
    open: boolean,
    consentAccepted: boolean
}>();

const emit = defineEmits(['close']);

const accepted = ref(props.consentAccepted);

function close() {
    emit('close', accepted.value);
}
</script>
    
<template>
    <TransitionRoot as="template" :show="props.open">
        <Dialog as="div" class="relative z-10">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel
                            class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                            <div>
                                <div>
                                    <DialogTitle as="h3"
                                        class="text-center text-xl font-semibold leading-6 text-gray-900">Guidelines
                                    </DialogTitle>
                                    <div class="mt-2 text-sm text-gray-600">
                                        <template v-if="consentAccepted">
                                            <p class="italic">
                                                I consented that by submitting this form and attaching the accompanying documents/media, I agree to be contacted by the review panel and to authorize the information/documents to be made publicly available and freely used and amended by FAO in order to prepare for publication on the FERM Platform. 
                                            </p>
                                        </template>
                                        <template v-else>
                                            <p class="italic"><span
                                                class="font-semibold">Consent:</span> By submitting this form and
                                                attaching the accompanying documents/media, you agree to be contacted by
                                                the review panel and to authorize the information/documents to be made
                                                publicly available and freely used and amended by FAO in order to
                                                prepare for publication on the FERM Platform.</p>

                                            <p class="italic mt-2 text-sm text-gray-600">
                                                Please check the box

                                                <div class="italic inline-block align-middle ml-3">
                                                    <div class="relative flex items-start">
                                                        <div class="flex h-5 items-center">
                                                            <input v-model="accepted" id="comments"
                                                                aria-describedby="comments-description" name="comments"
                                                                type="checkbox"
                                                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                        </div>
                                                        <div class="ml-3 text-sm">
                                                            <label for="comments"
                                                                class="font-medium text-gray-700">Yes</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </p>
                                        </template>

                                        <h4 class="mt-3 mb-1 text-base font-semibold leading-6 text-gray-900">
                                            What is a good practice for ecosystem restoration?
                                        </h4>
                                        <p class="text-gray-600">
                                            A good practice for ecosystem restoration is a successful approach, process,
                                            technique or technology that contributed to achieve one or more objectives
                                            of a restoration initiative, maximizing benefits for nature and people.
                                            <span class="font-semibold">It has been tested and replicated in multiple
                                                contexts and therefore, can be easily transferred and/or adapted to
                                                other projects with similar goals</span>. If a practice has been tested
                                            <span class="font-semibold">solely in a specific context</span>, it is
                                            considered a <span class="font-semibold">promising practice</span> that
                                            needs to
                                            be proven for replicability and adaptability to various contexts.
                                        </p>

                                        <h4 class="mt-3 mb-1 text-base font-semibold leading-6 text-gray-900">Guidelines
                                            for submission</h4>
                                        <p>
                                            When preparing your submission, please consider the following
                                            recommendations and information:
                                        </p>
                                        <ol class="list-decimal list-inside">
                                            <li>Check if your restoration practices are <span class="font-semibold">as
                                                    compliant as possible</span> with the <span
                                                    class="font-semibold">ten
                                                    criteria below</span> derived from the <a class="text-blue-600"
                                                    href="https://www.fao.org/documents/card/en/c/cb6591en/">ten
                                                    principles for ecosystem restoration.</a></li>
                                            <li>If any of the practices is protected by a patent or holds any property
                                                rights, <span class="font-semibold">it cannot be considered for the UN
                                                    Decade</span>. </li>
                                            <li>You are welcome to document <span class="font-semibold">good and
                                                    promising</span> practices derived from the restoration initiative
                                                registered in the FERM registry. <span class="font-semibold">Please note
                                                    that the platform allows for documentation of multiple practices per
                                                    each initiative registered</span>. </li>
                                            <li><span class="font-semibold">What will happen after your
                                                    submission?</span>
                                                The information shared will be assessed by a panel of experts based on
                                                the ten criteria below. The practice must meet the minimum score for
                                                each of the criteria. If endorsed, you will then be contacted if any
                                                further information is needed or to confirm that your submission will be
                                                featured on the FERM platform. </li>
                                            <li><span class="font-semibold">What will happen if your good practice
                                                    submission is not accepted?</span> Your submission will not be
                                                accepted if: i) it does not meet the minimum score for any of the
                                                criteria below, or ii) the information is inconsistent or incomplete.
                                                For both cases, you will be notified accordingly and receive feedback
                                                from the review panel so that you can refine and re-submit. </li>
                                        </ol>

                                        <h4 class="mt-3 mb-1 text-base font-semibold leading-6 text-gray-900">Assessment
                                            criteria for a good practice</h4>

                                        <ol class="list-decimal list-inside">
                                            <li><span class="font-semibold">Contributes to the achievement of the
                                                    Sustainable Development Goals (SDGs).</span> The practice
                                                contributes to the achievement of at least one of the 17 Sustainable
                                                Development Goals (SDGs), especially SDGs 3, 13, 14 and 15.</li>
                                            <li><span class="font-semibold">Participatory and inclusive.</span>The
                                                practice
                                                has fostered meaningful and inclusive involvement of stakeholders and
                                                right-holders, particularly from under-represented and often
                                                marginalized groups (e.g., local communities, Indigenous Peoples, ethnic
                                                minorities, women, youth, LGBTIQ+ people, etc.).</li>
                                            <li><span class="font-semibold">Belongs to a restorative activity.</span>The
                                                practice belongs to one or several restoration activities that are part
                                                of the continuum of ecosystem restoration. In addition, it is
                                                technically and/or socially feasible to allow for replication or
                                                adaptability. </li>
                                            <li><span class="font-semibold">Provides several benefits to nature and
                                                    people.</span>The practice has resulted in positive impacts for
                                                nature and people (e.g., by improving biodiversity, ecosystem health and
                                                integrity, human well-being, sustainable production of goods and
                                                services, climate change mitigation, etc.). In addition, the practice
                                                has supported and assisted natural recovery processes, without causing
                                                further degradation of ecosystems and livelihoods. </li>
                                            <li><span class="font-semibold">Addresses causes of ecosystem
                                                    degradation.</span>The practice has contributed to addressing direct
                                                and/or indirect causes of ecosystem degradation.</li>
                                            <li><span class="font-semibold">Integrates different types of
                                                    knowledge.</span>Through its implementation, the practice has
                                                incorporated traditional, local, scientific, and/or other types of
                                                knowledge. </li>
                                            <li><span class="font-semibold">Contributes to ecological, cultural and
                                                    socio-economic objectives of the restoration initiative.</span>The
                                                practice has effectively contributed to the progress of one or several
                                                ecological, cultural and/or socio-economic objectives from the
                                                restoration initiative. </li>
                                            <li><span class="font-semibold">Implemented at different scales.</span>The
                                                practice can be implemented and replicated at different scales (local
                                                and landscape/seascape level). </li>
                                            <li><span class="font-semibold">Properly validated.</span>The practice has
                                                been
                                                properly validated from a technical and methodological point of view, to
                                                demonstrate that it has achieved its goals. In addition, beneficiaries
                                                of the practice have also validated its positive impacts. </li>
                                            <li><span class="font-semibold">Replicable and adaptable.</span>Steps for
                                                implementation, key factors, constraints and lessons learned are clearly
                                                identified and described to allow for replication and adaptation of the
                                                practice to similar objectives in different situations. </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                <button type="button" @click="close"
                                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm">Close</button>
                                <!-- <button type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                                    @click="open = false" ref="cancelButtonRef">Cancel</button> -->
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

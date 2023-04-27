<script setup lang="ts">
import {
  BuildingLibraryIcon,
  GlobeEuropeAfricaIcon,
} from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="bg-white">
    <header class="inset-x-0 top-0">
      <div class="overflow-hidden shadow bg-blue-50 bg-[url('/public/seashore.jpg')] bg-cover bg-center">

        <div class="px-4 sm:px-12 py-12">

          <!-- Logos -->
          <div class="w-full pl-10 flex mb-10">
            <div class="mb-2 sm:mb-5 mt-2 grid grid-flow-col gap-x-6 mx-auto md:mx-0 divide-x divide-gray-300">
              <div class="-ml-10 mr-3">
                <img src="@/assets/FERM_LOGO_MASTER_colour_white_EN.svg"
                     alt="FERM logo"
                     class="h-16 w-auto scale-125" />
              </div>
              <div>
                <img src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg"
                     alt="FERM logo"
                     class="h-16 w-auto scale-150 ml-10" />
              </div>
            </div>
          </div>
          <div class="w-full text-center font-akrobat font-extrabold text-white text-5xl sm:text-6xl">Framework for Ecosystem<br>Restoration Monitoring</div>

          <div class="text-white mt-20 max-w-sm md:max-w-3xl mx-auto grid grid-rows-3 gap-y-4 md:gap-y-0 md:grid-rows-none md:grid-cols-3 md:gap-x-5">
            <router-link :to="{ name: 'initiatives' }"
                         class="bg-ferm-green-dark rounded-xl px-4 py-4 text-left transition-colors hover:bg-ferm-green-light shadow">
              <div class="flex flex-row gap-x-2">
                <div class="mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 24 24"
                       fill="currentColor"
                       class="w-6 h-6">
                    <path fill-rule="evenodd"
                          d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                          clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div class="text-lg font-semibold">Register</div>
                  <div class="text-sm mt-3">Your restoration initiative and good practices</div>
                </div>
              </div>
            </router-link>

            <a href="https://data.apps.fao.org/ferm/"
               target="_blank"
               class="bg-ferm-blue-dark rounded-xl px-4 py-4 text-left transition-colors hover:bg-ferm-blue-light">
              <div class="flex flex-row gap-x-2">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg"
                       fill="none"
                       viewBox="0 0 24 24"
                       stroke-width="1.5"
                       stroke="currentColor"
                       class="w-6 h-6">
                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>

                </div>
                <div>
                  <div class="text-lg font-semibold">Visualize</div>
                  <div class="text-sm mt-3">The latest geospatial data on restoration</div>
                </div>
              </div>
            </a>

            <button class="bg-ferm-mustard-dark rounded-xl px-4 py-4 text-left transition-colors shadow cursor-default">
              <div class="flex flex-row gap-x-2">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg"
                       fill="none"
                       viewBox="0 0 24 24"
                       stroke-width="1.5"
                       stroke="currentColor"
                       class="w-6 h-6">
                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>

                </div>
                <div>
                  <div class="text-lg font-semibold">Search</div>
                  <div class="text-sm mt-3">For good practices on ecosystem restoration</div>
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>






    </header>
  </div>
  <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-6 lg:py-8 font-roboto">
    <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
    <div class="mx-auto max-w-5xl">

      <div class="px-4 lg:px-0 mt-10 text-lg leading-snug font-akrobat font-semibold text-center max-w-xl mx-auto text-gray-700 dark:text-gray-400">The FERM consists of a geospatial platform and a registry of restoration initiatives. It is the official monitoring platform for tracking global progress and disseminating good practices for the UN Decade on Ecosystem Restoration. It also supports countries in reporting areas under restoration for the Kunming-Montreal Global Biodiversity Framework Target 2.</div>

      <div class="px-4 sm:px-0 mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">

        <div class="bg-ferm-blue-light p-4 rounded-xl text-base font-light flex flex-col shadow">
          <div>
            The <span class="font-semibold">FERM Registry</span> provides a harmodized data collection mechanism to aggregate data from restoration platforms.
          </div>
          <div class="flex-grow flex h-full justify-end items-end">
            <BuildingLibraryIcon class="text-white h-12 w-12" />
          </div>
        </div>

        <div class="bg-ferm-green-light p-4 rounded-xl text-base font-light flex flex-col shadow">
          <div>
            The <span class="font-semibold">FERM platform</span> is built on FAO's corporate <span class="whitespace-nowrap">Hand-In-Hand</span> geospatial architecture and provides accessible and transparent information for restoration practitioners.
          </div>
          <div class="flex-grow flex h-full justify-end items-end">
            <GlobeEuropeAfricaIcon class="text-gray-100 h-12 w-12" />
          </div>
        </div>


        <div class="p-4 font-akrobat font-semibold text-white col-span-2 rounded-xl text-sm bg-[url('/public/soil.jpg')] bg-cover bg-center flex lg:h-full justify-end items-end h-48 shadow">
          <div class="px-16 aligh-bottom text-center bottom-3 text-lg brightness-100 z-50 leading-tight">
            Join #GenerationRestoration and share your restoration initiative and good practices with the world.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

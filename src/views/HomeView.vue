<template>
  <div class="bg-white dark:bg-zinc-800">
    <main>
      <div class="relative sm:mt-6 lg:mt-8">
        <!-- <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100 dark:bg-zinc-600"></div> -->
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
            <div class="absolute inset-0">
              <img class="h-full w-full object-cover z-0" src="@/assets/bg.jpg" alt="Green forest" />
              <div class="absolute inset-0 bg-gradient-to-r from-lime-800 to-green-900 mix-blend-multiply" />
            </div>
            <div class="relative px-4 py-16 sm:px-6 sm:py-16 lg:py-24 lg:px-8">
              <img class="mx-auto h-32 w-auto mb-4" src="@/assets/FERM_LOGO_MASTER_colour_white_EN.svg" alt="UN Decade" />
              <h1 class="text-center text-4xl font-extrabold tracking-normal sm:text-5xl lg:text-6xl">
                <span class="block text-gray-200 mb-4">The FERM registry</span>
                <span class="block text-yellow-500">Monitoring restoration</span>
              </h1>
              <p class="mt-10 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">Join #GenerationRestoration and share your restoration initiatives and good practices with the world.</p>
              <div class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div class="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-1 sm:gap-5">
                  <router-link
                    :to="{name: 'initiatives'}"
                    class="text-center flex items-center justify-center px-4 py-3 border border-transparent text-2xl font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 bg-opacity-90 hover:bg-opacity-90 sm:px-8">
                    <div class="flex flex-col">
                      <div class="mb-1 ">Register </div>
                      <div class="text-base tracking-tight">your restoration initiative and good practices </div>
                    </div>
                  </router-link>
                  <a
                    href="https://data.apps.fao.org/ferm/"
                    target="_blank"
                    class="text-center flex items-center justify-center px-4 py-3 border border-transparent text-2xl font-medium rounded-md shadow-sm text-white bg-blue-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8">
                    <div class="flex flex-col">
                      <div class="mb-1 ">Visualize</div>
                      <div class="text-base tracking-tight">on the FERM geospatial platform </div>
                    </div>
                  </a></div>
              </div>
              <p class="mt-12 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">The <span class="font-semibold text-gray-200">FERM registry</span> supports the UN Decade on Ecosystem Restoration Worldwide Flagships, UN member countries and UN supported restoration initiatives to monitor the status of ecosystem restoration.</p>
              <img class="mx-auto h-24 w-auto mt-8 " src="@/assets/UNDecade_LOGO_MASTER_EN_dark_bg.svg" alt="UN Decade" />
            </div>
            
            <!-- </div> -->
            
          </div>
        </div>
      </div>
      <div class="relative pt-16 pb-32 overflow-hidden">
        <div aria-hidden="true" class="absolute inset-x-0 top-0 h-48 _bg-gradient-to-t _from-zinc-600"></div>
        <div class="relative">
          <div class="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24">
            <div class="px-4 max-w-xl mx-auto sm:px-6 lg:py-16 lg:max-w-none lg:mx-0 lg:px-0">
              <div>
                <div class="mt-6">
                  <p class="mt-4 text-lg text-gray-700 dark:text-gray-200">The <span class="font-semibold text-green-700 dark:text-green-500">FERM registry</span> provides a harmonized data collection mechanism to aggregate data from restoration platforms like Restor and the Restoration Barometer.</p>
                  <p class="mt-12 text-lg text-gray-700 dark:text-gray-200">The <span class="font-semibold text-green-700 dark:text-green-500">FERM registry</span> will be used to report on global restoration progress.</p>
                </div>
              </div>
            </div>
            <div class="mt-12 sm:mt-16 lg:mt-0">
              <div class="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img class="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none" src="@/assets/restoration.jpg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

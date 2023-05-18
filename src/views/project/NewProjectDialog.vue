<template>
    <div class="mt-3 max-w-xl text-sm text-gray-500">
        <p>Please provide the name and the reporting line for your new initiative.</p>
    </div>
    <form class="sm:flex sm:items-center text-left">
        <div class="w-full sm:max-w-xs">
            <div class="mt-6">
                <label for="title"
                       class="block text-sm font-medium leading-6 text-gray-900">Name of the initiative</label>
                <div class="mt-2">
                    <input type="text"
                           name="title"
                           id="title"
                           class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                </div>
            </div>
            <div class="mt-6 mb-2">
                <label for="reporting_line"
                       class="block text-sm font-medium leading-6 text-gray-900">Reporting line</label>
                <select id="reporting_line"
                        name="reporting_line"
                        class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <option>FERM</option>
                    <option>GEF</option>
                    <option>CBD</option>
                    <option>DRIP</option>
                </select>
            </div>
        </div>
    </form>
</template>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-3xl dark:text-zinc-300">Characteristics</h1>
        <p class="dark:text-zinc-200">The project area is characterized by a number of default parameters. They are automatically generated for each aoi based on global data sources. More information about the data source will be soon made available.</p>
        <div class="text-sm text-gray-800 dark:text-zinc-300">
            <p>
                <span class="font-bold">Elevation:</span> Shuttle Radar Topography Mission (SRTM) digital elevation dataset with 3 arc second (approx. 90m) spatial resolution. The vertical error of the DEM’s is reported to be less than 16m.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4">https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4</a>
            </p>
            <p class="mt-2">
                <span class="font-bold">Temperature:</span> ERA5 is the fifth generation ECMWF atmospheric reanalysis of the global climate. Monthly aggregates have been calculated based on the ERA5 hourly temperature values.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY">https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY</a>
            </p>
            <p class="mt-2">
                <span class="font-bold">Rainfall:</span> Climate Hazards Group InfraRed Precipitation with Station data (CHIRPS) is a 30+ year quasi-global rainfall dataset. CHIRPS incorporates 0.05° resolution satellite imagery with in-situ station data to create gridded rainfall time series for trend analysis and seasonal drought monitoring.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_PENTAD">https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_PENTAD</a>
            </p>
            <p class="mt-2">
                <span class="font-bold">Land cover:</span> Dynamic Land Cover map at 100 m resolution (CGLS-LC100). Provides provides a primary land cover scheme using PROBA-V 100 m time-series.
                <br>
                Source: <a class="text-blue-600 underlined" target="_blank" href="https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global">https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global</a>
            </p>
        </div>
    </div>
</template>

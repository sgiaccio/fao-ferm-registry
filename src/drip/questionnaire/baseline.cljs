(ns drip.questionnaire.baseline
  (:require
   [ajax.core :refer [GET]]
  ;;  [cljs.core.async :refer [<!]]
  ;;  [cljs-http.client :as http]

   [clojure.string :as str]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.utils :as utils]
   [drip.inputs :as inputs])
  ;; A macro that is used to import macros.
  ;; (:require-macros
  ;;  [cljs.core.async.macros :refer [go]])
  )

(defn parse-query-result [csv]
  (map #(js/parseFloat %) (-> csv (str/split "\n") second (str/split ","))))

(defn fetch-indicator [cursor admin-2 table columns]
  (GET (str "https://api.data.apps.fao.org/api/v2/bigquery?query=SELECT%20" (str/join "," columns) "%20FROM%20%60fao-maps.fao_zonal_stats." table "%60%20WHERE%20ADM2_CODE%3D" admin-2 "%20LIMIT%2010")
    {:format :json
     :handler (fn [r] (let [measure (parse-query-result r)]
                        (js/console.log (clj->js measure))
                        (reset! cursor {:value (first measure) :error (second measure)})))
     :error-handler (fn [r]
                      (js/console.log r)
                      (js/alert r))}))

(defn fetch-shapefile-indicator [{:keys [gee-id area-uuid band start-date end-date categorical f]
                                  :or {band nil start-date nil end-date nil categorical nil}}]
  (js/Promise. (fn [resolve reject]
                 (GET (str "https://europe-west3-fao-ferm2-review.cloudfunctions.net/get_zonal_stats"
                           "?area_uuid=" area-uuid
                           "&gee_id=" gee-id
                           (when band (str "&band=" band))
                           (when start-date (str "&start_date=" start-date))
                           (when end-date (str "&end_date=" end-date))
                           (when categorical "&categorical=true"))
                   {:response-format :json
                    :keywords? true
                    :handler #(-> % f resolve)
                    :error-handler (fn [err]
                                     (js/console.log err)
                                     (js/alert err)
                                     (reject err))})))
  )

;; (defn fetch-indicator_ [crs admin-2 table]
;;   (go (let [response (<! (http/get (str "https://api.data.apps.fao.org/api/v2/bigquery?query=SELECT%20mean,stdDev%20FROM%20%60fao-maps.fao_zonal_stats." table "%60%20WHERE%20ADM2_CODE%3D" admin-2 "%20LIMIT%2010")))]
;;         (prn (:status response))
;;         (prn (:body response)))))

(defn calculate-avg [result key]
  (/ (apply + (map key result)) (count result)))

(defn calculate-avgs [result]
  {:mean (calculate-avg result :mean)
   :min (calculate-avg result :min)
   :max (calculate-avg result :max)})

(defn fetch-indicators [data]
  (let [;; admin-2             (-> @data :admin-area :admin-2 name)
        elevation           (cursor data [:elevation])
        temperature         (cursor data [:temperature])
        rainfall            (cursor data [:rainfall])
        land-cover          (cursor data [:land-cover])
        ;; ;; evapotranspiration  (cursor data [:evapotranspiration])
        ;; ;; TODO: climate domain missing from stats
        ;; ;; TODO: tree cover missing from stats
        ;; land-cover          (cursor data [:land_cover]) ;; TODO handle differently
        ]
    (js/console.log (:shapefile @data))
    ;; Elevation
    (fetch-shapefile-indicator {:gee-id "CGIAR/SRTM90_V4"
                                :area-uuid (:shapefile @data)
                                :f (fn [result] (reset! elevation (calculate-avgs result)))})
    ;; Temperature
    (fetch-shapefile-indicator {:gee-id "ECMWF/ERA5/MONTHLY"
                                :area-uuid (:shapefile @data)
                                :band "mean_2m_air_temperature"
                                :start-date "2015-06-01"
                                :end-date "2020-06-01"
                                :f (fn [result] (reset! temperature (calculate-avgs result)))})
    ;; Precipitation
    (fetch-shapefile-indicator {:gee-id "UCSB-CHG/CHIRPS/PENTAD"
                                :area-uuid (:shapefile @data)
                                :band "precipitation"
                                :start-date "2015-06-01"
                                :end-date "2020-06-01"
                                :f (fn [result] (reset! rainfall (calculate-avgs result)))})
    ;; TODO climate domain
    ;; Land cover
    (fetch-shapefile-indicator {:gee-id "COPERNICUS/Landcover/100m/Proba-V-C3/Global"
                                :area-uuid (:shapefile @data)
                                :band "discrete_classification"
                                :start-date "2015-01-01"
                                :end-date "2019-12-31"
                                :categorical true
                                :f (fn [result] (js/console.log (clj->js result)))})
    ;; Tree cover
    ;; (fetch-shapefile-indicator {:gee-id "NASA/MEASURES/GFCC/TC/v3"
    ;;                             :area-uuid (:shapefile @data)
    ;;                             :band "tree_canopy_cover"
    ;;                             :start-date "2000-01-01"
    ;;                             :end-date "2015-01-01"
    ;;                             :f (fn [result] (reset! rainfall (calculate-avgs result)))})

    ;; (fetch-shapefile-indicator temperature "ECMWF/ERA5/MONTHLY" (:shapefile @data) "mean_2m_air_temperature" "2015-06-01" "2020-06-01" #(js/console.log %))

    ;; (fetch-indicator elevation           admin-2 "fct_CGIAR_SRTM90_V4_FAO_GAUL_SIMPLIFIED_500m_2015_level2"                          ["mean" "stdDev"])
    ;; (fetch-indicator temperature         admin-2 "fct_FERMS_ECMWF_ERA5_MONTHLY_FAO_GAUL_2015_level2"                                 ["mean_2m_air_temperature_mean" "mean_2m_air_temperature_stdDev"])
    ;; ;; rainfall doesn't work
    ;; (fetch-indicator rainfall            admin-2 "fct_FERMS_ECMWF_UCSB_CHG_CHIRPS_PENTAD_FAO_GAUL_2015_level2"                       ["mean" "stdDev"])
    ;; ;; (fetch-indicator evapotranspiration  admin-2 "fct_MODIS_006_MOD16A2_FAO_GAUL_2015_level2" ["ET_mean" "ET_stdDev"])
    ;; (fetch-indicator land-cover          admin-2 "fct_FERMS_lc_traj_globe_2001_2001_to_2015_modis_FAO_GAUL_2015_level2"              ["lc_tr_histogram"])
    ;; ;; (fetch-indicator productivity        admin-2 "fct_FERMS_lp5cl_globe_2001_2015_modis_FAO_GAUL_2015_level2"                        ["constant_mean" "constant_stdDev"])
    ;; ;; (fetch-indicator soil_organic_carbon admin-2 "fct_FERMS_soc_globe_2001_2015_deg_modis_FAO_GAUL_2015_level2"                      ["soc_deg_mean" "soc_deg_stdDev"])
    ;; ;; (fetch-indicator sea_temperature     admin-2 "fct_FERM_JAXA_GCOM-C_L3_OCEAN_SST_V2_FAO_GAUL_2015_level2"                         ["SST_AVE_mean" "SST_AVE_stdDev"])
    ))

    

(defn baseline [data_]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
       [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
        [:h1 {:class "text-3xl"} "Characteristics"]
        [:p "The project area is characterized by a number of default parameters. They are automatically generated for each aoi based on global data sources. More information about the data source will be soon made available. "]
        
        (doall (for [i (range (count @data_))
                     :let [data (r/cursor data_ [i])
                           admin-names (utils/get-admin2-names
                                        (:admin-0 (:admin-area @data))
                                        (:admin-1 (:admin-area @data))
                                        (:admin-2 (:admin-area @data)))]]
                 [:<>
                  [:span {:href "#", :class "mt-5 flex items-center text-sm font-medium", :aria-current "n"}
                   [:span {:class "flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-indigo-600 rounded-full"}
                    [:span {:class "text-indigo-600"} (+ 1 i)]]]


                  
                  [:div {:class "text-xl font-bold"}
                   (cond
                     (some? (:admin-area @data)) [:<>
                                                  (when (:adm0 admin-names) (:adm0 admin-names))
                                                  (when (:adm1 admin-names) (str ", " (:adm1 admin-names)))
                                                  (when (:adm2 admin-names) (str ", " (:adm2 admin-names)))]
                     (some? (:shapefile @data)) "Shapefile"
                     (some? (:draw @data)) "Drawn area")]
                  


                  (when (and @edit
                             (or (:admin-2 (:admin-area @data))
                                 (some? (:shapefile @data))
                                 (some? (:draw @data))))
                    [:button {:on-click #(fetch-indicators data)
                              :class "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"}
                     "Fetch data from HiH"])

                  [:div {:class "divide-y divide-pink-200"}
                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Elevation"
                                       :data            (cursor data [:elevation])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Temperature"
                                       :data            (cursor data [:temperature])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Rainfall"
                                       :data            (cursor data [:rainfall])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Evapotranspiration"
                  ;;                      :data            (cursor data [:evapotranspiration])}]

                   [inputs/text-form-group
                    {:label       "Climate domain"
                     :data        (cursor data [:climate-domain])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Tree cover"
                                       :data            (cursor data [:tree-cover])}]

                   [inputs/text-form-group
                    {:label       "Land cover"
                     :data        (cursor data [:land-cover])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Soil organic carbon"
                  ;;                      :data            (cursor data [:soil_organic_carbon])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Productivity"
                  ;;                      :data            (cursor data [:productivity])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Population"
                  ;;                      :data            (cursor data [:population])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Accessibility to healthcare"
                  ;;                      :data            (cursor data [:accessibility_to_healthcare])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Water occurrence"
                  ;;                      :data            (cursor data [:water_occurrence])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Sea temperature"
                  ;;                      :data            (cursor data [:sea_temperature])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Chlorophyll concentration"
                  ;;                      :data            (cursor data [:chlorophyll_concentration])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Sea salinity"
                  ;;                      :data            (cursor data [:sea_salinity])}]

                  ;;  [inputs/form-group {:input-component #(inputs/measurement {:data %
                  ;;                                                             :edit @edit})
                  ;;                      :label           "Bathimetry"
                  ;;                      :data            (cursor data [:bathimetry])}]
                   ]
                  [:hr {:class "my-10"}]]))]))

        ; DEBUG data structure
        ;; [:hr]
        ;; [:div [:pre (with-out-str (pp/pprint @data_))]]
        

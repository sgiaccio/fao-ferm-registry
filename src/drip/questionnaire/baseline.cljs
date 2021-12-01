(ns drip.questionnaire.baseline
  (:require
   [cljs.pprint :as pp]
   [ajax.core :refer [GET]]

   [clojure.string :as str]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.utils :as utils]
   [drip.inputs :as inputs]))

(defn parse-query-result [csv]
  (map #(js/parseFloat %) (-> csv (str/split "\n") second (str/split ","))))

(defn fetch-indicators [data]
  ;; (js/console.log '------------------------------')
  ;; (js/console.log (clj->js data))
  (let [elevation (cursor data [:elevation])]
    (GET (str "https://api.data.apps.fao.org/api/v1/bigquery?query=SELECT%20mean,stdDev%20FROM%20%60fao-maps.fao_zonal_stats.fct_CGIAR_SRTM90_V4_FAO_GAUL_SIMPLIFIED_500m_2015_level2%60%20WHERE%20ADM2_CODE%3D" (-> @data :admin-area :admin-2 name) "%20LIMIT%2010")
      {:format :json
       :handler (fn [r] (let [measure (parse-query-result r)]
                          (js/console.log (clj->js measure))
                          (reset! elevation {:value (first measure) :error (second measure)})))
       :error-handler (fn [r]
                        (js/console.log r)
                        (js/alert r))})))

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
                  [:br] ;; TODO
                  (or (:adm0 admin-names) "n/a") ", "
                  (or (:adm1 admin-names) "n/a") ", "
                  (or (:adm2 admin-names) "n/a")
                  [:br] ;; TODO

                  (when (and @edit (:admin-2 (:admin-area @data)))
                    [:button {:on-click #(fetch-indicators data)
                              :class "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"}
                     "Fetch data from FERM"])

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

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Evapotranspiration"
                                       :data            (cursor data [:evapotranspiration])}]

                   [inputs/text-form-group
                    {:label       "Climate domain"
                     :data        (cursor data [:climate_domain])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Tree cover"
                                       :data            (cursor data [:tree_cover])}]

                   [inputs/text-form-group
                    {:label       "Land cover"
                     :data        (cursor data [:land_cover])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Soil organic carbon"
                                       :data            (cursor data [:soil_organic_carbon])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Productivity"
                                       :data            (cursor data [:productivity])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Population"
                                       :data            (cursor data [:population])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Accessibility to healthcare"
                                       :data            (cursor data [:accessibility_to_healthcare])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Water occurrence"
                                       :data            (cursor data [:water_occurrence])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Sea temperature"
                                       :data            (cursor data [:sea_temperature])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Chlorophyll concentration"
                                       :data            (cursor data [:chlorophyll_concentration])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Sea salinity"
                                       :data            (cursor data [:sea_salinity])}]

                   [inputs/form-group {:input-component #(inputs/measurement {:data %
                                                                              :edit @edit})
                                       :label           "Bathimetry"
                                       :data            (cursor data [:bathimetry])}]]
                  [:hr {:class "my-10"}]]))

        ; DEBUG data structure
        ;; [:hr]
        ;; [:div [:pre (with-out-str (pp/pprint @data_))]]
        ]))

(ns drip.questionnaire.baseline
  (:require
   [clojure.string :as str]

   [reagent.core :as r :refer [cursor]]

   [cljs.pprint :as pp]
   [ajax.core :refer [POST GET]]

   [drip.inputs :as inputs]

   [drip.config :as config]
   ))

(defn parse-query-result [csv]
  (map #(js/parseFloat %) (-> csv (str/split "\n") second (str/split ","))))

(defn fetch-indicators [data]
  (let [aoi (cursor config/md [:aoi])
        elevation (cursor data [:elevation])]
    (js/console.log @aoi)
    (GET (str "http://api.data.apps.fao.org/api/v1/bigquery?query=SELECT%20mean,stdDev%20FROM%20%60fao-maps.fao_zonal_stats.fct_CGIAR_SRTM90_V4_FAO_GAUL_SIMPLIFIED_500m_2015_level2%60%20WHERE%20ADM2_CODE%3D" (name (:admin-2 @aoi)) "%20LIMIT%2010")
      {:format :json
       :params @data
       :handler (fn [r] (let [measure (parse-query-result r)]
                          (reset! elevation {:value (first measure) :error (second measure)})))
       :error-handler (fn [r] (prn r))})))

(defn baseline [data]
  [:<>
   [:h2 "Default characteristics"]
   
   [:button.btn.btn-primary {:on-click #(fetch-indicators data)}
    "Fetch data from FERM"]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Elevation"
                       :data            (cursor data [:elevation])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Temperature"
                       :data            (cursor data [:temperature])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Rainfall"
                       :data            (cursor data [:rainfall])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Evapotranspiration"
                       :data            (cursor data [:evapotranspiration])}]

   [inputs/text-form-group
    {:label       "Climate domain"
     :data        (cursor data [:climate_domain])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Tree cover"
                       :data            (cursor data [:tree_cover])}]

   [inputs/text-form-group
    {:label       "Land cover"
     :data        (cursor data [:land_cover])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Soil organic carbon"
                       :data            (cursor data [:soil_organic_carbon])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Productivity"
                       :data            (cursor data [:productivity])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Population"
                       :data            (cursor data [:population])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Accessibility to healthcare"
                       :data            (cursor data [:accessibility_to_healthcare])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Water occurrence"
                       :data            (cursor data [:water_occurrence])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Sea temperature"
                       :data            (cursor data [:sea_temperature])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Chlorophyll concentration"
                       :data            (cursor data [:chlorophyll_concentration])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Sea salinity"
                       :data            (cursor data [:sea_salinity])}]

   [inputs/form-group {:input-component #(inputs/measurement {:data %})
                       :label           "Bathimetry"
                       :data            (cursor data [:bathimetry])}]
   
  ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
  ;;                                         {:headers {"x-csrf-token" (.-value (.getElementById js/document "__anti-forgery-token"))}
  ;;                                          :format :json
  ;;                                          :params @data
  ;;                                          ;; :handler handler
  ;;                                          :error-handler (fn [r] (prn r))})}
  ;;   "Save"]

   ; DEBUG data structure
   [:hr]
   [:div [:pre (with-out-str (pp/pprint @data))]]])

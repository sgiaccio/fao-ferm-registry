(ns drip.questionnaire.map-div
  (:require
   [reagent.core :as reagent]
   [ajax.core :refer [POST raw-response-format]]

   ["ol/Map$default" :as Map]
   ["ol/View$default" :as View]
   ["ol/layer/Tile$default" :as TileLayer]
   ["ol/layer/Vector$default" :as VectorLayer]
   ["ol/style" :refer (Stroke Style)]
   ["ol/source" :refer (OSM, Vector) :rename {Vector VectorSource}]
   ["ol/interaction" :refer (Draw Modify Snap)]
   ["ol/format" :refer (GeoJSON)]
   
   [drip.auth :as auth]
   [drip.config :refer [project-id]]))

(def style (Style. #js {:stroke (Stroke. #js {:color "#ffcc33"
                                              :width 2})}))

(defn get-geojson [vector-layer]
  (let [json (.writeFeatures (GeoJSON. #js {:featureProjection "EPSG:3857"}) (.. vector-layer getSource getFeatures))]
    json))

(defn post-geojson [geojson]
  (js/Promise. (fn [resolve reject]
                 (POST "https://europe-west3-fao-ferm2-review.cloudfunctions.net/load_json"
                   {:params {:project_id @project-id
                             :geojson geojson}
                    :headers {:Authorization (str "Bearer " (auth/get-access-token))}
                    :response-format (raw-response-format)
                    :format :url
                    :timeout 10000
                    :handler (fn [response] (resolve response))
                    :error-handler (fn [{:keys [status status-text]}]
                                     (reject status))}))))

(def unique-id (atom 0))
(defn get-unique-id []
  (swap! unique-id inc)
  (str @unique-id))

(defn map-input []
  (let [vector-layer (atom nil)
        map-id (get-unique-id)]
   (reagent/create-class
      {:component-did-mount
       (fn []
         (let [vector-source (VectorSource.)
               vector-l      (VectorLayer. #js {:source vector-source :style style})
               modify        (Modify. #js {:source vector-source})
               draw          (Draw. #js {:source vector-source :type "Polygon"})
               snap          (Snap. #js {:source vector-source})
               m             (Map. (clj->js {:layers #js [(TileLayer. #js {:source (OSM.)}) vector-l]
                                             :target map-id
                                             :view (View. #js {:center #js [0 0]
                                                               :zoom 2})}))]
           (reset! vector-layer vector-l)
           (when true (doto m
                        (.addInteraction modify)
                        (.addInteraction draw)
                        (.addInteraction snap)))))

       ;; name your component for inclusion in error messages
       :display-name "ol-map-component"

       :reagent-render
       (fn []
         [:div
          [:div {:id map-id :style {:height "400px" :width "600px"}}]
          [:button {:type "button"
                    :class "my-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    :on-click #(post-geojson (get-geojson @vector-layer))}
           "Submit"]])})))


;; (defn map-input
;;   [{:keys [placeholder description data edit]}]
;;   [:<>
;;    (if edit
;;      [:input {:type "text"
;;               :class "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
;;               :value       (or @data "")
;;               :placeholder placeholder
;;               :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
;;      (or @data ""))
;;    (when description [:p {:class "mt-2 text-sm text-gray-500"} description])])
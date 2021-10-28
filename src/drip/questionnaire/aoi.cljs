(ns drip.questionnaire.aoi
  (:require
   [cljs.pprint :as pp]
   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.admin2 :as admin2]

   [drip.questionnaire.iso-19115 :refer [iso-19115]]
   
  ;;  ["react-leaflet" :refer (MapContainer, TileLayer, Marker, Popup)]
   ;;import * as ol from 'openlayers';
  ;;  ["ol" :as ol]
  ;;  ["react-openlayers" :refer (interaction, layer, custom, control, ;;name spaces
  ;;                 Interactions, Overlays, Controls,     ;;group
  ;;                 Map, Layers, Overlay, Util)]    ;;objects
   ))

;; (js/alert ol)

(defn admin2 [{:keys [data edit]}]
  (let [country          (cursor data [:admin-0])
        region           (cursor data [:admin-1])
        province         (cursor data [:admin-2])

        regions          (r/atom [])
        provinces        (r/atom [])

        reset-region     (atom false)
        reset-province   (atom false)

        countries-menu   (map #(-> [(:code %) (:name %)]) admin2/admin2)

        update_regions   (fn []
                           (let [c (-> (filter #(= (keyword (:code %)) (keyword @country)) admin2/admin2) first)]
                             (reset! regions (:children c))
                             ;; Reset region and province only after first load
                             (when @reset-region
                               (reset! region nil)
                               (reset! province nil))
                             (reset! reset-region true)))
        _                @(r/track update_regions)
        regions-menu     (make-reaction
                          (fn [] (map #(-> [(:code %) (:name %)]) @regions)))

        update_provinces (fn []
                           (let [c (-> (filter #(= (keyword (:code %)) (keyword @region)) @regions) first)]
                             (reset! provinces (:children c))
                             (when @reset-province
                               ;; Reset province only after first load
                               (reset! province nil))
                             (reset! reset-province true)))
        _                @(r/track update_provinces)

        provinces-menu   (make-reaction
                          (fn [] (map #(-> [(:code %) (:name %)]) @provinces)))]
    [:<>
     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options countries-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Country"
                         :data            (cursor data [:admin-0])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @regions-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Administrative name (level 1)"
                         :data            (cursor data [:admin-1])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @provinces-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Administrative name (level 2)"
                         :data            (cursor data [:admin-2])}]
     [inputs/text-form-group {:label "Site name"
                              :data  (cursor data [:site-name])
                              :edit  edit}]]))

(defn aoi [{:keys [aoiData mdData]}]
  ;; (js/console.log (clj->js aoiData))
  ;; TODO - clean-up; generalize tree menus
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))
        ;; countries-menu (map #(-> [(:code %) (:name %)]) admin2/admin2)
        ;; country (cursor data [:admin-0])
        ;; regions (make-reaction
        ;;          (fn [] (let [c (-> (filter #(= (keyword (:code %)) @country) admin2/admin2) first)]
        ;;                   (:children c))))
        ;; regions-menu (make-reaction
        ;;               (fn [] (map #(-> [(:code %) (:name %)]) @regions)))
        ;; region (cursor data [:admin-1])
        ;; provinces (make-reaction
        ;;            (fn [] (let [c (-> (filter #(= (keyword (:code %)) @region) @regions) first)]
        ;;                     (:children c))))
        ;; provinces-menu (make-reaction
        ;;                 (fn [] (map #(-> [(:code %) (:name %)]) @provinces)))
        ]

    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Area of Interest (AOI)"]

     [:p "Identification of geographic areas of ecosystem restoration is key for geospatial applications. One project implements ecosystem restoration in one or more geographic areas. Projects can identify one or more project areas. Identification of activities, indicators, characterization and results will be provided for each area of interest. Geographic areas can be identified based on (1) administrative areas, (2) polygons/vector information provided and/or (3) drawn directly on the platform."]

     [:h3 "Please choose one or more level 2 administrative areas"]


    ;;  [inputs/multi-form-group-2 {:input-components {:date #(inputs/date-and-type-input {:data % :edit @edit})}
    ;;                              :new-data         {:date {:type nil :date nil}}
    ;;                              :label            "Dates"
    ;;                              :add-labels       {:date "date"}
    ;;                              :data             (cursor data [:citation :dates])
    ;;                              :edit             @edit}]

  ;;  [inputs/multi-form-group-2 {:input-components {:keyword #(inputs/keywords {:data %})
  ;;                                                 :text    #(inputs/text-input {:data %})}
  ;;                              :new-data         {:keyword {:type :author :keywords ["new kw"]}
  ;;                                                 :text "new text"}
  ;;                              :label            "Keywords or text"
  ;;                              :add-labels       {:text "Text" :keyword "Keyword"}
  ;;                              :data             (cursor data [:multi-type-input-test])}]

    ;;  [inputs/multi-form-group-2 {:input-components {:l1 #(inputs/date-and-type-input {:data % :edit @edit})}
    ;;                              :new-data         {:date {:type nil :date nil}}
    ;;                              :label            "Dates"
    ;;                              :add-labels       {:date "date"}
    ;;                              :data             (cursor data [:citation :dates])
    ;;                              :edit             @edit}]
     [inputs/multi-form-group {:input-components {:admin-area #(admin2 {:data %
                                                                        :edit @edit})}
                               :new-data   {:admin-area {}}
                               :label      "Admin areas"
                               :add-labels {:admin-area "admin2 area"}
                               :data       aoiData
                               :edit       @edit}]

     [:h1 {:class "text-3xl pt-10"} "ISO 19115 metadata"]
     [iso-19115 mdData]
    ;;  (js/console.log data)
    ;;  [admin2 {:data data :edit (r/atom true)}]

    ;;  [inputs/form-group {:input-component (fn [data]
    ;;                                         (inputs/select-input {:options countries-menu
    ;;                                                               :data    data
    ;;                                                               :edit    @edit}))
    ;;                      :label           "Country"
    ;;                      :data            (cursor data [:admin-0])}]

    ;;  [inputs/form-group {:input-component (fn [data]
    ;;                                         (inputs/select-input {:options @regions-menu
    ;;                                                               :data    data
    ;;                                                               :edit    @edit}))
    ;;                      :label           "Administrative name (level 1)"
    ;;                      :data            (cursor data [:admin-1])}]

    ;;  [inputs/form-group {:input-component (fn [data]
    ;;                                         (inputs/select-input {:options @provinces-menu
    ;;                                                               :data    data
    ;;                                                               :edit    @edit}))
    ;;                      :label           "Administrative name (level 2)"
    ;;                      :data            (cursor data [:admin-2])}]





;; <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
;;   <TileLayer
;;     attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
;;     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
;;   />
;;   <Marker position={[51.505, -0.09]}>
;;     <Popup>
;;       A pretty CSS3 popup. <br /> Easily customizable.
;;     </Popup>
;;   </Marker>
;; </MapContainer>

    ;; [:> MapContainer
    ;;  {:center [51.505, -0.09] :zoom 13 :scrollWheelZoom false}
    ;;    [:> TileLayer
    ;;     {:attribution "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"
    ;;      :url "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}]]


;; var tileSource = new ol.source.Stamen({
;;   layer: 'toner'
;; });







    ;; (let [tileSource ((.. ol -source -Stamen) {:layer 'toner'})]
    ;;   [:> Map {:view {:center [0 0], :zoom 2}}
    ;;    [:> Layers
    ;;     [:> (.. layer Tile) {:source tileSource}]]
    ;;       ;;      <Layers>
    ;;       ;;   <layer.Tile source={tileSource}/>
    ;;       ;;   <layer.Vector 
    ;;       ;;     source={vectorSource} 
    ;;       ;;     style={cluster.vectorStyleFunction}/>
    ;;       ;; </Layers>
    ;;    ])

    ;;  (when @edit
    ;;    [:<>
    ;;     [:h3 "Or upload the shapefile of the area"]
    ;;     [:div.form-group
    ;;      [:label {:for "exampleFormControlFile1"} "Example file input"]
    ;;      [:input.form-control-file {:type "file"
    ;;                                 :id   "exampleFormControlFile1"}]]])

     ; TODO: add shapefile upload
     ; TODO: add area draw

   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
     ]))

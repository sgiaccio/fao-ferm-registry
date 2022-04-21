(ns drip.questionnaire.iso-19115
  (:require
   [reagent.core :as r :refer [cursor with-let]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
  ;;  [drip.menus :as menus]
   [cljs.pprint :as pp]))


;; (def xml (r/atom ""))

(defn iso-19115 [data]
  (with-let [edit (make-reaction (fn []
                                   (and
                                    (some? @userid)
                                    (or
                                     @is-admin
                                     (= @userid (:uid @md))
                                     (nil? (:uid @md))))))]
    ;; [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
    [:<>
     [:p [:span {:class "font-bold"} "Geospatial Metadata definition"]
      ": Defines the schema required for describing geographic information and services using metadata. It provides information about the identification, the extent, the quality, the spatial and temporal aspects, the content, the spatial reference, the portrayal, distribution, and other properties of digital geographic data and services ("
      [:a {:class "text-blue-700 hover:underline" :href "https://www.iso.org/standard/53798.html"} "https://www.iso.org/standard/53798.html"]
      ")"]
     [:div {:class "divide-y divide-pink-200"}
    ;;  [inputs/text-form-group
    ;;   {:label       "Title"
    ;;    :placeholder "Enter title"
    ;;    :description "The title of the dataset"
    ;;    :data        (cursor data [:citation :title])
    ;;    :edit        @edit}]

    ;;  [inputs/form-group {:input-component #(inputs/select-input {:options menus/currencies
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})
    ;;                      :label           "Currency (not ISO)"
    ;;                      :data            (cursor data [:currency])}]


     ;; Dates - TODO avoid passing :edit twice
      [inputs/multi-form-group {:input-components {:date #(inputs/date-and-type-input {:data % :edit @edit})}
                                :new-data         {:date {:type nil :date nil}}
                                :label            "Dates"
                                ;; :description      [:<> "Creation: Date identifies when the resource was brought into existence"
                                ;;                    [:br]
                                ;;                    "Publication: Date identifies when the resource was issued"
                                ;;                    [:br]
                                ;;                    "Revision: Date identifies when the resource was examined or re-examined and improved or amended"]
                                :add-labels       {:date "date"}
                                :data             (cursor data [:citation :dates])
                                :edit             @edit}]



      ;; [inputs/textarea-form-group {:label       "Abstract"
      ;;                              :placeholder "Enter abstract"
      ;;                              :description "Brief narrative summary of the content of the resource(s)"
      ;;                              :data        (cursor data [:abstract])
      ;;                              :edit        @edit}]

      ;; Moved to Project tab
      ;; [inputs/textarea-form-group {:label       "Purpose"
      ;;                              :placeholder "Enter purpose"
      ;;                              :description "Summary of the intentions with which the resource(s) was developed"
      ;;                              :data        (cursor data [:purpose])
      ;;                              :edit        @edit}]

     ;;  Status
    ;;  [inputs/form-group {:input-component #(inputs/select-input {:options menus/status-items
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})
    ;;                      :label           "Status"
    ;;                      :data            (cursor data [:status])}]

     ;;  Points of contact - moved to Projects tab
      ;; [inputs/multi-form-group {:input-components {:poc #(inputs/point-of-contact {:data %
      ;;                                                                              :edit @edit})}
      ;;                           :new-data         {:poc {:role            nil
      ;;                                                    :organization    nil
      ;;                                                    :individual-name nil
      ;;                                                    :address         nil
      ;;                                                    :email           nil}}
      ;;                           :label            "Points of contact"
      ;;                           :add-labels       {:poc "point of contact"}
      ;;                           :data             (cursor data [:points-of-contact])
      ;;                           :edit             @edit}]

      ;; Topic categories - moved to Project tab
      ;; [inputs/multi-form-group {:input-components {:topic-category #(inputs/select-input {:options menus/topic-categories
      ;;                                                                                     :info [:<>
      ;;                                                                                            [:p "Biota: Biologic and Ecologic Information Flora and/or fauna in natural environment."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: wildlife, vegetation, biological sciences, ecology, wilderness, sealife, wetlands, habitat"]
      ;;                                                                                            [:p "Boundaries: Administrative Legal land descriptions and Political Boundaries."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: political and administrative boundaries"]
      ;;                                                                                            [:p "Climatology, meteorology, atmosphere: Atmospheric and Climatic Data Processes and phenomena of the atmosphere."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: cloud cover, weather, climate, atmospheric conditions, climate change, precipitation"]
      ;;                                                                                            [:p "Economy: Business and Economic Information, Economic activities, conditions and employment."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: production, labour, revenue, commerce, industry, tourism and ecotourism, forestry, fisheries, commercial or subsistence hunting, exploration and exploitation of resources such as minerals, oil and gas"]
      ;;                                                                                            [:p "Elevation: Elevation and Derived Products, Height above or below sea level."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: altitude, bathymetry, digital elevation models, slope, derived products"]
      ;;                                                                                            [:p "Environment: Environmental Monitoring and Modeling, Environmental resources, protection and conservation."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: environmental pollution, waste storage and treatment, environmental impact assessment, monitoring environmental risk, nature reserves, landscape"]
      ;;                                                                                            [:p "Farming: Agriculture and Farming Rearing of animals and/or cultivation of plants."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: agriculture, irrigation, aquaculture, plantations, herding, pests and diseases affecting crops and livestock"]
      ;;                                                                                            [:p "Geoscientific information: Geologic and Geophysical Information, Information pertaining to earth sciences"
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: geophysical features and processes, geology, minerals, sciences dealing with the composition, structure and origin of the earth’s rocks, risks of earthquakes, volcanic activity, landslides, gravity information, soils, permafrost, hydrogeology, erosion"]
      ;;                                                                                            [:p "Health: Health, health services, human ecology, and Disease safety."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: disease and illness, factors affecting health, hygiene, substance abuse, mental and physical health, health services"]
      ;;                                                                                            [:p "Imagery, base, maps, earth cover: Base maps"
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: land cover, topographic maps, imagery, unclassified images, annotations"]
      ;;                                                                                            [:p "Inland waters: Inland Water Resources and Characteristics, Inland water features, drainage systems and their characteristics."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: rivers and glaciers, salt lakes, water utilization plans, dams, currents, floods, water quality, hydrographic charts"]
      ;;                                                                                            [:p "Intelligence military: Military bases, structures, activities"
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: barracks, training grounds, military transportation, information collection"]
      ;;                                                                                            [:p "Location: Geodetic Networks Positional information and services and Control Points."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: addresses, geodetic networks, control points, postal zones and services, place names"]
      ;;                                                                                            [:p "Oceans: Ocean and Estuarine Resources and Characteristics (excluding inland waters), Features and characteristics of salt water bodies."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: tides, tidal waves, coastal information, reefs"]
      ;;                                                                                            [:p "Planning cadastre: Cadastral and Legal Land Descriptions. Information used for appropriate actions for future use of the land."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: land use maps, zoning maps, cadastral surveys, land ownership"]
      ;;                                                                                            [:p "Society: Society and Cultural and Demographic Information, Characteristics of society and cultures."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: settlements, anthropology, archaeology, education, traditional beliefs, manners and customs, demographic data, recreational areas and activities, social impact assessments, crime and justice, census information"]
      ;;                                                                                            [:p "Structure: Facilities, Man-made construction, Buildings and Structures."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: buildings, museums, churches, factories, housing, monuments, shops, towers"]
      ;;                                                                                            [:p "Transportation: Transportation Means and aids for conveying persons and/or goods, Networks and Models."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: roads, airports/airstrips, shipping routes, tunnels, nautical charts, vehicle or vessel location, aeronautical charts, railways"]
      ;;                                                                                            [:p "Utilities, communication: Utility Distribution Networks, Energy, water and waste systems and communications infrastructure and services."
      ;;                                                                                             [:br]
      ;;                                                                                             "Examples: hydroelectricity, geothermal, solar and nuclear sources of energy, water purification and distribution, sewage collection and disposal, electricity and gas distribution, data communication, telecommunication, radio, communication networks"]]
      ;;                                                                                     :data    %
      ;;                                                                                     :edit    @edit})}
      ;;                           :new-data         {:topic-category nil}
      ;;                           :label            "Topic categories"
      ;;                           :add-labels       {:topic-category "Topic category"}
      ;;                           :data             (cursor data [:topic-categories])
      ;;                           :edit             @edit}]

    ;;  ;;  Topic categories
    ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/keywords
    ;;                                                                       :data    %
    ;;                                                                       :edit    @edit})
    ;;                      :label           "Topic categories"
    ;;                      :data            (cursor data [:topic-categories])}]

     ;;  Keywords - moved to Project tab
      ;; [inputs/multi-form-group {:input-components {:keyword-group #(inputs/keywords {:data %
      ;;                                                                                :edit @edit})}
      ;;                           :new-data         {:keyword-group {:type :place :keywords []}}
      ;;                           :label            "Keywords"
      ;;                           :add-labels       {:keyword-group "keyword type"}
      ;;                           :data             (cursor data [:keywords])
      ;;                           :edit             @edit}]

      ;; [inputs/date-form-group
      ;;  {:label       "Begin date"
      ;;   :data        (cursor data [:begin-date])
      ;;   :edit        @edit}]

      ;; [inputs/date-form-group
      ;;  {:label       "End date"
      ;;   :data        (cursor data [:end-date])
      ;;   :edit        @edit}]
  ;;  Demo single-type field group
  ;;  [inputs/multi-form-group-2 {:input-components {:text    #(inputs/text-input {:data %})}
  ;;                              :new-data         {:text "new text"}
  ;;                              :label            "text test"
  ;;                              :add-labels       {:text "Text"}
  ;;                              :data             (cursor data [:multi-type-input-test2])}]

  ;;  ; Demo multy-type field group
  ;;  [inputs/multi-form-group-2 {:input-components {:keyword #(inputs/keywords {:data %})
  ;;                                                 :text    #(inputs/text-input {:data %})}
  ;;                              :new-data         {:keyword {:type :author :keywords ["new kw"]}
  ;;                                                 :text "new text"}
  ;;                              :label            "Keywords or text"
  ;;                              :add-labels       {:text "Text" :keyword "Keyword"}
  ;;                              :data             (cursor data [:multi-type-input-test])}]

  ;; ; Demo multy-type field group
  ;; ;;  [inputs/multi-form-group
  ;; ;;   {:input-component #(inputs/text-input {:placeholder "Placeholder"
  ;; ;;                                          :description "This is the description"
  ;; ;;                                          :data        %})
  ;; ;;    :new-data        nil
  ;; ;;    :label           "Test multi text"
  ;; ;;    :data            (cursor data [:test-multi-text])}]

  ;;  [inputs/text-form-group
  ;;   {:label       "test text"
  ;;    :description "This is the help text"
  ;;    :placeholder "Acdsdf"
  ;;    :data        (cursor data [:test-text])}]
  ;;  [inputs/form-group
  ;;   {:input-component #(inputs/text-input {:data %})
  ;;    :label           "Test text"
  ;;    :data            (cursor data [:test-text])}]

  ;; ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
  ;; ;;                                         {:headers {"x-csrf-token" (.-value (.getElementById js/document "__anti-forgery-token"))}
  ;; ;;                                          :format :json
  ;; ;;                                          :params @data
  ;; ;;                                          :handler (fn [r] (reset! xml r))
  ;; ;;                                          :error-handler (fn [r] (prn r))})}
  ;; ;;   "Save"]
  ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
  ;;                                         {:format :json
  ;;                                          :params @data
  ;;                                          :handler (fn [r] (reset! xml r))
  ;;                                          :error-handler (fn [r] (prn r))})}
  ;;   "Save"]

   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
    ;;  [:div [:pre @xml]]
      ]]))

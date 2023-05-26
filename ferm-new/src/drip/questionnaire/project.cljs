(ns drip.questionnaire.project
  (:require
  ;;  [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor with-let]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin project-id]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn project [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    (with-let [;;  agencies-list (atom nil)
              ;;  _ (.then (get-agencies) #(reset! agencies-list %))
               ]
      ;; (js/console.log agencies-list)
      [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
       [:h1 {:class "text-3xl"} "Project registration"]
       [:p "In this tab, basic information about your project is needed. The title and a summary of the aims and expected results of the project can be provided in the description section. You also need to provide further information such as when the project is expected to start and end, sources of funding and responsible organisms."]
       [:div {:class "my-6 font-bold"} "uuid: "
        [:span {:class "font-mono"} (:uuid @data)]]
       [:div {:class "divide-y divide-pink-200"}

        [inputs/text-form-group
         {:label       "Title"
          :description "Provide the title of your project as it is stated in the official project document"
          :data        (cursor data [:title])
          :edit        @edit}]

        [inputs/textarea-form-group
         {:label       "Description"
          :description "Describe briefly the main objective(s) and activity of your project (maximum 4 lines)"
          :data        (cursor data [:description])
          :edit        @edit}]

    ;;  [inputs/number-form-group
    ;;   {:label       "Version"
    ;;    :data        (cursor data [:version])
    ;;    :edit        @edit}]

    ;;  [inputs/text-form-group
    ;;   {:label       "Project ID"
    ;;    :data        (cursor data [:project-id])
    ;;    :edit        @edit}]

        [inputs/date-form-group
         {:label       "Starting date"
          :description "Date when the project started"
          :data        (cursor data [:starting-date])
          :edit        @edit}]

        [inputs/date-form-group
         {:label       "Ending date"
          :description "Date when the project finished"
          :data        (cursor data [:ending-date])
          :edit        @edit}]

        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/agencies
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Reporting agency"
        ;;                     :data            (cursor data [:reporting-agencies])}]

        ;; [inputs/multi-form-group {:input-components {:executing-agency #(inputs/agency-input {:data % :edit @edit})}
        ;;                           :new-data         {:executing-agency {:agency nil :role nil}}
        ;;                           :label            "Executing agencies"
        ;;                           :add-labels       {:executing-agency "agency"}
        ;;                           :data             (cursor data [:executing-agencies])
        ;;                           :edit             @edit}]

    ;;  [inputs/multi-form-group-2 {:input-components {:reason #(inputs/select-input {:options menus/partially-achieved-reasons
    ;;                                                                                :data    %
    ;;                                                                                :edit    @edit})}
    ;;                              :new-data   {:reason nil}
    ;;                              :label      "If partially achieved, choose from list"
    ;;                              :add-labels {:reason "reason"}
    ;;                              :data       (cursor data [:partially-achieved-reasons])
    ;;                              :edit       @edit}]

    ;;  [inputs/form-group {:input-component #(inputs/select-input {:options menus/agencies
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})
    ;;                      :label           "Executing agency"
    ;;                      :data            (cursor data [:executing-agencies])}]

    ;;  [inputs/form-group {:input-component #(inputs/select-input {:options menus/agency-roles
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})
    ;;                      :label           "Executing agency role"
    ;;                      :data            (cursor data [:agency-role])}]

        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/project-statuses
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Project status"
        ;;                     :data            (cursor data [:project-status])}]


        ;; [inputs/number-form-group
        ;;  {:label       "Total Budget [USD]"
        ;;   :data        (cursor data [:budget])
        ;;   :edit        @edit}]


    ;;  [inputs/date-form-group
    ;;   {:label       "Begin date"
    ;;    :data        (cursor data [:begin-date])
    ;;    :edit        @edit}]

    ;;  [inputs/date-form-group
    ;;   {:label       "End date"
    ;;    :data        (cursor data [:end-date])
    ;;    :edit        @edit}]


        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/funding-sources
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Source of funding"
        ;;                     :data            (cursor data [:funding-source])}]

        ;; [inputs/textarea-form-group {:label "Donors"
        ;;                              :data  (cursor data [:donors])
        ;;                              :edit  @edit}]

        ;; [inputs/document-form-group {:label "Document link"
        ;;                              :data  (cursor data [:docuent-link])
        ;;                              :edit  @edit}]
        [inputs/form-group {:input-component (fn [data]
                                               (inputs/document-input {;;:path "https://europe-west3-fao-ferm2-review.cloudfunctions.net/parse_multipart"
                                                                       :path (str @project-id "/documents")
                                                                       :label "Shapefile"
                                                                       :data  (r/atom 1)
                                                                       :edit  edit}))
                            :label           "Document"
                            :data            data}]

        ;; [inputs/text-form-group {:label "Document title"
        ;;                          :data  (cursor data [:docuent-title])
        ;;                          :edit  @edit}]

        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/document-formats
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Document format"
        ;;                     :data            (cursor data [:document-format])}]

        [inputs/textarea-form-group {:label       "Project Objectives"
                                     :placeholder "Describe the project objectives"
                                     :description "Summary of the intentions with which the resource(s) was developed"
                                     :data        (cursor data [:purpose])
                                     :edit        @edit}]

        [inputs/multi-form-group {:input-components {:poc #(inputs/point-of-contact {:data %
                                                                                     :edit @edit})}
                                  :new-data         {:poc {:role            nil
                                                           :organization    nil
                                                           :individual-name nil
                                                           :address         nil
                                                           :email           nil}}
                                  :label            "Points of contact"
                                  :add-labels       {:poc "point of contact"}
                                  :data             (cursor data [:points-of-contact])
                                  :edit             @edit}]

        
      [inputs/multi-form-group {:input-components {:keyword-group #(inputs/keywords {:data %
                                                                                     :edit @edit})}
                                :new-data         {:keyword-group {:type :place :keywords []}}
                                :label            "Keywords"
                                :add-labels       {:keyword-group "keyword type"}
                                :data             (cursor data [:keywords])
                                :edit             @edit}]




        [inputs/multi-form-group {:input-components {:topic-category #(inputs/select-input {:options menus/topic-categories
                                                                                            :info [:<>
                                                                                                   [:p "Biota: Biologic and Ecologic Information Flora and/or fauna in natural environment."
                                                                                                    [:br]
                                                                                                    "Examples: wildlife, vegetation, biological sciences, ecology, wilderness, sealife, wetlands, habitat"]
                                                                                                   [:p "Boundaries: Administrative Legal land descriptions and Political Boundaries."
                                                                                                    [:br]
                                                                                                    "Examples: political and administrative boundaries"]
                                                                                                   [:p "Climatology, meteorology, atmosphere: Atmospheric and Climatic Data Processes and phenomena of the atmosphere."
                                                                                                    [:br]
                                                                                                    "Examples: cloud cover, weather, climate, atmospheric conditions, climate change, precipitation"]
                                                                                                   [:p "Economy: Business and Economic Information, Economic activities, conditions and employment."
                                                                                                    [:br]
                                                                                                    "Examples: production, labour, revenue, commerce, industry, tourism and ecotourism, forestry, fisheries, commercial or subsistence hunting, exploration and exploitation of resources such as minerals, oil and gas"]
                                                                                                   [:p "Elevation: Elevation and Derived Products, Height above or below sea level."
                                                                                                    [:br]
                                                                                                    "Examples: altitude, bathymetry, digital elevation models, slope, derived products"]
                                                                                                   [:p "Environment: Environmental Monitoring and Modeling, Environmental resources, protection and conservation."
                                                                                                    [:br]
                                                                                                    "Examples: environmental pollution, waste storage and treatment, environmental impact assessment, monitoring environmental risk, nature reserves, landscape"]
                                                                                                   [:p "Farming: Agriculture and Farming Rearing of animals and/or cultivation of plants."
                                                                                                    [:br]
                                                                                                    "Examples: agriculture, irrigation, aquaculture, plantations, herding, pests and diseases affecting crops and livestock"]
                                                                                                   [:p "Geoscientific information: Geologic and Geophysical Information, Information pertaining to earth sciences"
                                                                                                    [:br]
                                                                                                    "Examples: geophysical features and processes, geology, minerals, sciences dealing with the composition, structure and origin of the earth’s rocks, risks of earthquakes, volcanic activity, landslides, gravity information, soils, permafrost, hydrogeology, erosion"]
                                                                                                   [:p "Health: Health, health services, human ecology, and Disease safety."
                                                                                                    [:br]
                                                                                                    "Examples: disease and illness, factors affecting health, hygiene, substance abuse, mental and physical health, health services"]
                                                                                                   [:p "Imagery, base, maps, earth cover: Base maps"
                                                                                                    [:br]
                                                                                                    "Examples: land cover, topographic maps, imagery, unclassified images, annotations"]
                                                                                                   [:p "Inland waters: Inland Water Resources and Characteristics, Inland water features, drainage systems and their characteristics."
                                                                                                    [:br]
                                                                                                    "Examples: rivers and glaciers, salt lakes, water utilization plans, dams, currents, floods, water quality, hydrographic charts"]
                                                                                                   [:p "Intelligence military: Military bases, structures, activities"
                                                                                                    [:br]
                                                                                                    "Examples: barracks, training grounds, military transportation, information collection"]
                                                                                                   [:p "Location: Geodetic Networks Positional information and services and Control Points."
                                                                                                    [:br]
                                                                                                    "Examples: addresses, geodetic networks, control points, postal zones and services, place names"]
                                                                                                   [:p "Oceans: Ocean and Estuarine Resources and Characteristics (excluding inland waters), Features and characteristics of salt water bodies."
                                                                                                    [:br]
                                                                                                    "Examples: tides, tidal waves, coastal information, reefs"]
                                                                                                   [:p "Planning cadastre: Cadastral and Legal Land Descriptions. Information used for appropriate actions for future use of the land."
                                                                                                    [:br]
                                                                                                    "Examples: land use maps, zoning maps, cadastral surveys, land ownership"]
                                                                                                   [:p "Society: Society and Cultural and Demographic Information, Characteristics of society and cultures."
                                                                                                    [:br]
                                                                                                    "Examples: settlements, anthropology, archaeology, education, traditional beliefs, manners and customs, demographic data, recreational areas and activities, social impact assessments, crime and justice, census information"]
                                                                                                   [:p "Structure: Facilities, Man-made construction, Buildings and Structures."
                                                                                                    [:br]
                                                                                                    "Examples: buildings, museums, churches, factories, housing, monuments, shops, towers"]
                                                                                                   [:p "Transportation: Transportation Means and aids for conveying persons and/or goods, Networks and Models."
                                                                                                    [:br]
                                                                                                    "Examples: roads, airports/airstrips, shipping routes, tunnels, nautical charts, vehicle or vessel location, aeronautical charts, railways"]
                                                                                                   [:p "Utilities, communication: Utility Distribution Networks, Energy, water and waste systems and communications infrastructure and services."
                                                                                                    [:br]
                                                                                                    "Examples: hydroelectricity, geothermal, solar and nuclear sources of energy, water purification and distribution, sewage collection and disposal, electricity and gas distribution, data communication, telecommunication, radio, communication networks"]]
                                                                                            :data    %
                                                                                            :edit    @edit})}
                                  :new-data         {:topic-category nil}
                                  :label            "Topic categories"
                                  :add-labels       {:topic-category "Topic category"}
                                  :data             (cursor data [:topic-categories])
                                  :edit             @edit}]
        




        [inputs/form-group {:input-component #(inputs/select-input {:options menus/reporting-processes
                                                                    :data    %
                                                                    :edit    @edit})
                            :label           "Reporting process"
                            :data            (cursor data [:reporting-process])}]]

   ; DEBUG data structure
      ;;  [:hr]
      ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
       ])))

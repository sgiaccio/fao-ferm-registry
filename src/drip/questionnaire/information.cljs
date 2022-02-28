(ns drip.questionnaire.information
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))


(defn information [data]
  (let [edit (make-reaction (fn []
                                   (and
                                    (some? @userid)
                                    (or
                                     @is-admin
                                     (= @userid (:uid @md))
                                     (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Additional information"]

     [:p "Additional information helps us to understand ecosystem restoration dynamics. This includes information about drivers, presence of natural disasters and other relevant information."]

     ;; FROM CHARACTERIZAION
     [:div {:class "divide-y divide-pink-200"}
      [inputs/multi-form-group {:input-components {:natural-disaster #(inputs/select-input
                                                                       {:options menus/natural-disasters
                                                                        :data    %
                                                                        :edit    @edit})}
                                :new-data         {:natural-disaster nil}
                                :label            "Natural disasters in the last 15 years"
                                :add-labels       {:natural-disaster "natural disaster"}
                                :data             (cursor data [:natural-disasters])
                                :edit             @edit}]

      [inputs/form-group {:input-component #(inputs/select-input {:options menus/ecosystem-degradation-types
                                                                  :data    %
                                                                  :edit    @edit})
                          :label           "Type of ecosystem degradation observed on site"
                          :data            (cursor data [:ecosystem-degradation-types])}]

      [inputs/multi-form-group {:input-components {:driver #(inputs/select-input
                                                             {:options menus/land-degradation-drivers
                                                              :data    %
                                                              :edit    @edit})}
                                :new-data         {:driver nil}
                                :label            "Drivers of land degradation observed on site (choose from the list)"
                                :add-labels       {:driver "driver"}
                                :data             (cursor data [:land-degradation-drivers])
                                :edit             @edit}]



    ;;  Fields to be deleted after pre-presentation meeting
      ;; [inputs/number-form-group
      ;;  {:label "Land cover change [ha]"
      ;;   :data  (cursor data [:land-cover-change])
      ;;   :edit  @edit}]
      ;; [inputs/number-form-group
      ;;  {:label "Net primary productivity [tDM/ha/yr]"
      ;;   :data  (cursor data [:net-primary-productivity])
      ;;   :edit  @edit}]
      ;; [inputs/number-form-group
      ;;  {:label "Soil organic carbon [tC/ha, to 30 cm]"
      ;;   :data  (cursor data [:soil-organic-carbon])
      ;;   :edit  @edit}]
      ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/ecosystem-degradation-degree
      ;;                                                             :data    %
      ;;                                                             :edit    @edit})
      ;;                     :label           "Degree of ecosystem degradation observed on site"
      ;;                     :data            (cursor data [:ecosystem-degradation-degree])}]


     ;; ORIGINAL FIELDS
      [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                                  :data    %
                                                                  :edit    @edit})
                          :label           "Presence of legal and policy framework supporting restoration/forestation in the country"
                          :data            (cursor data [:reporting-process])}]

      ;; All moved to activities
   ;; TODO: one for each type of cover
      ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/land-use
      ;;                                                             :data    %
      ;;                                                             :edit    @edit})
      ;;                     :label           "Land use in project area (for each type of cover)"
      ;;                     :data            (cursor data [:land-use])}]

      ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/land-tenure
      ;;                                                             :data    %
      ;;                                                             :edit    @edit})
      ;;                     :label           "Land tenure in project area"
      ;;                     :data            (cursor data [:land-tenure])}]
      
      ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
      ;;                                                             :data    %
      ;;                                                             :edit    @edit})
      ;;                     :label           "Land management plan in place"
      ;;                     :data            (cursor data [:land-management])}]

      ;; [inputs/multi-form-group {:input-components {:technology #(technology {:data %
      ;;                                                                        :edit @edit})}
      ;;                           :new-data   {:technology {:tech :A :subtech nil}}
      ;;                           :label      "Locally adapted technologies, tools, and techniques"
      ;;                           :add-labels {:technology "technology"}
      ;;                           :data       (cursor data [:technologies])
      ;;                           :edit       @edit}]







      ;;  [technology data]
    ;;  [inputs/form-group {:input-component (fn [data]
    ;;                                         (inputs/select-input {:options tech-menu
    ;;                                                               :data    data}))
    ;;                      :label           "Technology"
    ;;                      :data            (cursor data [:tech])}]

    ;;  [inputs/form-group {:input-component (fn [data]
    ;;                                         (inputs/select-input {:options @subtech-menu
    ;;                                                               :data    data}))
    ;;                      :label           "Sub-technology"
    ;;                      :data            (cursor data [:subtech])}]


      [inputs/multi-form-group {:input-components {:engagement #(inputs/select-input {:options menus/stakeholder-engagement
                                                                                      :data    %
                                                                                      :edit    @edit})}
                                :new-data         {:engagement nil}
                                :label            "Stakeholder engagement in the project"
                                :add-labels       {:engagement "engagement"}
                                :data             (cursor data [:stakeholder-engagement])
                                :edit             @edit}]
      ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/stakeholder-engagement
      ;;                                                             :data    %
      ;;                                                             :edit    @edit})
      ;;                     :label           "Stakeholder engagement in the project"
      ;;                     :data            (cursor data [:stakeholder-engagement])}]

      [inputs/form-group {:input-component #(inputs/select-input {:options menus/gender-mainstreaming-activities
                                                                  :data    %
                                                                  :edit    @edit})
                          :label           "Specific gender mainstreaming activities "
                          :data            (cursor data [:gender-mainstreaming-activities])}]

      [inputs/textarea-form-group {:label "Other additional information"
                                   :data  (cursor data [:other-inf])
                                   :edit  @edit}]]
     ; DEBUG data structure
     ;;  [:hr]
     ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
     ]))

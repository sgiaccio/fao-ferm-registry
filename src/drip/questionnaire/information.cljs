(ns drip.questionnaire.information
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn technology [{:keys [data edit]}]
  (let [tech-menu (map #(-> [(:code %) (:name %)]) menus/technologies)
        tech (cursor data [:tech])
        subtechs (make-reaction
                  (fn [] (let [c (-> (filter #(= (keyword (:code %)) (keyword @tech)) menus/technologies) first)]
                           (:children c))))
        subtech-menu (make-reaction
                      (fn [] (map #(-> [(:code %) (:name %)]) @subtechs)))]
    [:<>
     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options tech-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Technology"
                         :data            (cursor data [:tech])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @subtech-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Sub-technology"
                         :data            (cursor data [:subtech])}]]))

(defn information [data]
  (let [edit (make-reaction (fn []
                                   (and
                                    (some? @userid)
                                    (or
                                     (= @userid (:uid @md))
                                     (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Additional information"]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Is there a legal and  policy framework supporting restoration/forestation in the country?"
                         :data            (cursor data [:reporting-process])}]

   ;; TODO: one for each type of cover
     [inputs/form-group {:input-component #(inputs/select-input {:options menus/land-use
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Land use in project area (for each type of cover)"
                         :data            (cursor data [:land-use])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/land-tenure
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Land tenure in project area"
                         :data            (cursor data [:land-tenure])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Land management plan in place"
                         :data            (cursor data [:land-management])}]

     [inputs/multi-form-group {:input-components {:technology #(technology {:data %
                                                                              :edit @edit})}
                                 :new-data   {:technology {:tech :A :subtech nil}}
                                 :label      "Locally adapted technologies, tools, and techniques"
                                 :add-labels {:technology "technology"}
                                 :data       (cursor data [:technologies])
                                 :edit       @edit}]
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


     [inputs/form-group {:input-component #(inputs/select-input {:options menus/stakeholder-engagement
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Stakeholder engagement in the project"
                         :data            (cursor data [:stakeholder-engagement])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/gender-mainstreaming-activities
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Specific gender mainstreaming activities "
                         :data            (cursor data [:gender-mainstreaming-activities])}]

     [inputs/number-form-group
      {:label "Total restoration cost per activity [USD/ha]"
       :data  (cursor data [:restoration-cost])
       :edit  @edit}]

     [inputs/textarea-form-group {:label "Other additional information"
                                  :data  (cursor data [:other-inf])
                                  :edit  @edit}]

   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
     ]))

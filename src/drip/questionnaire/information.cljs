(ns drip.questionnaire.information
  (:require
   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :as ratom]
   
   [cljs.pprint :as pp]

   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn technology [{:keys [data]}]
  (let [tech-menu (map #(-> [(:code %) (:name %)]) menus/technologies)
        tech (cursor data [:tech])
        subtechs (ratom/make-reaction
                  (fn [] (let [c (-> (filter #(= (keyword (:code %)) @tech) menus/technologies) first)]
                           (:children c))))
        subtech-menu (ratom/make-reaction
                      (fn [] (map #(-> [(:code %) (:name %)]) @subtechs)))]
    [:<>
     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options tech-menu
                                                                  :data    data}))
                         :label           "Technology"
                         :data            (cursor data [:tech])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @subtech-menu
                                                                  :data    data}))
                         :label           "Sub-technology"
                         :data            (cursor data [:subtech])}]]))

(defn information [data]
  (let [tech-menu (map #(-> [(:code %) (:name %)]) menus/technologies)
        tech (cursor data [:tech])
        subtechs (ratom/make-reaction
                  (fn [] (let [c (-> (filter #(= (keyword (:code %)) @tech) menus/technologies) first)]
                           (:children c))))
        subtech-menu (ratom/make-reaction
                      (fn [] (map #(-> [(:code %) (:name %)]) @subtechs)))]
    [:<>
     [:h2 "Additional information"]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                                 :data    %})
                         :label           "Is there a legal and  policy framework supporting restoration/forestation in the country?"
                         :data            (cursor data [:reporting-process])}]

   ;; TODO: one for each type of cover
     [inputs/form-group {:input-component #(inputs/select-input {:options menus/land-use
                                                                 :data    %})
                         :label           "Land use in project area (for each type of cover)"
                         :data            (cursor data [:land-use])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/land-tenure
                                                                 :data    %})
                         :label           "Land tenure in project area"
                         :data            (cursor data [:land-tenure])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                                 :data    %})
                         :label           "Land management plan in place"
                         :data            (cursor data [:land-management])}]

     "==========================="
     [inputs/multi-form-group-2 {:input-components {:technology #(technology {:data %})}
                                 :new-data         {:technology {:tech :A :subtech nil}}
                                 :label            "Technologies"
                                 :add-labels       {:technology "technology"}
                                 :data             (cursor data [:technologies])}]
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
                                                                 :data    %})
                         :label           "Stakeholder engagement in the project"
                         :data            (cursor data [:stakeholder-engagement])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/gender-mainstreaming-activities
                                                                 :data    %})
                         :label           "Specific gender mainstreaming activities "
                         :data            (cursor data [:gender-mainstreaming-activities])}]

     [inputs/number-form-group
      {:label       "Total restoration cost per activity [USD/ha]"
       :data        (cursor data [:restoration-cost])}]

     [inputs/textarea-form-group-loc {:label       "Other additional information"
                                      :data        (cursor data [:other-inf])}]


  ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
  ;;                                         {:headers {"x-csrf-token" (.-value (.getElementById js/document "__anti-forgery-token"))}
  ;;                                          :format :json
  ;;                                          :params @data
  ;;                                          ;; :handler handler
  ;;                                          :error-handler (fn [r] (prn r))})}
  ;;   "Save"]

   ; DEBUG data structure
     [:hr]
     [:div [:pre (with-out-str (pp/pprint @data))]]]))

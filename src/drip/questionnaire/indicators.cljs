(ns drip.questionnaire.indicators
  (:require
   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn indicators-menu [{:keys [data edit]}]
  (let [goal            (cursor data [:goal])
        target          (cursor data [:target])
        indicator       (cursor data [:indicator])

        targets         (r/atom [])
        indicators      (r/atom [])

        reset-target    (atom false)
        reset-indicator (atom false)

        goals-menu   (map #(-> [(:code %) (:name %)]) menus/indicators_)

        update_targets   (fn []
                           (let [c (-> (filter #(= (:code %) (keyword @goal)) menus/indicators_) first)
                                 _ (js/console.log "----" @goal)]
                             (reset! targets (:children c))
                             ;; Reset target and indicator only after first load
                             (when @reset-target
                               (reset! target nil)
                               (reset! indicator nil))
                             (reset! reset-target true)))
        _                @(r/track update_targets)
        targets-menu     (make-reaction
                          (fn [] (map #(-> [(:code %) (:name %)]) @targets)))

        update_indicators (fn []
                            (let [c (-> (filter #(= (keyword (:code %)) (keyword @target)) @targets) first)]
                              (reset! indicators (:children c))
                              (when @reset-indicator
                               ;; Reset indicator only after first load
                                (reset! indicator nil))
                              (reset! reset-indicator true)))
        _                @(r/track update_indicators)

        indicators-menu   (make-reaction
                           (fn [] (map #(-> [(:code %) (:name %)]) @indicators)))]
    [:<>
     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options goals-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Goal"
                         :data            (cursor data [:goal])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @targets-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Target"
                         :data            (cursor data [:target])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @indicators-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Indicator"
                         :data            (cursor data [:indicator])}]]))

(defn indicators [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Indicator selection"]

     [:p "Indicators are selected to monitor ecosystem restoration progress. The list of priority indicators is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated. You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project."]
     
     [:div {:class "divide-y divide-pink-200"}
      ;; [inputs/multi-form-group {:input-components {:contribution #(inputs/select-input
      ;;                                                              {:options menus/indicators
      ;;                                                               :data    %
      ;;                                                               :edit    @edit})}
      ;;                           :new-data         {:contribution nil}
      ;;                           :label            "Indicators"
      ;;                           :add-labels       {:contribution "indicator"}
      ;;                           :data             (cursor data [:indicators])
      ;;                           :edit             @edit}]

     [inputs/multi-form-group {:input-components {:indicator #(indicators-menu {:data %
                                                                                :edit @edit})}
                               :new-data   {:indicator {}}
                               :label      "Indicators"
                               :add-labels {:admin-area "indicator"}
                               :data       (cursor data [:indicators_])
                               :edit       @edit
                               :numbering  true}]

      ;; [inputs/multi-form-group {:input-components {:contribution #(inputs/select-input
      ;;                                                              {:options menus/sdg-contributions
      ;;                                                               :data    %
      ;;                                                               :edit    @edit})}
      ;;                           :new-data         {:contribution nil}
      ;;                           :label            "Contribution to Sustainable Development Goals"
      ;;                           :add-labels       {:contribution "contribution"}
      ;;                           :data             (cursor data [:natural-disasters])
      ;;                           :edit             @edit}]

    ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/sdg-contributions
    ;;                                                                       :data    %
    ;;                                                                       :edit    @edit})
    ;;                      :label           "Contribution to SDGs"
    ;;                      :data            (cursor data [:sdg-contributions])}]

      ;; [inputs/textarea-form-group {:label "Contribution to restoration related Rio Conventions"
      ;;                              :data  (cursor data [:rio-convention-contribution])
      ;;                              :edit  @edit}]
      ]

  ;;  TODO: add goals/criteria/indicators/target
  ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/project-goals
  ;;                                                                       :data    %})
  ;;                      :label           "Project goals"
  ;;                      :data            (cursor data [:project-goals])}]

   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
     ]))

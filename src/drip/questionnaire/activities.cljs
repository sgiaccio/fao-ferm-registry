(ns drip.questionnaire.activities
  (:require
   [cljs.pprint :as pp]

   [reagent.core :refer [cursor]]
   [reagent.ratom :as r :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn activities-menu-group [{:keys [data edit]}]
  (let [type              (cursor data [:type])
        activity          (cursor data [:activity])

        activities        (r/atom [])

        reset-activity    (atom false)

        types-menu        (map #(-> [(:code %) (:name %)]) menus/activities)

        update-activities (fn []
                            (let [c (-> (filter #(= (keyword (:code %)) (keyword @type)) menus/activities) first)]
                              (reset! activities (:children c))
                                ;; Reset activity only after first load
                              (when @reset-activity
                                (reset! activity nil))
                              (reset! reset-activity true)))
        _                 @(r/track update-activities)
        activities-menu   (make-reaction
                           (fn [] (map #(-> [(:code %) (:name %)]) @activities)))]
    [:<>
     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options types-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Activity type"
                         :data            (cursor data [:type])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @activities-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Activity"
                         :data            (cursor data [:activity])}]]))

(defn activities [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Definition of activities"]

    ;;  [inputs/multi-form-group {:input-components {:activity #(inputs/select-input
    ;;                                                             {:options menus/activities
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})}
    ;;                              :new-data         {:activity nil}
    ;;                              :label            "Activities implemented"
    ;;                              :add-labels       {:activity "activity"}
    ;;                              :data             (cursor data [:topic-categories])
    ;;                              :edit             @edit}]


     [activities-menu-group {:data (cursor data [:activity])
                             :edit @edit}]
    ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/activities
    ;;                                                                       :data    %
    ;;                                                                       :edit    @edit})
    ;;                      :label           "Activities implemented"
    ;;                      :data            (cursor data [:activities-implemented])}]


    ;;  [inputs/form-group {:input-component #(inputs/date-input {:data %
    ;;                                                            :edit @edit})
    ;;                      :label           "Date of implementation of the activity"
    ;;                      :data            (cursor data [:implementation-date])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/years
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Date of implementation of the activity"
                         :data            (cursor data [:implementation-year])}]
 
     [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Priority/critical areas for LDN implementation"
                         :data            (cursor data [:priority-areas])}]

  ;; TODO: Drivers of ecosystem restoration observed on site (choose from the list)

   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
     ]))

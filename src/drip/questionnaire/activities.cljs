(ns drip.questionnaire.activities
  (:require
   [reagent.core :refer [cursor]]
   [reagent.ratom :as r :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]
   [drip.utils :as utils]))

(defn activities-menu-group_ [{:keys [data edit]}]
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



(defn activities-menu-group [{:keys [data edit]}]
  (let [component          (cursor data [:admin-0])
        category           (cursor data [:admin-1])
        subcategory         (cursor data [:admin-2])

        categories          (r/atom [])
        subcategories        (r/atom [])

        reset-category     (atom false)
        reset-subcategory   (atom false)

        components-menu   (map #(-> [(:code %) (:name %)]) menus/activities)

        update_categories   (fn []
                           (let [c (-> (filter #(= (keyword (:code %)) (keyword @component)) menus/activities) first)]
                             (reset! categories (:children c))
                             ;; Reset category and subcategory only after first load
                             (when @reset-category
                               (reset! category nil)
                               (reset! subcategory nil))
                             (reset! reset-category true)))
        _                @(r/track update_categories)
        categories-menu     (make-reaction
                          (fn [] (map #(-> [(:code %) (:name %)]) @categories)))

        update_subcategories (fn []
                           (let [c (-> (filter #(= (keyword (:code %)) (keyword @category)) @categories) first)]
                             (reset! subcategories (:children c))
                             (when @reset-subcategory
                               ;; Reset subcategory only after first load
                               (reset! subcategory nil))
                             (reset! reset-subcategory true)))
        _                @(r/track update_subcategories)

        subcategories-menu   (make-reaction
                          (fn [] (map #(-> [(:code %) (:name %)]) @subcategories)))]
    [:<>
     [inputs/text-form-group {:label "Site name"
                              :data  (cursor data [:site-name])
                              :edit  edit}]
     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options components-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Component"
                         :data            (cursor data [:admin-0])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @categories-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Category"
                         :data            (cursor data [:admin-1])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @subcategories-menu
                                                                  :data    data
                                                                  :edit    edit}))
                         :label           "Subcategory"
                         :data            (cursor data [:admin-2])}]]))



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


(defn activities [data_]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Definition of activities"]

     [:p "There are various forms of activities to support ecosystem restoration. They range from technologies to approaches, at local to watershed levels. Different parameters are identified to categorize activities and better identify related indicators and datasets for each area of interest."]
    ;;  [inputs/multi-form-group {:input-components {:activity #(inputs/select-input
    ;;                                                             {:options menus/activities
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})}
    ;;                              :new-data         {:activity nil}
    ;;                              :label            "Activities implemented"
    ;;                              :add-labels       {:activity "activity"}
    ;;                              :data             (cursor data [:topic-categories])
    ;;                              :edit             @edit}]


     [:div {:class "divide-y divide-pink-200"}
      
      (doall (for [i (range (count @data_))
                   :let [data (r/cursor data_ [i])
                         admin-names (utils/get-admin2-names
                                      (:admin-0 (:admin-area @data))
                                      (:admin-1 (:admin-area @data))
                                      (:admin-2 (:admin-area @data)))]]

               [:div {:key i} ;; TODO find better key
                [:div
                 [:span {:href "#", :class "mt-5 flex items-center text-sm font-medium", :aria-current "n"}
                  [:span {:class "flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-indigo-600 rounded-full"}
                   [:span {:class "text-indigo-600"} (+ 1 i)]]]

                 (or (:adm0 admin-names) "n/a") ", "
                 (or (:adm1 admin-names) "n/a") ", "
                 (or (:adm2 admin-names) "n/a")]
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

                ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/years
                ;;                                                             :data    %
                ;;                                                             :edit    @edit})
                ;;                     :label           "Date of implementation of the activity"
                ;;                     :data            (cursor data [:implementation-year])}]

                [inputs/date-form-group
                 {:label       "Starting date"
                  :data        (cursor data [:begin-date])
                  :edit        @edit}]

                [inputs/date-form-group
                 {:label       "Ending date"
                  :data        (cursor data [:end-date])
                  :edit        @edit}]

                ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                ;;                                                             :data    %
                ;;                                                             :edit    @edit})
                ;;                     :label           "Priority/critical areas for LDN implementation"
                ;;                     :data            (cursor data [:priority-areas])}]

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
                
                ;; [inputs/number-form-group
                ;;  {:label "Total restoration cost per activity [USD/ha/yy]"
                ;;   :data  (cursor data [:restoration-cost])
                ;;   :edit  @edit}]
                ]))]

  ;; TODO: Drivers of ecosystem restoration observed on site (choose from the list)

   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data_))]]
     ]))

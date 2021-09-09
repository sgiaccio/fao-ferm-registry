(ns drip.questionnaire.aoi
  (:require
   [cljs.pprint :as pp]
   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.admin2 :as admin2]))



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
                         :data            (cursor data [:admin-2])}]]))

(defn aoi [{:keys [data]}]
  ;; TODO - clean-up; generalize tree menus
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
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
     [:h1 {:class "text-3xl"} "Area of interest"]

     [:h3 "Choose a level 2 administrative area"]

     
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
     [inputs/multi-form-group-2 {:input-components {:admin-area #(admin2 {:data %
                                                                          :edit @edit})}
                                 :new-data   {:admin-area {}}
                                 :label      "Admin areas"
                                 :add-labels {:admin-area "admin2 area"}
                                 :data       data
                                 :edit       @edit}]

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

     [:hr]


     (when @edit
       [:<>
        [:h3 "Or upload the shapefile of the area"]
        [:div.form-group
         [:label {:for "exampleFormControlFile1"} "Example file input"]
         [:input.form-control-file {:type "file"
                                    :id   "exampleFormControlFile1"}]]])


    ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
    ;;                                         {:headers {"x-csrf-token" (.-value (.getElementById js/document "__anti-forgery-token"))}
    ;;                                          :format :json
    ;;                                          :params @data
    ;;                                          :error-handler (fn [r] (prn r))})}
    ;;   "Save"]

     ; TODO: add shapefile upload
     ; TODO: add area draw

   ; DEBUG data structure
     [:hr]
     [:div [:pre (with-out-str (pp/pprint @data))]]]))

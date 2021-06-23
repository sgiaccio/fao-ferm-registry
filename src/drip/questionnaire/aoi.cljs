(ns drip.questionnaire.aoi
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.admin2 :as admin2]))

(defn aoi [{:keys [data]}]
  ;; TODO - clean-up; generalize tree menus
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))
        countries-menu (map #(-> [(:code %) (:name %)]) admin2/admin2)
        country (cursor data [:admin-0])
        regions (make-reaction
                 (fn [] (let [c (-> (filter #(= (keyword (:code %)) @country) admin2/admin2) first)]
                          (:children c))))
        regions-menu (make-reaction
                      (fn [] (map #(-> [(:code %) (:name %)]) @regions)))
        region (cursor data [:admin-1])
        provinces (make-reaction
                   (fn [] (let [c (-> (filter #(= (keyword (:code %)) @region) @regions) first)]
                            (:children c))))
        provinces-menu (make-reaction
                        (fn [] (map #(-> [(:code %) (:name %)]) @provinces)))]

    [:<>
     [:h2 "Area of interest"]

     [:h3 "Choose a level 2 administrative area"]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options countries-menu
                                                                  :data    data
                                                                  :edit    @edit}))
                         :label           "Country"
                         :data            (cursor data [:admin-0])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @regions-menu
                                                                  :data    data
                                                                  :edit    @edit}))
                         :label           "Administrative name (level 1)"
                         :data            (cursor data [:admin-1])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @provinces-menu
                                                                  :data    data
                                                                  :edit    @edit}))
                         :label           "Administrative name (level 2)"
                         :data            (cursor data [:admin-2])}]

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

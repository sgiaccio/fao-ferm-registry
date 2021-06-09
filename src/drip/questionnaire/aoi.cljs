(ns drip.questionnaire.aoi
  (:require
   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :as ratom]

   [cljs.pprint :as pp]
   [ajax.core :refer [POST]]

   [drip.inputs :as inputs]
  ;;  [drip.menus :as menus]

   [drip.admin2 :as admin2]))

(defn aoi [data]
  ;; TODO - clean-up; generalize tree menus
  (let [countries-menu (map #(-> [(:code %) (:name %)]) admin2/admin2)
        country (cursor data [:admin-0])
        regions (ratom/make-reaction
                 (fn [] (let [c (-> (filter #(= (keyword (:code %)) @country) admin2/admin2) first)]
                          (:children c))))
        regions-menu (ratom/make-reaction
                      (fn [] (map #(-> [(:code %) (:name %)]) @regions)))
        region (cursor data [:admin-1])
        provinces (ratom/make-reaction
                   (fn [] (let [c (-> (filter #(= (keyword (:code %)) @region) @regions) first)]
                            (:children c))))
        provinces-menu (ratom/make-reaction
                        (fn [] (map #(-> [(:code %) (:name %)]) @provinces)))]
    
    [:<>
     [:h2 "Area of interest"]

     [:h3 "Choose a level 2 administrative area"]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options countries-menu
                                                                  :data    data}))
                         :label           "Country"
                         :data            (cursor data [:admin-0])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @regions-menu
                                                                  :data    data}))
                         :label           "Administrative name (level 1)"
                         :data            (cursor data [:admin-1])}]

     [inputs/form-group {:input-component (fn [data]
                                            (inputs/select-input {:options @provinces-menu
                                                                  :data    data}))
                         :label           "Administrative name (level 2)"
                         :data            (cursor data [:admin-2])}]
     
     [:hr]

     [:h3 "Or upload the shapefile of the area"]
     [:div.form-group
      [:label {:for "exampleFormControlFile1"} "Example file input"]
      [:input.form-control-file {:type "file" :id "exampleFormControlFile1"}]]
     

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

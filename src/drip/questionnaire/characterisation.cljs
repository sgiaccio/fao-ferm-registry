(ns drip.questionnaire.characterisation
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn characterisation [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (= @userid (:uid @md)))))]
    [:<>
     [:h2 "Advanced characterisation"]

     [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/natural-disasters
                                                                          :data    %
                                                                          :edit    @edit})
                         :label           "Natural disasters in the last 15 years"
                         :data            (cursor data [:natural-disasters])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/ecosystem-degradation-types
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Type of ecosystem degradation observed on site"
                         :data            (cursor data [:ecosystem-degradation-types])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/ecosystem-degradation-degree
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Degree of ecosystem degradation observed on site"
                         :data            (cursor data [:ecosystem-degradation-degree])}]

     [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/land-degradation-drivers
                                                                          :data    %
                                                                          :edit    @edit})
                         :label           "Drivers of land degradation observed on site (choose from the list)"
                         :data            (cursor data [:land-degradation-drivers])}]

     [inputs/number-form-group
      {:label "Land cover change [ha]"
       :data  (cursor data [:land-cover-change])
       :edit  @edit}]

     [inputs/number-form-group
      {:label "Net primary productivity [tDM/ha/yr]"
       :data  (cursor data [:net-primary-productivity])
       :edit  @edit}]

     [inputs/number-form-group
      {:label "Soil organic carbon [tC/ha, to 30 cm]"
       :data  (cursor data [:soil-organic-carbon])
       :edit  @edit}]

     [inputs/textarea-form-group-loc {:label "Other indicator calculation"
                                      :data  (cursor data [:other-indicators])
                                      :edit  @edit}]

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

(ns drip.questionnaire.activities
  (:require
   [cljs.pprint :as pp]

   [reagent.core :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn activities [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (= @userid (:uid @md)))))]
    [:<>
     [:h2 "Definition of activities"]

     [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/activities
                                                                          :data    %
                                                                          :edit    @edit})
                         :label           "Activities implemented"
                         :data            (cursor data [:activities-implemented])}]


     [inputs/form-group {:input-component #(inputs/date-input {:data %
                                                               :edit @edit})
                         :label           "Date of implementation of the activity"
                         :data            (cursor data [:implementation_date])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Priority/critical areas for LDN implementation "
                         :data            (cursor data [:priority_areas])}]

  ;; TODO: Drivers of ecosystem restoration observed on site (choose from the list)

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

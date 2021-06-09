(ns drip.questionnaire.activities
  (:require
   [reagent.core :as r :refer [cursor]]

   [cljs.pprint :as pp]

   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn activities [data]
  [:<>
   [:h2 "Definition of activities"]

   [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/activities
                                                                        :data    %})
                       :label           "Activities implemented"
                       :data            (cursor data [:activities-implemented])}]


   [inputs/form-group {:input-component #(inputs/date-input {:data        %})
                       :label           "Date of implementation of the activity"
                       :data            (cursor data [:implementation_date])}]

   [inputs/form-group {:input-component #(inputs/select-input {:options menus/bool
                                                               :data    %})
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
   [:div [:pre (with-out-str (pp/pprint @data))]]])

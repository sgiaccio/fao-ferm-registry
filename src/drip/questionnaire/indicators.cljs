(ns drip.questionnaire.indicators
  (:require
   [reagent.core :as r :refer [cursor]]

   [cljs.pprint :as pp]
   [ajax.core :refer [POST]]

   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn indicators [data]
  [:<>
   [:h2 "Indicator selection"]

   [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/sdg-contributions
                                                                        :data    %})
                       :label           "Contribution to SDGs"
                       :data            (cursor data [:sdg-contributions])}]

   [inputs/textarea-form-group-loc {:label       "Contribution to restoration related Rio Conventions"
                                    :data        (cursor data [:rio-convention-contribution])}]

  ;;  TODO: add goals/criteria/indicators/target
  ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/project-goals
  ;;                                                                       :data    %})
  ;;                      :label           "Project goals"
  ;;                      :data            (cursor data [:project-goals])}]


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

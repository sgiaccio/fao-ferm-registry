(ns drip.questionnaire.results
  (:require
   [reagent.core :as r :refer [cursor]]

   [cljs.pprint :as pp]
   [ajax.core :refer [POST]]

   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn results [data]
  [:<>
   [:h2 "Results"]

   [inputs/form-group {:input-component #(inputs/select-input {:options menus/achieved
                                                               :data    %})
                       :label           "Were the restoration objectives achieved?"
                       :data            (cursor data [:achieved])}]

  ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/partially-achieved-reasons
  ;;                                                                       :data    %})
  ;;                      :label           "If partially achieved, choose from list"
  ;;                      :data            (cursor data [:partially-achieved-reasons])}]

   [inputs/multi-form-group-2 {:input-components {:reason #(inputs/select-input {:options menus/partially-achieved-reasons
                                                                                 :data    %})}
                               :new-data         {:reason nil}
                               :label            "If partially achieved, choose from list"
                               :add-labels       {:reason "reason"}
                               :data             (cursor data [:partially-achieved-reasons])}]

   [inputs/number-form-group
    {:label       "Results achieved based on targets (women/men ratio)"
     :data        (cursor data [:women-men-ratio])}]


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

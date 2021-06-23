(ns drip.questionnaire.results
  (:require
   [cljs.pprint :as pp]

   [reagent.core :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn results [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:<>
     [:h2 "Results"]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/achieved
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Were the restoration objectives achieved?"
                         :data            (cursor data [:achieved])}]

  ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/partially-achieved-reasons
  ;;                                                                       :data    %})
  ;;                      :label           "If partially achieved, choose from list"
  ;;                      :data            (cursor data [:partially-achieved-reasons])}]

     [inputs/multi-form-group-2 {:input-components {:reason #(inputs/select-input {:options menus/partially-achieved-reasons
                                                                                   :data    %
                                                                                   :edit    @edit})}
                                 :new-data   {:reason nil}
                                 :label      "If partially achieved, choose from list"
                                 :add-labels {:reason "reason"}
                                 :data       (cursor data [:partially-achieved-reasons])
                                 :edit       @edit}]

     [inputs/number-form-group
      {:label "Results achieved based on targets (women/men ratio)"
       :data  (cursor data [:women-men-ratio])
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

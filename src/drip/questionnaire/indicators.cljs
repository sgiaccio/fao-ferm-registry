(ns drip.questionnaire.indicators
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn indicators [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Indicator selection"]

     [inputs/multi-form-group {:input-components {:contribution #(inputs/select-input
                                                                    {:options menus/sdg-contributions
                                                                     :data    %
                                                                     :edit    @edit})}
                                 :new-data         {:contribution nil}
                                 :label            "Contribution to SDGs"
                                 :add-labels       {:contribution "contribution"}
                                 :data             (cursor data [:natural-disasters])
                                 :edit             @edit}]
     
    ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/sdg-contributions
    ;;                                                                       :data    %
    ;;                                                                       :edit    @edit})
    ;;                      :label           "Contribution to SDGs"
    ;;                      :data            (cursor data [:sdg-contributions])}]

     [inputs/textarea-form-group {:label "Contribution to restoration related Rio Conventions"
                                  :data  (cursor data [:rio-convention-contribution])
                                  :edit  @edit}]

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
     [:div [:pre (with-out-str (pp/pprint @data))]]]))

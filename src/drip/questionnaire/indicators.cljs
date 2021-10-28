(ns drip.questionnaire.indicators
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn indicators [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Indicator selection"]

     [:p "Indicators are selected to monitor ecosystem restoration progress. The list of priority indicators is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated. You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project."]
     
     [inputs/multi-form-group {:input-components {:contribution #(inputs/select-input
                                                                  {:options menus/indicators
                                                                   :data    %
                                                                   :edit    @edit})}
                               :new-data         {:contribution nil}
                               :label            "Indicators"
                               :add-labels       {:contribution "indicator"}
                               :data             (cursor data [:indicators])
                               :edit             @edit}]

     [inputs/multi-form-group {:input-components {:contribution #(inputs/select-input
                                                                    {:options menus/sdg-contributions
                                                                     :data    %
                                                                     :edit    @edit})}
                                 :new-data         {:contribution nil}
                                 :label            "Contribution to Sustainable Development Goals"
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

   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
     ]))

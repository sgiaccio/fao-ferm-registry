(ns drip.questionnaire.results
  (:require
   [cljs.pprint :as pp]

   [reagent.core :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn results [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Results"]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/achieved
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Were the restoration objectives achieved?"
                         :data            (cursor data [:achieved])}]

  ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/partially-achieved-reasons
  ;;                                                                       :data    %})
  ;;                      :label           "If partially achieved, choose from list"
  ;;                      :data            (cursor data [:partially-achieved-reasons])}]

     [inputs/multi-form-group {:input-components {:reason #(inputs/select-input {:options menus/partially-achieved-reasons
                                                                                 :data    %
                                                                                 :edit    @edit})}
                               :new-data   {:reason nil}
                               :label      "If partially achieved, choose from list"
                               :add-labels {:reason "reason"}
                               :data       (cursor data [:partially-achieved-reasons])
                               :edit       @edit}]

    ;;  [inputs/number-form-group
    ;;   {:label "Results achieved based on targets (women/men ratio)"
    ;;    :data  (cursor data [:women-men-ratio])
    ;;    :edit  @edit}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/achieving-targets
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Results achieved based on targets"
                         :data            (cursor data [:menus/achieving-targets])}]]))

     
   ; DEBUG data structure
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
     

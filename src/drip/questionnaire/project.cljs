(ns drip.questionnaire.project
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn project [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
     [:h1 {:class "text-3xl"} "Project registration"]

     [inputs/number-form-group
      {:label       "Version"
       :data        (cursor data [:version])
       :edit        @edit}]

     [inputs/text-form-group
      {:label       "Project ID"
       :data        (cursor data [:project-id])
       :edit        @edit}]

     [inputs/date-form-group
      {:label       "Create date"
       :data        (cursor data [:create-date])
       :edit        @edit}]

     [inputs/date-form-group
      {:label       "Last modified date"
       :data        (cursor data [:last-modified-date])
       :edit        @edit}]

     [inputs/text-form-group
      {:label       "Title"
       :data        (cursor data [:title])
       :edit        @edit}]

     [inputs/textarea-form-group
      {:label       "Description"
       :data        (cursor data [:description])
       :edit        @edit}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/reporting-processes
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Reporting process"
                         :data            (cursor data [:reporting-process])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/agencies
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Reporting agency"
                         :data            (cursor data [:reporting-agencies])}]


    ;;  [inputs/multi-form-group-2 {:input-components {:reason #(inputs/select-input {:options menus/partially-achieved-reasons
    ;;                                                                                :data    %
    ;;                                                                                :edit    @edit})}
    ;;                              :new-data   {:reason nil}
    ;;                              :label      "If partially achieved, choose from list"
    ;;                              :add-labels {:reason "reason"}
    ;;                              :data       (cursor data [:partially-achieved-reasons])
    ;;                              :edit       @edit}]
     [inputs/multi-form-group-2 {:input-components {:executing-agency #(inputs/agency-input {:data % :edit @edit})}
                                 :new-data         {:executing-agency {:agency nil :role nil}}
                                 :label            "Executing agencies"
                                 :add-labels       {:executing-agency "agency"}
                                 :data             (cursor data [:executing-agencies])
                                 :edit             @edit}]
     
    ;;  [inputs/form-group {:input-component #(inputs/select-input {:options menus/agencies
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})
    ;;                      :label           "Executing agency"
    ;;                      :data            (cursor data [:executing-agencies])}]

    ;;  [inputs/form-group {:input-component #(inputs/select-input {:options menus/agency-roles
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})
    ;;                      :label           "Executing agency role"
    ;;                      :data            (cursor data [:agency-role])}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/project-statuses
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Project status"
                         :data            (cursor data [:project-status])}]

     [inputs/date-form-group
      {:label       "Project starting date"
       :data        (cursor data [:start-date])
       :edit        @edit}]

     [inputs/date-form-group
      {:label       "Project ending date"
       :data        (cursor data [:end-date])
       :edit        @edit}]

     [inputs/number-form-group
      {:label       "Budget [USD]"
       :data        (cursor data [:budget])
       :edit        @edit}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/funding-sources
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Source of funding"
                         :data            (cursor data [:funding-source])}]

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

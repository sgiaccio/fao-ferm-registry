(ns drip.questionnaire.project
  (:require
   [reagent.core :as r :refer [cursor]]

   [cljs.pprint :as pp]
   [ajax.core :refer [POST]]

   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn project [data]
  [:<>
   [:h2 "Project registration"]

   [inputs/number-form-group
    {:label       "Version"
     :data        (cursor data [:version])}]

   [inputs/text-form-group
    {:label       "Project ID"
     :data        (cursor data [:project-id])}]

   [inputs/date-form-group
    {:label       "Create date"
     :data        (cursor data [:create-date])}]

   [inputs/date-form-group
    {:label       "Last modified date"
     :data        (cursor data [:last-modified-date])}]

   [inputs/text-form-group
    {:label       "Title"
     :data        (cursor data [:title])}]

   [inputs/textarea-form-group
    {:label       "Description"
     :data        (cursor data [:description])}]

   [inputs/form-group {:input-component #(inputs/select-input {:options menus/reporting-processes
                                                               :data    %})
                       :label           "Reporting process"
                       :data            (cursor data [:reporting-process])}]

   [inputs/form-group {:input-component #(inputs/select-input {:options menus/agencies
                                                               :data    %})
                       :label           "Reporting agency"
                       :data            (cursor data [:reporting-agencies])}]

   [inputs/form-group {:input-component #(inputs/select-input {:options menus/agencies
                                                               :data    %})
                       :label           "Executing agency"
                       :data            (cursor data [:executing-agencies])}]

   ; TODO: Executing agency role

   [inputs/form-group {:input-component #(inputs/select-input {:options menus/project-statuses
                                                               :data    %})
                       :label           "Project status"
                       :data            (cursor data [:project-status])}]

   [inputs/date-form-group
    {:label       "Project starting date"
     :data        (cursor data [:start-date])}]

   [inputs/date-form-group
    {:label       "Project ending date"
     :data        (cursor data [:end-date])}]

   [inputs/number-form-group
    {:label       "Budget [USD]"
     :data        (cursor data [:budget])}]

   [inputs/form-group {:input-component #(inputs/select-input {:options menus/funding-sources
                                                               :data    %})
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
   [:div [:pre (with-out-str (pp/pprint @data))]]])

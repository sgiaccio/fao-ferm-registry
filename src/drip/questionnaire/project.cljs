(ns drip.questionnaire.project
  (:require
  ;;  [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor with-let]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin project-id]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(defn project [data]
  (let [edit (make-reaction (fn []
                              (and
                               (some? @userid)
                               (or
                                @is-admin
                                (= @userid (:uid @md))
                                (nil? (:uid @md))))))]
    (with-let [;;  agencies-list (atom nil)
              ;;  _ (.then (get-agencies) #(reset! agencies-list %))
               ]
      ;; (js/console.log agencies-list)
      [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
       [:h1 {:class "text-3xl"} "Project registration"]
       [:p "In this tab, basic information about your project is needed. The title and a summary of the aims and expected results of the project can be provided in the description section. You also need to provide further information such as when the project is expected to start and end, sources of funding and responsible organisms."]
       [:div {:class "my-6 font-bold"} "uuid: "
        [:span {:class "font-mono"} (:uuid @data)]]
       [:div {:class "divide-y divide-pink-200"}

        [inputs/text-form-group
         {:label       "Title"
          :description "Provide the title of your project as it is stated in the official project document"
          :data        (cursor data [:title])
          :edit        @edit}]

        [inputs/textarea-form-group
         {:label       "Description"
          :description "Describe briefly the main objective(s) and activity of your project (maximum 4 lines)"
          :data        (cursor data [:description])
          :edit        @edit}]

    ;;  [inputs/number-form-group
    ;;   {:label       "Version"
    ;;    :data        (cursor data [:version])
    ;;    :edit        @edit}]

    ;;  [inputs/text-form-group
    ;;   {:label       "Project ID"
    ;;    :data        (cursor data [:project-id])
    ;;    :edit        @edit}]

        [inputs/date-form-group
         {:label       "Starting date"
          :description "Date when the project started"
          :data        (cursor data [:starting-date])
          :edit        @edit}]

        [inputs/date-form-group
         {:label       "Ending date"
          :description "Date when the project finished"
          :data        (cursor data [:ending-date])
          :edit        @edit}]

        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/agencies
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Reporting agency"
        ;;                     :data            (cursor data [:reporting-agencies])}]

        ;; [inputs/multi-form-group {:input-components {:executing-agency #(inputs/agency-input {:data % :edit @edit})}
        ;;                           :new-data         {:executing-agency {:agency nil :role nil}}
        ;;                           :label            "Executing agencies"
        ;;                           :add-labels       {:executing-agency "agency"}
        ;;                           :data             (cursor data [:executing-agencies])
        ;;                           :edit             @edit}]

    ;;  [inputs/multi-form-group-2 {:input-components {:reason #(inputs/select-input {:options menus/partially-achieved-reasons
    ;;                                                                                :data    %
    ;;                                                                                :edit    @edit})}
    ;;                              :new-data   {:reason nil}
    ;;                              :label      "If partially achieved, choose from list"
    ;;                              :add-labels {:reason "reason"}
    ;;                              :data       (cursor data [:partially-achieved-reasons])
    ;;                              :edit       @edit}]

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

        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/project-statuses
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Project status"
        ;;                     :data            (cursor data [:project-status])}]


        ;; [inputs/number-form-group
        ;;  {:label       "Total Budget [USD]"
        ;;   :data        (cursor data [:budget])
        ;;   :edit        @edit}]


    ;;  [inputs/date-form-group
    ;;   {:label       "Begin date"
    ;;    :data        (cursor data [:begin-date])
    ;;    :edit        @edit}]

    ;;  [inputs/date-form-group
    ;;   {:label       "End date"
    ;;    :data        (cursor data [:end-date])
    ;;    :edit        @edit}]


        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/funding-sources
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Source of funding"
        ;;                     :data            (cursor data [:funding-source])}]

        [inputs/textarea-form-group {:label "Donors"
                                     :data  (cursor data [:donors])
                                     :edit  @edit}]

        ;; [inputs/document-form-group {:label "Document link"
        ;;                              :data  (cursor data [:docuent-link])
        ;;                              :edit  @edit}]
        [inputs/form-group {:input-component (fn [data]
                                               (inputs/document-input {;;:path "https://europe-west3-fao-ferm2-review.cloudfunctions.net/parse_multipart"
                                                                       :path (str @project-id "/documents")
                                                                       :label "Shapefile"
                                                                       :data  nil
                                                                       :edit  edit}))
                            :label           "Document"
                            :data            nil}]

        ;; [inputs/text-form-group {:label "Document title"
        ;;                          :data  (cursor data [:docuent-title])
        ;;                          :edit  @edit}]

        ;; [inputs/form-group {:input-component #(inputs/select-input {:options menus/document-formats
        ;;                                                             :data    %
        ;;                                                             :edit    @edit})
        ;;                     :label           "Document format"
        ;;                     :data            (cursor data [:document-format])}]

        [inputs/form-group {:input-component #(inputs/select-input {:options menus/reporting-processes
                                                                    :data    %
                                                                    :edit    @edit})
                            :label           "Reporting process"
                            :data            (cursor data [:reporting-process])}]]

   ; DEBUG data structure
      ;;  [:hr]
      ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
       ])))

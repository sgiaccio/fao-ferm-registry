(ns drip.questionnaire.iso-19115
  (:require
   [reagent.core :as r :refer [cursor]]

   [cljs.pprint :as pp]
   [ajax.core :refer [POST]]

   [drip.inputs :as inputs]
   [drip.menus :as menus]))

(def xml (r/atom ""))

(defn iso-19115 [data]
  [:<>
   [:h2 "Metadata"]

   [inputs/text-form-group-loc
    {:label       "Title"
     :placeholder "Enter title"
     :description "The title of the dataset"
     :data        (cursor data [:citation :title :loc])}]

   ;;  Dates
   [inputs/multi-form-group-2 {:input-components {:date #(inputs/date-and-type-input {:data %})}
                               :new-data         {:date {:type nil :date nil}}
                               :label            "Dates"
                               :add-labels       {:date "date"}
                               :data             (cursor data [:citation :dates])}]

   ;;  Abstract
   [inputs/textarea-form-group-loc {:label       "Abstract"
                                    :placeholder "Enter abstract"
                                    :description "The dataset abstract"
                                    :data        (cursor data [:abstract :loc])}]

   ;;  Status
   [inputs/form-group {:input-component #(inputs/select-input {:options menus/status-items
                                                               :data    %})
                       :label           "Status"
                       :data            (cursor data [:status])}]

   ;;  Points of contact
   [inputs/multi-form-group-2 {:input-components {:poc #(inputs/point-of-contact {:data %})}
                               :new-data         {:poc {:role nil
                                                        :organization    nil
                                                        :individual-name nil
                                                        :web-address     nil
                                                        :email           nil}}
                               :label            "Points of contact"
                               :add-labels       {:poc "point of contact"}
                               :data             (cursor data [:points-of-contact])}]

   ;;  Topic categories
   [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/keywords
                                                                        :data    %})
                       :label           "Topic categories"
                       :data            (cursor data [:topic-categories])}]

   ;;  Keywords
   [inputs/multi-form-group-2 {:input-components {:keyword-group #(inputs/keywords {:data %})}
                               :new-data         {:keyword-group {:type :place :keywords []}}
                               :label            "Keywords"
                               :add-labels       {:keyword-group "keyword type"}
                               :data             (cursor data [:keywords])}]

  ;;  Demo single-type field group
  ;;  [inputs/multi-form-group-2 {:input-components {:text    #(inputs/text-input {:data %})}
  ;;                              :new-data         {:text "new text"}
  ;;                              :label            "text test"
  ;;                              :add-labels       {:text "Text"}
  ;;                              :data             (cursor data [:multi-type-input-test2])}]

  ;;  ; Demo multy-type field group
  ;;  [inputs/multi-form-group-2 {:input-components {:keyword #(inputs/keywords {:data %})
  ;;                                                 :text    #(inputs/text-input {:data %})}
  ;;                              :new-data         {:keyword {:type :author :keywords ["new kw"]}
  ;;                                                 :text "new text"}
  ;;                              :label            "Keywords or text"
  ;;                              :add-labels       {:text "Text" :keyword "Keyword"}
  ;;                              :data             (cursor data [:multi-type-input-test])}]

  ;; ; Demo multy-type field group
  ;; ;;  [inputs/multi-form-group
  ;; ;;   {:input-component #(inputs/text-input {:placeholder "Placeholder"
  ;; ;;                                          :description "This is the description"
  ;; ;;                                          :data        %})
  ;; ;;    :new-data        nil
  ;; ;;    :label           "Test multi text"
  ;; ;;    :data            (cursor data [:test-multi-text])}]

  ;;  [inputs/text-form-group
  ;;   {:label       "test text"
  ;;    :description "This is the help text"
  ;;    :placeholder "Acdsdf"
  ;;    :data        (cursor data [:test-text])}]
  ;;  [inputs/form-group
  ;;   {:input-component #(inputs/text-input {:data %})
  ;;    :label           "Test text"
  ;;    :data            (cursor data [:test-text])}]

  ;; ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
  ;; ;;                                         {:headers {"x-csrf-token" (.-value (.getElementById js/document "__anti-forgery-token"))}
  ;; ;;                                          :format :json
  ;; ;;                                          :params @data
  ;; ;;                                          :handler (fn [r] (reset! xml r))
  ;; ;;                                          :error-handler (fn [r] (prn r))})}
  ;; ;;   "Save"]
  ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
  ;;                                         {:format :json
  ;;                                          :params @data
  ;;                                          :handler (fn [r] (reset! xml r))
  ;;                                          :error-handler (fn [r] (prn r))})}
  ;;   "Save"]

   ; DEBUG data structure
   [:hr]
   [:div [:pre (with-out-str (pp/pprint @data))]]
   [:div "---------------------------------------------------------"]
   [:div [:pre @xml]]])

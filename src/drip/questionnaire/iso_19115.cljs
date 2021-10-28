(ns drip.questionnaire.iso-19115
  (:require
   [cljs.pprint :as pp]

   [reagent.core :as r :refer [cursor with-let]]
   [reagent.ratom :refer [make-reaction]]

   [drip.config :refer [userid md is-admin]]
   [drip.inputs :as inputs]
   [drip.menus :as menus]))


;; (def xml (r/atom ""))

(defn iso-19115 [data]
  (with-let [edit (make-reaction (fn []
                                   (and
                                    (some? @userid)
                                    (or
                                     @is-admin
                                     (= @userid (:uid @md))
                                     (nil? (:uid @md))))))]
    ;; [:div {:class "mt-6 sm:mt-5 space-y-6 sm:space-y-5"}
    [:<>
     [inputs/text-form-group
      {:label       "Title"
       :placeholder "Enter title"
       :description "The title of the dataset"
       :data        (cursor data [:citation :title])
       :edit        @edit}]

     [inputs/form-group {:input-component #(inputs/select-input {:options menus/currencies
                                                                 :data    %
                                                                 :edit    @edit})
                         :label           "Currency (not ISO)"
                         :data            (cursor data [:currency])}]


     ;; Dates - TODO avoid passing :edit twice
     [inputs/multi-form-group {:input-components {:date #(inputs/date-and-type-input {:data % :edit @edit})}
                               :new-data         {:date {:type nil :date nil}}
                               :label            "Dates"
                               :add-labels       {:date "date"}
                               :data             (cursor data [:citation :dates])
                               :edit             @edit}]



   ;;  Abstract
    ;;  [inputs/textarea-form-group-loc {:label       "Abstract"
    ;;                                   :placeholder "Enter abstract"
    ;;                                   ;; :description "The dataset abstract"
    ;;                                   :data        (cursor data [:abstract :loc])
    ;;                                   :edit        @edit}]
     [inputs/textarea-form-group {:label       "Abstract"
                                  :placeholder "Enter abstract"
                                  :data        (cursor data [:abstract])
                                  :edit        @edit}]

     [inputs/textarea-form-group {:label       "Purpose"
                                  :placeholder "Enter purpose"
                                  :data        (cursor data [:purpose])
                                  :edit        @edit}]

     ;;  Status
    ;;  [inputs/form-group {:input-component #(inputs/select-input {:options menus/status-items
    ;;                                                              :data    %
    ;;                                                              :edit    @edit})
    ;;                      :label           "Status"
    ;;                      :data            (cursor data [:status])}]

     ;;  Points of contact
     [inputs/multi-form-group {:input-components {:poc #(inputs/point-of-contact {:data %
                                                                                  :edit @edit})}
                               :new-data         {:poc {:role            nil
                                                        :organization    nil
                                                        :individual-name nil
                                                        :address         nil
                                                        :email           nil}}
                               :label            "Points of contact"
                               :add-labels       {:poc "point of contact"}
                               :data             (cursor data [:points-of-contact])
                               :edit             @edit}]

      ;; Topic categories
     [inputs/multi-form-group {:input-components {:topic-category #(inputs/select-input {:options menus/topic-categories
                                                                                         :data    %
                                                                                         :edit    @edit})}
                               :new-data         {:topic-category nil}
                               :label            "Topic categories"
                               :add-labels       {:topic-category "Topic category"}
                               :data             (cursor data [:topic-categories])
                               :edit             @edit}]

    ;;  ;;  Topic categories
    ;;  [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/keywords
    ;;                                                                       :data    %
    ;;                                                                       :edit    @edit})
    ;;                      :label           "Topic categories"
    ;;                      :data            (cursor data [:topic-categories])}]

     ;;  Keywords
     [inputs/multi-form-group {:input-components {:keyword-group #(inputs/keywords {:data %
                                                                                    :edit @edit})}
                               :new-data         {:keyword-group {:type :place :keywords []}}
                               :label            "Keywords"
                               :add-labels       {:keyword-group "keyword type"}
                               :data             (cursor data [:keywords])
                               :edit             @edit}]

     [inputs/date-form-group
      {:label       "Begin date"
       :data        (cursor data [:begin-date])
       :edit        @edit}]

     [inputs/date-form-group
      {:label       "End date"
       :data        (cursor data [:end-date])
       :edit        @edit}]
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
    ;;  [:hr]
    ;;  [:div [:pre (with-out-str (pp/pprint @data))]]
    ;;  [:div [:pre @xml]]




    ;;  [:div {:class "sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5"}
    ;;   [:label {:for "username", :class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"}
    ;;    "Username"]
    ;;   [:div {:class "mt-1 sm:mt-0 sm:col-span-2"}
    ;;    [:div {:class "max-w-lg flex rounded-md shadow-sm"}
    ;;     [:span {:class "inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"}
    ;;      "workcation.com/"]
    ;;     [:input {:type "text", :name "username", :id "username", :autoComplete "username", :class "flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"}]]]]
    ;;  [:div {:class "sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5"}
    ;;   [:label {:for "about", :class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"}
    ;;    "About"]
    ;;   [:div {:class "mt-1 sm:mt-0 sm:col-span-2"}
    ;;    [:textarea {:id "about", :name "about", :rows "3", :class "max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"}]
    ;;    [:p {:class "mt-2 text-sm text-gray-500"}
    ;;     "Write a few sentences about yourself."]]]
    ;;  [:div {:class "sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:border-t sm:border-gray-200 sm:pt-5"}
    ;;   [:label {:for "photo", :class "block text-sm font-medium text-gray-700"}
    ;;    "Photo"]
    ;;   [:div {:class "mt-1 sm:mt-0 sm:col-span-2"}
    ;;    [:div {:class "flex items-center"}
    ;;     [:span {:class "h-12 w-12 rounded-full overflow-hidden bg-gray-100"}
    ;;      [:svg {:class "h-full w-full text-gray-300", :fill "currentColor", :viewBox "0 0 24 24"}
    ;;       [:path {:d "M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"}]]]
    ;;     [:button {:type "button", :class "ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
    ;;      "Change"]]]]
    ;;  [:div {:class "sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5"}
    ;;   [:label {:for "cover_photo", :class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"}
    ;;    "Cover photo"]
    ;;   [:div {:class "mt-1 sm:mt-0 sm:col-span-2"}
    ;;    [:div {:class "max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"}
    ;;     [:div {:class "space-y-1 text-center"}
    ;;      [:svg {:class "mx-auto h-12 w-12 text-gray-400", :stroke "currentColor", :fill "none", :viewBox "0 0 48 48", :aria-hidden "true"}
    ;;       [:path {:d "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", :stroke-width "2", :stroke-linecap "round", :stroke-linejoin "round"}]]
    ;;      [:div {:class "flex text-sm text-gray-600"}
    ;;       [:label {:for "file-upload", :class "relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"}
    ;;        [:span "Upload a file"]
    ;;        [:input {:id "file-upload", :name "file-upload", :type "file", :class "sr-only"}]]
    ;;       [:p {:class "pl-1"}
    ;;        "or drag and drop"]]
    ;;      [:p {:class "text-xs text-gray-500"}
    ;;       "PNG, JPG, GIF up to 10MB"]]]]]
     ]))



;; (defn iso-19115 [data]
;;   (with-let [edit (make-reaction (fn []
;;                                    (and
;;                                     (some? @userid)
;;                                     (or
;;                                      (= @userid (:uid @md))
;;                                      (nil? (:uid @md))))))]
;;     [:div {:class "pt-6"}
;;      [:h1 {:class "text-3xl"} "Metadata"]

;;      [inputs/text-form-group-loc
;;       {:label       "Title"
;;        :placeholder "Enter title"
;;        :description "The title of the dataset"
;;        :data        (cursor data [:citation :title :loc])
;;        :edit        @edit}]

;;      ;;  Dates - TODO avoid passing :edit twice
;;      [inputs/multi-form-group-2 {:input-components {:date #(inputs/date-and-type-input {:data %
;;                                                                                         :edit true})}
;;                                  :new-data         {:date {:type nil :date nil}}
;;                                  :label            "Dates"
;;                                  :add-labels       {:date "date"}
;;                                  :data             (cursor data [:citation :dates])
;;                                  :edit             @edit}]

;;      ;;  Abstract
;;      [inputs/textarea-form-group-loc {:label       "Abstract"
;;                                       :placeholder "Enter abstract"
;;                                       :description "The dataset abstract"
;;                                       :data        (cursor data [:abstract :loc])
;;                                       :edit        @edit}]

;;      ;;  Status
;;      [inputs/form-group {:input-component #(inputs/select-input {:options menus/status-items
;;                                                                  :data    %
;;                                                                  :edit    @edit})
;;                          :label           "Status"
;;                          :data            (cursor data [:status])}]

;;      ;;  Points of contact
;;      [inputs/multi-form-group-2 {:input-components {:poc #(inputs/point-of-contact {:data %
;;                                                                                     :edit @edit})}
;;                                  :new-data         {:poc {:role nil
;;                                                           :organization    nil
;;                                                           :individual-name nil
;;                                                           :web-address     nil
;;                                                           :email           nil}}
;;                                  :label            "Points of contact"
;;                                  :add-labels       {:poc "point of contact"}
;;                                  :data             (cursor data [:points-of-contact])
;;                                  :edit             @edit}]

;;      ;;  Topic categories
;;      [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/keywords
;;                                                                           :data    %
;;                                                                           :edit    @edit})
;;                          :label           "Topic categories"
;;                          :data            (cursor data [:topic-categories])}]

;;      ;;  Keywords
;;      [inputs/multi-form-group-2 {:input-components {:keyword-group #(inputs/keywords {:data %
;;                                                                                       :edit @edit})}
;;                                  :new-data         {:keyword-group {:type :place :keywords []}}
;;                                  :label            "Keywords"
;;                                  :add-labels       {:keyword-group "keyword type"}
;;                                  :data             (cursor data [:keywords])
;;                                  :edit             @edit}]

;;   ;;  Demo single-type field group
;;   ;;  [inputs/multi-form-group-2 {:input-components {:text    #(inputs/text-input {:data %})}
;;   ;;                              :new-data         {:text "new text"}
;;   ;;                              :label            "text test"
;;   ;;                              :add-labels       {:text "Text"}
;;   ;;                              :data             (cursor data [:multi-type-input-test2])}]

;;   ;;  ; Demo multy-type field group
;;   ;;  [inputs/multi-form-group-2 {:input-components {:keyword #(inputs/keywords {:data %})
;;   ;;                                                 :text    #(inputs/text-input {:data %})}
;;   ;;                              :new-data         {:keyword {:type :author :keywords ["new kw"]}
;;   ;;                                                 :text "new text"}
;;   ;;                              :label            "Keywords or text"
;;   ;;                              :add-labels       {:text "Text" :keyword "Keyword"}
;;   ;;                              :data             (cursor data [:multi-type-input-test])}]

;;   ;; ; Demo multy-type field group
;;   ;; ;;  [inputs/multi-form-group
;;   ;; ;;   {:input-component #(inputs/text-input {:placeholder "Placeholder"
;;   ;; ;;                                          :description "This is the description"
;;   ;; ;;                                          :data        %})
;;   ;; ;;    :new-data        nil
;;   ;; ;;    :label           "Test multi text"
;;   ;; ;;    :data            (cursor data [:test-multi-text])}]

;;   ;;  [inputs/text-form-group
;;   ;;   {:label       "test text"
;;   ;;    :description "This is the help text"
;;   ;;    :placeholder "Acdsdf"
;;   ;;    :data        (cursor data [:test-text])}]
;;   ;;  [inputs/form-group
;;   ;;   {:input-component #(inputs/text-input {:data %})
;;   ;;    :label           "Test text"
;;   ;;    :data            (cursor data [:test-text])}]

;;   ;; ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
;;   ;; ;;                                         {:headers {"x-csrf-token" (.-value (.getElementById js/document "__anti-forgery-token"))}
;;   ;; ;;                                          :format :json
;;   ;; ;;                                          :params @data
;;   ;; ;;                                          :handler (fn [r] (reset! xml r))
;;   ;; ;;                                          :error-handler (fn [r] (prn r))})}
;;   ;; ;;   "Save"]
;;   ;;  [:button.btn.btn-primary {:on-click #(POST "/md"
;;   ;;                                         {:format :json
;;   ;;                                          :params @data
;;   ;;                                          :handler (fn [r] (reset! xml r))
;;   ;;                                          :error-handler (fn [r] (prn r))})}
;;   ;;   "Save"]

;;    ; DEBUG data structure
;;      [:hr]
;;      [:div [:pre (with-out-str (pp/pprint @data))]]
;;      [:div "---------------------------------------------------------"]
;;      [:div [:pre @xml]]]))

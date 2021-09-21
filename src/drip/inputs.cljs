(ns drip.inputs
  (:require
   [reagent.core :as r :refer [cursor with-let]]
   [drip.config :as config]
   [drip.menus :as menus]
   [drip.icons :as icons])
  (:import
   [goog.ui IdGenerator]))

(defn gen-dom-id []
  ^js/string (.getNextUniqueId (.getInstance IdGenerator)))

;; -------------------------
;; Simple inputs - no labels, basic layout
;;

(defn- empty-to-nil [value]
  (if (= "" value) nil value))


(defn text-input
  [{:keys [placeholder description data edit]}]
  [:<>
   (if edit
     [:input {:type "text"
              :class "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              :value       (or @data "")
              :placeholder placeholder
              :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
    ;;  [:input.form-control.form-control-sm {:type       "text"
    ;;                                        :value       (or @data "")
    ;;                                        :placeholder placeholder
    ;;                                        :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"}
                      description])])

(defn textarea-input
  [{:keys [placeholder description data edit]}]
  [:<>
   (if edit
     [:textarea {:rows "3"
                 :value       (or @data "")
                 :placeholder placeholder
                 :on-change   #(reset! data (-> % .-target .-value empty-to-nil))
                 :class "max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"}]
    ;;  [:textarea.form-control.form-control-sm {:type       "text"
    ;;                                           :value       (or @data "")
    ;;                                           :placeholder placeholder
    ;;                                           :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"}
                      description])])

(defn number-input
  [{:keys [placeholder description data edit]}]
  [:<>
   (if edit
    ;;  [:input.form-control.form-control-sm {:type       "number"
    ;;                                        :value       (or @data "")
    ;;                                        :placeholder placeholder
    ;;                                        :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
     [:input {:type        "number"
              :class       "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              :value       (or @data "")
              :placeholder placeholder
              :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"}
                      description])])

(defn get-select-label [key options]
  (second (first (filter (fn [[k _]] (= k (keyword key))) options))))

(defn select-input [{:keys [options placeholder description data edit] :or {placeholder "Please select"}}]
  [:<>
   (if edit
    ;;  [:select.form-control.form-control-sm {:value (or @data "")
    ;;                                         :on-change #(reset! data (-> % .-target .-value empty-to-nil keyword))}
    ;;   [:option {:value ""} placeholder]
    ;;   (for [[value label] options]
    ;;     [:option {:key value :value (or value label)} label])]
     [:select {:class "max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
               :value (or @data "")
               :on-change #(reset! data (-> % .-target .-value empty-to-nil keyword))}
      [:option {:value ""} placeholder]
      (for [[value label] options]
        [:option {:key value :value (or value label)} (or label value)])]

     (get-select-label @data options))
   (when description [:p {:class "mt-2 text-sm text-gray-500"}
                      description])])

(defn select-multiple-input [{:keys [options description data edit]}]
  [:<>
   (if edit
    ;;  [:select.form-control.form-control-sm {:value @data
    ;;                                         :multiple true
    ;;                                         :style {:height "150px"}
    ;;                                         :on-change (fn [evt]
    ;;                                                      (reset! data (->> evt
    ;;                                                                        .-target
    ;;                                                                        .-options
    ;;                                                                        (filter #(.-selected %))
    ;;                                                                        (map #(.-value %))
    ;;                                                                        (into []))))}
    ;;   (for [[value label] options]
    ;;     [:option {:key value :value (or value label)} (or label value)])]
     
     [:select {:class "max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
               :value @data
               :multiple true
               :style {:height "150px"}
               :on-change (fn [evt]
                            (reset! data (->> evt
                                              .-target
                                              .-options
                                              (filter #(.-selected %))
                                              (map #(.-value %))
                                              (into []))))}
      (for [[value label] options]
        [:option {:key value :value (or value label)} (or label value)])]
     
     (for [[d] @data] (get-select-label d options)))
   (when description [:p {:class "mt-2 text-sm text-gray-500"}
                      description])])

(defn date-input [{:keys [description data edit]}]
  [:<>
   (if edit
    ;; [:<>
    ;;  [:input.form-control.form-control-sm {:type      "date"
    ;;                                        :value     (or @data "")
    ;;                                        :style     {:height "38px"} ; by default date field is taller than the other inputs
    ;;                                        :on-change #(reset! data (reset! data (-> % .-target .-value empty-to-nil)))}]
    ;;  (when description [:small.form-text.text-muted description])]
     [:input {:type      "date"
              :class     "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              :value     (or @data "")
              :style     {:height "38px"} ; by default date field is taller than the other inputs
              :on-change #(reset! data (reset! data (-> % .-target .-value empty-to-nil)))}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"}
                      description])])

; TODO move to another file
(defn- vec-remove [pos coll]
  (vec (concat (subvec coll 0 pos) (subvec coll (inc pos)))))


(defn multi-input
  "Creates a multi-input from an input-component, adding \"add\" and \"delete\"
   buttons to add/delete items. @data must be a vector. Can handle multiple input types
   
   Sample arg:
   
   {:input-components {:keyword #(inputs/keywords {:data %})
                       :text    #(inputs/text-input {:data %})}
    :new-data         {:keyword {:type :author :keywords [\"kw\"]}
                       :text \"new text \"}
    :label            \"Keywords or text \"
    :add-labels       {:text \"Text \" :keyword \"Keyword\"}
    :data             [[:keyword {:type :discipline :keywords [\"kw1\" \"kw2\"]}]
                       [:text \"text \"]]}"
  [{:keys [input-components description data new-data add-labels edit]}]
  (with-let [button-id (gen-dom-id)]
    [:div {:class "border p-3 rounded rounded-md"}
     (doall (for [n (range (count @data))]
              ; TODO using n as a key for now - will find a proper one
              [:div {:key n}
               [:div {:class "flex flex-row mb-5"}
                
                (let [input-component-def  (nth @data n)
                      input-component-type (-> input-component-def first first) ; get key - there's only one
                      input-component-data (cursor data [n input-component-type])
                      input-component      (get input-components input-component-type)]
                  [:div {:class "pl-0"} (input-component input-component-data)])
                (when edit
                  [:div {:class "pl-3 pt-3"}
                   [:div {:class "text-red-600 cursor-pointer"
                          :on-click (fn []
                                      (when (js/confirm "Are you sure you want to delete this item?")
                                        (swap! data #(vec-remove n %))))}
                    icons/trash]])]]))
     (when description [:p {:class "mt-1 text-sm text-gray-500"}
                        description])

     ; "Add" button
     (when edit
       (if (> (count input-components) 1)
       ; If there's more than one input component, show a dropdown menu
         [:<>
          [:div.btn.btn-primary.btn-sm.dropdown-toggle {:type "button"
                                                        :id button-id
                                                        :data-toggle "dropdown"
                                                        :aria-haspopup "true"
                                                        :aria-expanded "false"}
           "Add"]
          [:div.dropdown-menu {:aria-labelledby button-id}
           (doall (for [component input-components
                        :let [k (key component)]]
                    [:a.dropdown-item {:key      k
                                     ; Not using swap! - Using into and reset!
                                     ; because (conj nil x) returns (x) instead of [x].
                                     ; Causes problems when adding the first item
                                       :on-click #(reset! data (into [] (conj @data [k (get new-data k)])))}
                     (get add-labels k)]))]]
         ; Otherwise, show just a button
         [:button {:type "button" 
                   :on-click #(reset! data (into [] (conj @data new-data)))
                   :class "inline-flex items-center px-2.5 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
          "Add " (-> add-labels first val)]

        ;;  [:div.btn.btn-primary.btn-sm {:type "button"
        ;;                              ; Using into and reset! - see comment above
        ;;                                :on-click #(reset! data (into [] (conj @data new-data)))}
        ;;   "Add " (-> add-labels first val)]
         ))]))

;; -------------------------
;; Form groups - wrap other inputs (also form groups themselves) with layout, labels and description
;;

(defn- form-group-wrapper [{:keys [label description]} & children]
  [:fieldset.form-group.pt-3
   [:div {:class "sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5"}
    [:legend {:class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"} label]
    (into [:div {:class "mt-1 sm:mt-0 sm:col-span-3"}] ;; TODO - add class?
          (concat children
                  [(when description [:p {:class "mt-2 text-sm text-gray-500"}
                                      description])]))]])

(defn form-group
  "Creates a form group from a simple input - i.e. adds label and layout"
  [{:keys [input-component label description data]}]

  ;; [form-group-wrapper {:label label :description description}
  ;;  [:div.container
  ;;   [:div.row
  ;;    [:div.col.pl-0 (input-component data)]]]]
  
  [:fieldset
   [:div {:class "sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5"}
    [:legend {:class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"} label]
   ;;  [:label {:class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"}
   ;;   label]
    [:div {:class "mt-1 sm:mt-0 sm:col-span-3"}
     (input-component data)
     (when description [:p {:class "mt-2 text-sm text-gray-500"} description])]]])

(comment [:div {:class "sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5"}
          [:label {:for "first_name", :class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"}
           "First name"]
          [:div {:class "mt-1 sm:mt-0 sm:col-span-3"}
           [:input {:type "text", :name "first_name", :id "first_name", :autocomplete "given-name", :class "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"}]]])

(defn multi-form-group
  "Creates a multiple form group from a simple input - adds label and description"
  [{:keys [input-components label description new-data add-labels data edit]}]
  [form-group-wrapper {:label label :description description}
   [multi-input {:input-components input-components
                   :new-data         new-data
                   :add-labels       add-labels
                   :data             data
                   :edit             edit}]])

; UTILITY FUNCTIONS
(defn text-form-group [args]
  [form-group (assoc args :input-component #(text-input {:placeholder "Please enter text"
                                                         :data %
                                                         :edit (:edit args)}))])

(defn number-form-group [args]
  [form-group (assoc args :input-component #(number-input {:data %
                                                           :edit (:edit args)}))])

(defn date-form-group [args]
  [form-group (assoc args :input-component #(date-input {:data %
                                                         :edit (:edit args)}))])

(defn textarea-form-group [args]
  [form-group (assoc args :input-component #(textarea-input {:data %
                                                             :edit (:edit args)}))])

;; ; TODO dissoc :options from args
;; (defn select-form-group [args]
;;   [form-group (assoc args :input-component #(select-input {:data % :options (:options args)}))])

; TODO refactor next two components

(defn text-form-group-loc [{:keys [label placeholder description data edit]}]
  (with-let [input-id (gen-dom-id)]
    [:div.form-group.row.pt-3
     [:span.col-md-2.col-form-label.pt-0 label]
     [:div.col-md-10
      (doall (for [[lang-id labels] config/languages]
               (if edit
                 [:div.input-group {:key lang-id}
                  [:div.input-group-prepend
                   [:span.input-group-text {:id (str input-id "_l_" lang-id)} (:label-short labels)]]
                  [:input.form-control.form-control-sm {:id (str input-id "_" lang-id)
                                                        :type             "text"
                                                        :value            (get @data lang-id)
                                                        :aria-describedby (str input-id "_l_" lang-id)
                                                        :placeholder      placeholder
                                                        :on-change        #(swap! data assoc lang-id (-> % .-target .-value))}]]
                 (str (:label-short labels) " - " (get @data lang-id)))))
      [:small.form-text.text-muted  description]]]))

(defn textarea-form-group-loc [{:keys [label placeholder description data edit]}]
  (with-let [input-id (gen-dom-id)]
    [:div.form-group.row.pt-3
     [:span.col-md-2.col-form-label.pt-0 label]
     [:div.col-md-10
      (doall (for [[lang-id labels] config/languages]
               (if edit
                 [:div.input-group {:key lang-id}
                  [:div.input-group-prepend
                   [:span.input-group-text {:id (str input-id "_l_" lang-id)} (:label-short labels)]]
                  ;; [:textarea {:id               (str input-id "_" lang-id)
                  ;;             :value            (get @data lang-id)
                  ;;             :rows             3
                  ;;             :aria-describedby (str input-id "_l_" lang-id)
                  ;;             :placeholder      placeholder
                  ;;             :on-change        #(swap! data assoc lang-id (-> % .-target .-value))
                  ;;             :class "max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"}]
                  [:textarea.form-control.form-control-sm {:id               (str input-id "_" lang-id)
                                                           :value            (get @data lang-id)
                                                           :rows             3
                                                           :aria-describedby (str input-id "_l_" lang-id)
                                                           :placeholder      placeholder
                                                           :on-change        #(swap! data assoc lang-id (-> % .-target .-value))}]
                  ]
                 (str (:label-short labels) " - " (get @data lang-id)))))
      [:small.form-text.text-muted description]]]))

(defn- horizontal-layout
  [& children]
  [:div {:class "flex flex-row space-x-4"}
   (doall (for [i (range (count children))]
            [:div {:key i} (nth children i)]))])


;; -------------------------
;; ISO 19139 Metadata specific inputs

(defn date-and-type-input [{:keys [data edit]}]
  [horizontal-layout
   [select-input
    {:options     menus/date-types
     :description "Type"
     :data        (cursor data [:type])
     :edit        edit}]
   [date-input {:description "Date"
                :data        (cursor data [:date])
                :edit        edit}]])

(defn point-of-contact [{:keys [data edit]}]
  [horizontal-layout
   [select-input {:options     menus/poc-roles
                  :description "Role"
                  :data        (cursor data [:role])
                  :edit edit}]
   [text-input {:description "Organization"
                :data        (cursor data [:organization])
                :edit edit}]
   [text-input {:description "Individual name"
                :data        (cursor data [:individual-name])
                :edit edit}]
   [text-input {:description "Address"
                :data        (cursor data [:address])
                :edit edit}]
   [text-input {:description "Email"
                :data        (cursor data [:email])
                :edit edit}]])

(defn keywords [{:keys [data edit]}]
  [horizontal-layout
   [select-input {:options     menus/keyword-types
                  :description "Keyword type"
                  :data        (cursor data [:type])
                  :edit        edit}]
   [multi-input {:input-components {:keyword #(text-input {:placeholder "Keyword" 
                                                             :data %
                                                             :edit edit})}
                   :new-data         {:keyword nil}
                   :add-labels       {:keyword "keyword"}
                   :data             (cursor data [:keywords])
                   :edit             edit}]])

(defn measurement [{:keys [data edit]}]
  [horizontal-layout
   [number-input {:description "Mean"
                  :data (cursor data [:value])
                  :edit edit}]
   [number-input {:description "Std dev"
                  :data (cursor data [:error])
                  :edit edit}]])









(defn agency-input [{:keys [data edit]}]
  [horizontal-layout
   [select-input {:options     menus/agencies
                  :description "Agency"
                  :data        (cursor data [:agency])
                  :edit        edit}]
   [select-input {:options     menus/agency-roles
                  :description "Role"
                  :data        (cursor data [:role])
                  :edit        edit}]])
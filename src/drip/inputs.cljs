(ns drip.inputs
  (:require
   [reagent.core :as r :refer [cursor with-let]]
   [drip.config :as config]
   [drip.menus :as menus]
   [drip.icons :as icons])
  (:import
   [goog.ui IdGenerator]))

(defn gen-dom-id []
  (.getNextUniqueId (.getInstance IdGenerator)))

;; -------------------------
;; Simple inputs - no labels, basic layout
;;

(defn- empty-to-nil [value]
  (if (= "" value) nil value))

(defn text-input
  [{:keys [placeholder description data]}]
  [:<>
   [:input.form-control.form-control-sm {:type       "text"
                                         :value       (or @data "")
                                         :placeholder placeholder
                                         :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
   (when description [:small.form-text.text-muted description])])

(defn textarea-input
  [{:keys [placeholder description data]}]
  [:<>
   [:textarea.form-control.form-control-sm {:type       "text"
                                            :value       (or @data "")
                                            :placeholder placeholder
                                            :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
   (when description [:small.form-text.text-muted description])])

(defn number-input
  [{:keys [placeholder description data]}]
  [:<>
   [:input.form-control.form-control-sm {:type       "number"
                                         :value       (or @data "")
                                         :placeholder placeholder
                                         :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
   (when description [:small.form-text.text-muted description])])

(defn select-input [{:keys [options placeholder description data] :or {placeholder "Please select"}}]
  [:<>
   [:select.form-control.form-control-sm {:value (or @data "")
                                          :on-change #(reset! data (-> % .-target .-value empty-to-nil keyword))}
    [:option {:value ""} placeholder]
    (for [[value label] options]
      [:option {:key value :value (or value label)} label])]
   (when description [:small.form-text.text-muted description])])

(defn select-multiple-input [{:keys [options description data]}]
  [:<>
   [:select.form-control.form-control-sm {:value @data
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
   (when description [:small.form-text.text-muted description])])

(defn date-input [{:keys [description data]}]
  [:<>
   [:input.form-control.form-control-sm {:type      "date"
                                         :value     (or @data "")
                                         :style     {:height "38px"} ; by default date field is taller than the other inputs
                                         :on-change #(reset! data (reset! data (-> % .-target .-value empty-to-nil)))}]
   (when description [:small.form-text.text-muted description])])

; TODO move to another file
(defn- vec-remove [pos coll]
  (vec (concat (subvec coll 0 pos) (subvec coll (inc pos)))))


;; This is not used anymore, replaced by multi-input-2
;; (defn multi-input
;;   "Creates a multi-input from an input-component, adding \"add\" and \"delete\" buttons to add/delete items. @data must be a vector
   
;;    Sample arg:
   
;;    {:input-component #(inputs/keywords {:data %})
;;     :new-data        {:type :author :keywords [nil]}
;;     :label           \"Keywords\"
;;     :add-label       \"keyword type\"
;;     :data            [{:type :discipline :keywords [nil]}]}"
;;   [{:keys [input-component description data new-data add-label]}]
;;   [:div.border.p-3
;;    (doall (for [i (range (count @data))]
;;             ; TODO using i as a key for now - will find a proper one
;;             [:div.container {:key i}
;;              [:div.row.mb-2
;;               [:div.col.pl-0 (input-component (cursor data [i]))]
;;               [:div.col-auto.pr-0
;;                [:div.text-danger {:style {:cursor "pointer" :margin-top "9px"}
;;                                   :on-click (fn []
;;                                               (when (js/confirm "Are you sure you want to delete this item?")
;;                                                 (swap! data #(vec-remove i %))))} icons/trash]]]]))
;;    (when description [:small.form-text.text-muted description])
;;    [:div.btn.btn-primary.btn-sm {:type "button"
;;                                  :on-click #(swap! data conj new-data)}
;;     "Add " add-label]])


(defn multi-input-2
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
  [{:keys [input-components description data new-data add-labels]}]
  (with-let [button-id (gen-dom-id)]
    [:div.border.p-3
     (doall (for [n (range (count @data))]
              ; TODO using n as a key for now - will find a proper one
              [:div.container {:key n}
               [:div.row.mb-2
                (let [input-component-def  (nth @data n)
                      input-component-type (-> input-component-def first first) ; get key - there's only one
                      input-component-data (cursor data [n input-component-type])
                      input-component      (get input-components input-component-type)]
                  [:div.col.pl-0 (input-component input-component-data)])
                [:div.col-auto.pr-0
                 [:div.text-danger {:style {:cursor "pointer" :margin-top "9px"}
                                    :on-click (fn []
                                                (when (js/confirm "Are you sure you want to delete this item?")
                                                  (swap! data #(vec-remove n %))))}
                  icons/trash]]]]))
     (when description [:small.form-text.text-muted description])

     ; "Add" button
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
       [:div.btn.btn-primary.btn-sm {:type "button"
                                     ; Using into and reset! - see comment above
                                     :on-click #(reset! data (into [] (conj @data new-data)))}
        "Add " (-> add-labels first val)])]))

;; -------------------------
;; Form groups - wrap other inputs (also form groups themselves) with layout, labels and description
;;

(defn- form-group-wrapper [{:keys [label description]} & children]
  [:fieldset.form-group.pt-3
   [:div.row
    [:legend.col-form-label.col-md-2.pt-0 label]
    (into [:div.col-md-10]
          (concat children
                  [(when description [:small.form-text.text-muted description])]))]])

(defn form-group
  "Creates a form group from a simple input - i.e. adds label and layout"
  [{:keys [input-component label description data]}]
  [form-group-wrapper {:label label :description description}
   [:div.container
    [:div.row
     [:div.col.pl-0 (input-component data)]]]])

(defn multi-form-group-2
  "Creates a multiple form group from a simple input - adds label and description"
  [{:keys [input-components label description new-data add-labels data]}]
  [form-group-wrapper {:label label :description description}
   [multi-input-2 {:input-components input-components
                   :new-data         new-data
                   :add-labels       add-labels
                   :data             data}]])

; UTILITY FUNCTIONS
(defn text-form-group [args]
  [form-group (assoc args :input-component #(text-input {:placeholder "Please enter text" :data %}))])

(defn number-form-group [args]
  [form-group (assoc args :input-component #(number-input {:data %}))])

(defn date-form-group [args]
  [form-group (assoc args :input-component #(date-input {:data %}))])

(defn textarea-form-group [args]
  [form-group (assoc args :input-component #(textarea-input {:data %}))])

;; ; TODO dissoc :options from args
;; (defn select-form-group [args]
;;   [form-group (assoc args :input-component #(select-input {:data % :options (:options args)}))])

; TODO refactor next two components

(defn text-form-group-loc [{:keys [label placeholder description data]}]
  (with-let [input-id (gen-dom-id)]
    [:div.form-group.row.pt-3
     [:span.col-md-2.col-form-label.pt-0 label]
     [:div.col-md-10
      (doall (for [[lang-id labels] config/languages]
               [:div.input-group {:key lang-id}
                [:div.input-group-prepend
                 [:span.input-group-text {:id (str input-id "_l_" lang-id)} (:label-short labels)]]
                [:input.form-control.form-control-sm {:id (str input-id "_" lang-id)
                                                      :type             "text"
                                                      :value            (get @data lang-id)
                                                      :aria-describedby (str input-id "_l_" lang-id)
                                                      :placeholder      placeholder
                                                      :on-change        #(swap! data assoc lang-id (-> % .-target .-value))}]]))
      [:small.form-text.text-muted  description]]]))

(defn textarea-form-group-loc [{:keys [label placeholder description data]}]
  (with-let [input-id (gen-dom-id)]
    [:div.form-group.row.pt-3
     [:span.col-md-2.col-form-label.pt-0 label]
     [:div.col-md-10
      (doall (for [[lang-id labels] config/languages]
               [:div.input-group {:key lang-id}
                [:div.input-group-prepend
                 [:span.input-group-text {:id (str input-id "_l_" lang-id)} (:label-short labels)]]
                [:textarea.form-control.form-control-sm {:id               (str input-id "_" lang-id)
                                                         :value            (get @data lang-id)
                                                         :rows             3
                                                         :aria-describedby (str input-id "_l_" lang-id)
                                                         :placeholder      placeholder
                                                         :on-change        #(swap! data assoc lang-id (-> % .-target .-value))}]]))
      [:small.form-text.text-muted description]]]))

(defn- horizontal-layout
  [& children]
  [:div.form-row
   (doall (for [i (range (count children))]
            [:div.col {:key i} (nth children i)]))])


;; -------------------------
;; Metadata specific inputs

(defn date-and-type-input [{:keys [data]}]
  [horizontal-layout
   [select-input
    {:options     menus/date-types
     :description "Type"
     :data        (cursor data [:type])}]
   [date-input {:description "Date"
                :data        (cursor data [:date])}]])

(defn point-of-contact [{:keys [data]}]
  [horizontal-layout
   [select-input {:options     menus/poc-roles
                  :description "Role"
                  :data        (cursor data [:role])}]
   [text-input {:description "Organization"
                :data        (cursor data [:organization])}]
   [text-input {:description "Individual name"
                :data        (cursor data [:individual-name])}]
   [text-input {:description "Web address"
                :data        (cursor data [:web-address])}]
   [text-input
    {:description "Email"
     :data        (cursor data [:email])}]])

(defn keywords [{:keys [data]}]
  [horizontal-layout
   [select-input {:options     menus/keyword-types
                  :description "Keyword type"
                  :data        (cursor data [:type])}]
   [multi-input-2 {:input-components {:keyword #(text-input {:placeholder "Keyword" :data %})}
                   :new-data         {:keyword nil}
                   :add-labels       {:keyword "keyword"}
                   :data             (cursor data [:keywords])}]])

(defn measurement [{:keys [data]}]
  [horizontal-layout
   [number-input {:description "Mean"
                  :data (cursor data [:value])}]
   [number-input {:description "Std dev"
                  :data (cursor data [:error])}]])
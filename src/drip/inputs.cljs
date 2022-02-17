(ns drip.inputs
  (:require
   [reagent.core :as r :refer [cursor with-let]]
   [drip.config :as config]
   [drip.menus :as menus]
   [drip.icons :as icons]
   [drip.upload :as upload])
  (:import
   [goog.ui IdGenerator]))

(defn gen-dom-id []
  ^js/string (.getNextUniqueId (.getInstance IdGenerator)))

(defn show-info [info]
  (reset! config/modal-content {:title "Values" :message info}))


;; -------------------------
;; Simple inputs - no labels, basic layout
;;

(defn- empty-to-nil [value]
  (if (= "" value) nil value))

(defn input-wrap [inner description]
  [:<>
   [inner]
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])])

(defn text-input
  [{:keys [placeholder description data edit]}]
  [:<>
   (if edit
     [:input {:type "text"
              :class "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              :value       (or @data "")
              :placeholder placeholder
              :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])])

(defn document-input
  [{:keys [project-id placeholder path description data edit]  :or {path []}}]
  (with-let [selected-file (r/atom nil)
             input-ref (r/atom nil)]
    [:div
     [:label {:for "file", :class "block text-sm font-medium text-gray-700"} ""]
     [:div {:class "mt-1 flex rounded-md shadow-sm"}
      [:div {:class "flex-grow focus-within:z-10"}
       [:input {:ref #(reset! input-ref %)
                :on-change (fn [event]
                             (let [files (.. event -target -files) ; returns JS Array
                                   file  (first files)]
                               (reset! selected-file file)))
                :type "file"
                :name "file"
                :class "focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                :placeholder placeholder}]]
      [:button {:on-click (fn []
                            (.then
                             (upload/upload-file project-id path @selected-file)
                             (set! (.-value @input-ref) "")
                             (js/alert "Uploaded")))
                :type "button"
                :class "-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"}
       [:svg {:xmlns "http://www.w3.org/2000/svg", :class "h-5 w-5 text-gray-400", :viewBox "0 0 20 20", :fill "currentColor"}
        [:path {:fill-rule "evenodd", :d "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z", :clip-rule "evenodd"}]]
       [:span "Upload"]]]]))

;; (defn textarea-input-test []
;;   ;TODO use input wrap;
;;   )

(defn textarea-input
  [{:keys [placeholder description data edit]}]
  [:<>
   (if edit
     [:textarea {:rows "3"
                 :value       (or @data "")
                 :placeholder placeholder
                 :on-change   #(reset! data (-> % .-target .-value empty-to-nil))
                 :class "max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])])

(defn number-input
  [{:keys [placeholder description data edit]}]
  [:<>
   (if edit
     [:input {:type        "number"
              :class       "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              :value       (or @data "")
              :placeholder placeholder
              :on-change   #(reset! data (-> % .-target .-value empty-to-nil))}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])])

(defn get-select-label [key options]
  (second (first (filter (fn [[k _]] (= k (keyword key))) options))))

(defn select-input [{:keys [options placeholder description info data edit] :or {placeholder "Please select"}}]
  [:<>
   (if edit
     [:select {:class "max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
               :value (or @data "")
               :on-change #(reset! data (-> % .-target .-value empty-to-nil keyword))}
      [:option {:value ""} placeholder]
      (for [[value label] options]
        [:option {:key value :value (or value label)} (or label value)])]

     (get-select-label @data options))
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])
   (when info [:div {:class "text-yellow-500"
                     :on-click #(show-info info)} icons/info])])

(defn select-multiple-input [{:keys [options description data edit]}]
  [:<>
   (if edit
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
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])])

(defn date-input [{:keys [description data edit]}]
  [:<>
   (if edit
     [:input {:type      "date"
              :class     "max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              :value     (or @data "")
              :style     {:height "38px"} ; by default date field is taller than the other inputs
              :on-change #(reset! data (reset! data (-> % .-target .-value empty-to-nil)))}]
     (or @data ""))
   (when description [:p {:class "mt-2 text-sm text-gray-500"} description])])

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
  [{:keys [input-components description data new-data add-labels edit numbering] :or {numbering false}}]
  (with-let [button-id (gen-dom-id)
             _ (js/console.log (clj->js @data))]
    [:div {:class "border p-3 rounded rounded-md divide-y"}
     (doall (for [n (range (count @data))]
              ; TODO using n as a key for now - will find a proper one
              [:div {:key n}
               (when numbering
                ;;  [:div {:class "mt-5"}]
                 [:span {:href "#", :class "mt-5 flex items-center text-sm font-medium", :aria-current "n"}
                  [:span {:class "flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-indigo-600 rounded-full"}
                   [:span {:class "text-indigo-600"} (+ 1 n)]]])
               [:div {:class "flex flex-row my-5"}
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
     (when description [:p {:class "mt-1 text-sm text-gray-500"} description])

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
          "Add " (-> add-labels first val)]))]))

        ;;  [:div.btn.btn-primary.btn-sm {:type "button"
        ;;                              ; Using into and reset! - see comment above
        ;;                                :on-click #(reset! data (into [] (conj @data new-data)))}
        ;;   "Add " (-> add-labels first val)]
         

;; -------------------------
;; Form groups - wrap other inputs (also form groups themselves) with layout, labels and description
;;

(defn- form-group-wrapper [{:keys [label description]} & children]
  [:fieldset {:class "pt-3"}
   [:div {:class "sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start sm:border-t_ sm:border-gray-200_ sm:py-5"}
    [:legend {:class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2_"} label]
    (into [:div {:class "mt-1 sm:mt-0 sm:col-span-3"}]
          (concat children
                  [(when description [:p {:class "mt-2 text-sm text-gray-500"} description])]))]])

(defn form-group
  "Creates a form group from a simple input - i.e. adds label and layout"
  [{:keys [input-component label description data]}]
  [:fieldset
   [:div {:class "sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start sm:border-t_ sm:border-gray-200_ sm:py-5 sm:content-center"}
    [:legend {:class "block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2_"} label]
    [:div {:class "mt-1 sm:mt-0 sm:col-span-3"}
     (input-component data)
     (when description [:p {:class "mt-2 text-sm text-gray-500"} description])]]])

(defn multi-form-group
  "Creates a multiple form group from a simple input - adds label and description"
  [{:keys [input-components label description new-data add-labels data edit numbering]}]
  [form-group-wrapper {:label label :description description}
   [multi-input {:input-components input-components
                 :new-data         new-data
                 :add-labels       add-labels
                 :data             data
                 :edit             edit
                 :numbering        numbering}]])

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

;; (defn file-form-group [args]
;;   [form-group (assoc args :input-component #(text-input {:placeholder "Please upload file"
;;                                                          :data %
;;                                                          :edit (:edit args)}))])

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
                                                           :on-change        #(swap! data assoc lang-id (-> % .-target .-value))}]]
                  
                 (str (:label-short labels) " - " (get @data lang-id)))))
      [:small.form-text.text-muted description]]]))

(defn- horizontal-layout
  [& children]
  [:div {:class "flex flex-row space-x-4"}
   (doall (for [i (range (count children))]
            [:div {:key i} (nth children i)]))])


(defn document-form-group [args]
  [:<>
   [form-group (assoc args :input-component #(document-input {:placeholder "Please enter text"
                                                              :data %
                                                              :edit (:edit args)}))]])


;; -------------------------
;; ISO 19139 Metadata specific inputs

(defn date-and-type-input [{:keys [data edit]}]
  [horizontal-layout
   [select-input
    {:options     menus/date-types
     :description "Type"
     :data        (cursor data [:type])
     :edit        edit
     :info        [:<>
                   [:p "Creation: Date identifies when the resource was brought into existence"]
                   [:p "Publication: Date identifies when the resource was issued"]
                   [:p "Revision: Date identifies when the resource was examined or re-examined and improved or amended"]]}]
   [date-input {:description "Date"
                :data        (cursor data [:date])
                :edit        edit}]])

(defn point-of-contact [{:keys [data edit]}]
  [horizontal-layout
   [select-input {:options     menus/poc-roles
                  :description "Role"
                  :info        [:<>
                                [:p "Author: Party who authored the resource"]
                                [:p "Custodian: Person or organization that accepts accountability and responsibility for the data and ensures appropriate care and maintenance of the resource"]
                                [:p "Distributor: Person or organization that distributes the resource"]
                                [:p "Originator: Person or organization that created or produced the resource"]
                                [:p "Owner: Person or organization that owns the resource"]
                                [:p "Point of contact: Person or organization that can be contacted for acquiring knowledge about or acquisition of the resource"]
                                [:p "Principle investigator: Key person or organization responsible for gathering information and conducting research"]
                                [:p "Processor: Person or organization that has processed the data in a manner such that the resource has been modified"]
                                [:p "Publisher: Person or organization that published the resource"]
                                [:p "Resource provider: Person or organization that provides the resource"]
                                [:p "User: Person or organization that uses the resource"]]
                  :data        (cursor data [:role])
                  :edit        edit}]
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
                  :info        [:<>
                                [:p "Discipline: Keyword identifies a branch of instruction or specialized learning"]
                                [:p "Place: Keyword identifies a location"]
                                [:p "Stratum: Keyword identifies the layer(s) of any deposited substance"]
                                [:p "Temporal: Keyword identifies a time  period related to the dataset"]
                                [:p "Theme: Keyword identifies a particular subject or topic"]]

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

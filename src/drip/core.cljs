(ns drip.core
  (:require
   [reagent.dom :as rdom]
   [reagent.session :as session]
   [reitit.frontend :as rf]
   [reitit.frontend.easy :as rfe]

  ;;  [drip.config :as config]
   [drip.util :refer [href]]
   [drip.questionnaire.md-root :refer [md-root]]
   [drip.projects :refer [projects project]]))


;; (defn href
;;   "Return relative url for given route. Url can be used in HTML links."
;;   ([k]
;;    (href k nil nil))
;;   ([k params]
;;    (href k params nil))
;;   ([k params query]
;;    (rfe/href k params query)))


;; (defn identification [data]
;;   [:<>
;;    [:h2 "Metadata"]

;;    [inputs/text-form-group-loc
;;     {:label       "Title"
;;      :placeholder "Enter title"
;;      :description "The title of the dataset"
;;      :data        (cursor data [:citation :title :loc])}]

;;    [inputs/multi-form-group {:input-component #(inputs/date-and-type-input {:data %})
;;                              :new-data        {:type nil :date nil}
;;                              :label           "Dates"
;;                              :add-label       "date"
;;                              :data            (cursor data [:citation :dates])}]

;;    [inputs/textarea-form-group-loc {:label       "Abstract"
;;                                     :placeholder "Enter abstract"
;;                                     :description "The dataset abstract"
;;                                     :data        (cursor data [:abstract :loc])}]

;;    [inputs/form-group {:input-component #(inputs/select-input {:options menus/status-items
;;                                                                :data    %})
;;                        :label           "Status"
;;                        :data            (cursor data [:status])}]

;;    [inputs/multi-form-group {:input-component #(inputs/point-of-contact {:data %})
;;                              :new-data        {:role            nil
;;                                                :organization    nil
;;                                                :individual-name nil
;;                                                :web-address     nil
;;                                                :email           nil}
;;                              :label           "Points of contact"
;;                              :add-label       "poc"
;;                              :data            (cursor data [:points-of-contact])}]

;;    ; DEBUG delete this field
;;   ;;  [inputs/multi-form-group {:input-component #(inputs/select-input {:options     menus/status-items
;;   ;;                                                                    :description "This is the description"
;;   ;;                                                                    :data        %})
;;   ;;                            :new-data        nil
;;   ;;                            :label           "Test multi select"
;;   ;;                            :data            (cursor data [:test-multi-select])}]

;;    [inputs/form-group {:input-component #(inputs/select-multiple-input {:options menus/keywords
;;                                                                         :data    %})
;;                        :label           "Topic categories"
;;                        :data            (cursor data [:topic-categories])}]

;;    [inputs/multi-form-group {:input-component #(inputs/keywords {:data %})
;;                              :new-data        {:type :author :keywords [nil]}
;;                              :label           "Keywords"
;;                              :add-label       "keyword type"
;;                              :data            (cursor data [:keywords])}]

;;   ;;  [inputs/multi-form-group-2 {:input-components {:keyword #(inputs/keywords {:data %})
;;   ;;                                                 :text    #(inputs/text-input {:data %})}
;;   ;;                              :new-data         {:keyword {:type :author :keywords ["new kw"]}
;;   ;;                                                 :text "new text"}
;;   ;;                              :label            "Keywords or text"
;;   ;;                              :add-labels       {:text "Text" :keyword "Keyword"}
;;   ;;                              :data             (cursor data [:multi-type-input-test])}]


;;    [inputs/multi-form-group-2 {:input-components {:text    #(inputs/text-input {:data %})}
;;                                :new-data         {:text "new text"}
;;                                :label            "text test"
;;                                :add-labels       {:text "Text"}
;;                                :data             (cursor data [:multi-type-input-test2])}]

;;   ;;  ; DEBUG delete this field
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

;;    [:button.btn.btn-primary {:on-click #(POST "/md"
;;                                           {:headers {"x-csrf-token" (.-value (.getElementById js/document "__anti-forgery-token"))}
;;                                            :format :json
;;                                            :params @data
;;                                            ;; :handler handler
;;                                            :error-handler (fn [r] (prn r))})}
;;     "Post"]

;;    ; DEBUG data structure
;;    [:hr]
;;    [:div [:pre (with-out-str (pp/pprint @data))]]])

;; (defn md-root []
;;   (with-let [md (atom config/md)
;;              active-tab (atom :metadata)]
;;     [:<>
;;      [:ul.nav.nav-tabs
;;       [:li.nav-item [:a#metadata-tab.nav-link {:class (when (= :metadata @active-tab) "active")
;;                                                      :href "#"
;;                                                      :on-click #(reset! active-tab :metadata)} "Metadata"]]
;;       [:li.nav-item [:a#project-tab.nav-link {:class (when (= :project @active-tab) "active")
;;                                                    :href "#"
;;                                                    :on-click #(reset! active-tab :project)} "Project"]]
;;       [:li.nav-item [:a#aoi-tab.nav-link {:class (when (= :aoi @active-tab) "active")
;;                                           :href "#"
;;                                           :on-click #(reset! active-tab :aoi)} "AOI"]]


;;       [:li.nav-item [:a#defatul-characteristics-tab.nav-link {:class (when (= :default-characteristics @active-tab) "active")
;;                                           :href "#"
;;                                           :on-click #(reset! active-tab :default-characteristics)} "Default characteristics"]]
;;       [:li.nav-item [:a#definition-of-activities-tab.nav-link {:class (when (= :definition-of-activities @active-tab) "active")
;;                                           :href "#"
;;                                           :on-click #(reset! active-tab :definition-of-activities-tab)} "Definition of activities"]]
;;       [:li.nav-item [:a#indicator-selection-tab.nav-link {:class (when (= :indicator-selection @active-tab) "active")
;;                                           :href "#"
;;                                           :on-click #(reset! active-tab :indicator-selection)} "Indicator selection"]]
;;       [:li.nav-item [:a#advanced-characterisation-tab.nav-link {:class (when (= :advanced-characterisation @active-tab) "active")
;;                                           :href "#"
;;                                           :on-click #(reset! active-tab :advanced-characterisation)} "Advanced characterisation"]]
;;       [:li.nav-item [:a#additional-information-tab.nav-link {:class (when (= :additional-information @active-tab) "active")
;;                                           :href "#"
;;                                           :on-click #(reset! active-tab :additional-information)} "Additional information"]]
;;       [:li.nav-item [:a#results-tab.nav-link {:class (when (= :results @active-tab) "active")
;;                                           :href "#"
;;                                           :on-click #(reset! active-tab :results)} "Results"]]]
;;      [:div.tab-content
;;       [:div.tab-pane {:class (when (= :metadata @active-tab) "active")
;;                       :role "tabpanel"
;;                       :aria-labelledby "metadata-tab"}
;;        [identification (cursor md [:metadata])]]
;;       [:div.tab-pane {:class (when (= :project @active-tab) "active")
;;                       :role "tabpanel"
;;                       :aria-labelledby "project-tab"}
;;        [:h2 "Project"]]
;;       [:div.tab-pane {:class (when (= :aoi @active-tab) "active")
;;                       :role "tabpanel"
;;                       :aria-labelledby "aoi-tab"}
;;        [:h2 "Area of interest"]]]]))

;; -------------------------
;; Page components

;; (defn home-page []
;;   [:div.container
;;    [:div.row
;;     [:div.col-md-12 [md-root]]]])

(defn home-page []
  [:div.container
   [:div.row
    [:div.col-md-12
     [:h1 "Welcome to the "
      [:a {:href (href :projects)} "FERM Registry"]]]]])


;; (defn items-page []
;;   (fn []
;;     (.then (config/get-all-projects) #(js/console.log %))
;;     [:span.main
;;      [:h1 "The items of md-editor"]
;;      [:ul (map (fn [item-id]
;;                  [:li {:name (str "item-" item-id) :key (str "item-" item-id)}
;;                   [:a {:href (href :item {:item-id item-id})} "Item: " item-id]])
;;                (range 1 60))]]))


(defn projects-page []
  [projects])

(defn project-page []
  [project])

(defn item-page []
  (fn []
    (let [routing-data (session/get :route)
          item (get-in routing-data [:route-params :item-id])]
      [:span.main
       [:h1 (str "Item " item " of md-editor")]
       [:p [:a {:href (href :items)} "Back to the list of items"]]])))


(defn about-page []
  (fn [] [:span.main
          [:h1 "About md-editor"]]))


;; -------------------------
;; Page mounting component

(defn current-page []
  (fn []
    (let [page (:current-page (session/get :route))]
      [:div
      ;;  [:header
        ;; [:p [:a {:href (href :index)} "Home"] " | "
        ;;  [:a {:href (href :about)} "About md-editor"]]
        ;; ]
       [:nav.navbar.navbar-expand-lg.navbar-light.bg-light
        [:a.navbar-brand {:href "#"}
         [:img {:src "/img/FERM_logo.png" :height "30" :style {:padding-right "12px"}}]
         "FERM Registry"]
        [:button.navbar-toggler {:type "button" :data-toggle "collapse" :data-target "#navbarSupportedContent"
                                 :aria-controls "navbarSupportedContent" :aria-expanded "false" :aria-label "Toggle navigation"}
         [:span.navbar-toggler-icon]]
        [:div#navbarSupportedContent.collapse.navbar-collapse
         [:ul.navbar-nav.mr-auto
          [:li.nav-item.active
           [:a.nav-link {:href "#"}
            "Home " [:span.sr-only "(current)"]]]]]]
       ;<a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
       [page]
       [:footer
        ;; TODO: add footer
        ;; [:p "FERM-DRIP Registry ©2021"]
        ]])))


;; -------------------------
;; Routes

(def router
  (rf/router
   [["/" {:name :index
          :view #'home-page}]
    ["projects"
     ["" {:name :projects
          :view #'projects-page}]
     ["/:id" {:name :project
              :view #'project-page}]]
    ["/about" {:name :about
               :view #'about-page}]]))


;; -------------------------
;; Initialize app

(defn init-routes! []
  (letfn [(on-navigate [match]
            (when match
              (session/put! :route {:current-page (:view (:data match))
                                    :route-params (:path-params match)})))]
    (js/console.log "initializing routes")
    (rfe/start!
     router
     on-navigate
     {:use-fragment true})))

(defn mount-root []
  (init-routes!)
  (rdom/render [current-page] (.getElementById js/document "app")))

(defn init! []
  (mount-root))

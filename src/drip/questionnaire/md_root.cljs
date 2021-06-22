(ns drip.questionnaire.md-root
  (:require
   ["react" :as react]
   [reagent.core :as r :refer [atom cursor with-let]]
   [reitit.frontend.easy :refer [push-state]]

   [drip.config :as config]
   [drip.util :refer (lazy-component)]

   [drip.questionnaire.iso-19115 :refer [iso-19115]]
   [drip.questionnaire.project :refer [project]]
  ;;  [drip.questionnaire.aoi :refer [aoi]]
   [drip.questionnaire.baseline :refer [baseline]]
   [drip.questionnaire.activities :refer [activities]]
   [drip.questionnaire.indicators :refer [indicators]]
   [drip.questionnaire.characterisation :refer [characterisation]]
   [drip.questionnaire.information :refer [information]]
   [drip.questionnaire.results :refer [results]]))

;; Temporary solution to reduce the loading time
(def aoi (lazy-component drip.questionnaire.aoi/aoi))

(defn md-root []
  (with-let [md config/md
             active-tab (atom :metadata)]
    [:<>
     [:ul.nav.nav-tabs
      [:li.nav-item [:a#metadata-tab.nav-link {:class (when (= :metadata @active-tab) "active")
                                               :href "javascript:void(0)"
                                               :on-click #(reset! active-tab :metadata)} "Metadata"]]
      [:li.nav-item [:a#project-tab.nav-link {:class (when (= :project @active-tab) "active")
                                              :href "javascript:void(0)"
                                              :on-click #(reset! active-tab :project)} "Project"]]
      [:li.nav-item [:a#aoi-tab.nav-link {:class (when (= :aoi @active-tab) "active")
                                          :href "javascript:void(0)"
                                          :on-click #(reset! active-tab :aoi)} "AOI"]]
      [:li.nav-item [:a#baseline-tab.nav-link {:class (when (= :baseline @active-tab) "active")
                                               :href "javascript:void(0)"
                                               :on-click #(reset! active-tab :baseline)} "Baseline"]]
      [:li.nav-item [:a#activities-tab.nav-link {:class (when (= :activities @active-tab) "active")
                                                 :href "javascript:void(0)"
                                                 :on-click #(reset! active-tab :activities)} "Activities"]]
      [:li.nav-item [:a#indicators-tab.nav-link {:class (when (= :indicators @active-tab) "active")
                                                 :href "javascript:void(0)"
                                                 :on-click #(reset! active-tab :indicators)} "Indicators"]]
      [:li.nav-item [:a#characterisation-tab.nav-link {:class (when (= :characterisation @active-tab) "active")
                                                       :href "javascript:void(0)"
                                                       :on-click #(reset! active-tab :characterisation)} "Characterisation"]]
      [:li.nav-item [:a#information-tab.nav-link {:class (when (= :information @active-tab) "active")
                                                  :href "javascript:void(0)"
                                                  :on-click #(reset! active-tab :information)} "Information"]]
      [:li.nav-item [:a#results-tab.nav-link {:class (when (= :results @active-tab) "active")
                                              :href "javascript:void(0)"
                                              :on-click #(reset! active-tab :results)} "Results"]]]
     [:div.tab-content
      [:> react/Suspense {:fallback (r/as-element [:div "Loading ..."])}
       [:div.tab-pane {:class (when (= :metadata @active-tab) "active")
                       :role "tabpanel"
                       :aria-labelledby "metadata-tab"}
        [iso-19115 (cursor md [:metadata])]]

       (when (= :project @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "project-tab"}
          [project (cursor md [:project])]])
       (when (= :aoi @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "aoi-tab"}
          [:> aoi {:data (cursor md [:aoi])}]])
       (when (= :baseline @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "baseline-tab"}
          [baseline (cursor md [:baseline])]])
       (when (= :activities @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "activities-tab"}
          [activities (cursor md [:activities])]])
       (when (= :indicators @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "indicators-tab"}
          [indicators (cursor md [:indicators])]])
       (when (= :characterisation @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "characterisation-tab"}
          [characterisation (cursor md [:characterisation])]])
       (when (= :information @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "information-tab"}
          [information (cursor md [:information])]])
       (when (= :results @active-tab)
         [:div.tab-pane.active {:role "tabpanel"
                                :aria-labelledby "results-tab"}
          [results (cursor md [:results])]])]]
     [:button.btn.btn-primary {:on-click (fn []
                                           (.then (config/save)
                                                  (push-state :projects)))}
      "Save"]]))

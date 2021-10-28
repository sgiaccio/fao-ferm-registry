(ns drip.questionnaire.md-root
  (:require
   ["react" :as react]
   [reagent.core :as r :refer [atom cursor with-let]]
   [reitit.frontend.easy :refer [push-state]]

   [drip.config :as config]
   [drip.util :refer (lazy-component)]

  ;;  [drip.questionnaire.iso-19115 :refer [iso-19115]]
   [drip.questionnaire.project :refer [project]]
  ;;  [drip.questionnaire.aoi :refer [aoi]]
   [drip.questionnaire.baseline :refer [baseline]]
   [drip.questionnaire.activities :refer [activities]]
   [drip.questionnaire.indicators :refer [indicators]]
  ;;  [drip.questionnaire.characterisation :refer [characterisation]]
   [drip.questionnaire.information :refer [information]]
   [drip.questionnaire.results :refer [results]]))


;; Temporary solution to reduce the loading time
(def aoi (lazy-component drip.questionnaire.aoi/aoi))

(defn md-root []
  (with-let [md         config/md
             active-tab (atom :project)
             tab        (fn [tab-id label]
                          [:<>
                           [:a {:href "javascript:void(0)"
                                :class (str "w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm "
                                            (if (= tab-id @active-tab)
                                              "border-indigo-500 text-indigo-600"
                                              "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"))
                                :aria-current (if (= tab-id @active-tab) "page" "false")
                                :on-click #(reset! active-tab tab-id)}
                            label]])]
    [:<>
     [:div
      [:div {:class "sm:hidden"}
       [:label {:for "tabs", :class "sr-only"} "Select a tab"]
       [:select {:id "tabs"
                 :name "tabs"
                 :class "block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                 :on-change #(reset! active-tab (-> % .-target .-value keyword))}
        ;; [:option {:value "metadata"} "Metadatata"]
        [:option {:value "project"} "Project"]
        [:option {:value "aoi"} "AOI"]
        [:option {:value "baseline"} "Biophysical characteristics"]
        [:option {:value "activities"} "Activities"]
        [:option {:value "indicators"} "Indicators"]
        ;; [:option {:value "characterisation"} "Characterisation"]
        [:option {:value "information"} "Information"]
        [:option {:value "results"} "Results"]]]
      [:div {:class "hidden sm:block"}
       [:div {:class "border-b border-gray-200"}
        [:nav {:class "-mb-px flex space-x-4", :aria-label "Tabs"}
        ;;  [tab :metadata "Metadata"]
         [tab :project "Project"]
         [tab :aoi "AOI"]
         [tab :baseline "Characteristics"]
         [tab :activities "Activities"]
         [tab :indicators "Indicators"]
        ;;  [tab :characterisation "Characterisation"]
         [tab :information "Information"]
         [tab :results "Results"]]]]]
     [:> react/Suspense {:fallback (r/as-element [:div "Loading ..."])}
      (case @active-tab
        ;; :metadata         [iso-19115 (cursor md [:metadata])]
        :project          [project (cursor md [:project])]
        :aoi              [:> aoi {:aoi-data (cursor md [:aoi])
                                   :md-data (cursor md [:metadata])}]
        :baseline         [baseline (cursor md [:aoi])]
        :activities       [activities (cursor md [:activities])]
        :indicators       [indicators (cursor md [:indicators])]
        ;; :characterisation [characterisation (cursor md [:characterisation])]
        :information      [information (cursor md [:information])]
        :results          [results (cursor md [:results])]
        ;; nil               [:div {:class "pt-6"}
        ;;                    [:h1 {:class "text-3xl mb-6"} "Your project in the FERM registry!"]
        ;;                    [:p "The FERM registry is based on various internationally recognized code lists, from ISO, IATI, FAO and others. There are six steps to follow to provide the needed information to obtain indicator results for your project. The documentation is available HERE to populate the FERM registry. "]]
        )]
     (if @active-tab
       [:button {:type "button"
                 :class "my-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 :on-click (fn []
                             (.then (config/save)
                                    (push-state :projects)))}
        "Save"]
       [:button {:type "button"
                 :class "my-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 :on-click #(reset! active-tab :project)}
        "Start inserting data"])]))

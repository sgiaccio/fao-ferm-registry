(ns drip.projects
  (:require [reagent.core :refer [atom with-let]]
            [reagent.session :as session]
            [reitit.frontend.easy :refer [push-state]]

            [drip.config :as config]
            [drip.utils :as utils]
            
            [drip.questionnaire.md-root :refer [md-root]]))


(defn operations []
  (with-let [project-list (atom nil)
             _ (.then (config/get-projects) #(reset! project-list %))]
    [:<>
     (when (config/can-create)
       [:button {:class "inline-flex items-center mb-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                 :on-click #(push-state :project {:id (config/create-empty-doc)})}
        "Add new project"])
     [:div {:class "bg-white shadow overflow-hidden sm:rounded-md mb-6"}
      [:ul {:class "divide-y divide-gray-200"}
       (doall (for [p @project-list :let [data (.data p)]]
                [:li {:key (.-id p)}
                 [:span {:class "block hover:bg-gray-50 cursor-pointer" :on-click #(push-state :project {:id (.-id p)})}
                  [:div {:class "flex items-center px-4 py-4 sm:px-6"}
                   [:div {:class "min-w-0 flex-1 flex items-center"}
                    [:div {:class "flex-shrink-0"}
                     (if (config/can-edit p)
                      ;; Data is editable
                      ;; Heroicon name: solid/pencil-alt
                       [:svg {:xmlns "http://www.w3.org/2000/svg", :class "h-5 w-5 text-gray-500", :viewBox "0 0 20 20", :fill "currentColor"}
                        [:path {:d "M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"}]
                        [:path {:fill-rule "evenodd", :d "M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z", :clip-rule "evenodd"}]]
                      ;; Data is only viewable
                      ;; Heroicon name: solid/eye
                       [:svg {:xmlns "http://www.w3.org/2000/svg", :class "h-5 w-5 text-gray-500", :viewBox "0 0 20 20", :fill "currentColor"}
                        [:path {:d "M10 12a2 2 0 100-4 2 2 0 000 4z"}]
                        [:path {:fill-rule "evenodd", :d "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z", :clip-rule "evenodd"}]])]
                    [:div {:class "min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4"}
                     [:div
                      [:p {:class "text-sm font-medium text-indigo-600 truncate"}
                       (or (get-in (js->clj data) ["project" "title"]) "No title")]
                      [:p {:class "mt-2 flex items-center text-sm text-gray-500"}
                       [:span {:class "truncate"}
                       ;;  "Budget (or any other additional info): "
                       ;;  (or (get-in (js->clj data) ["project" "budget"]) "n/a")
                       ;;  (when (some? (get-in (js->clj data) ["project" "budget"]))
                       ;;    " USD")
                        (:adm0 (utils/get-admin2-names (get-in (js->clj data) ["aoi" 0 "admin-area" "admin-0"]) nil nil))]]]
                     [:div {:class "hidden md:block"}
                      [:div
                       [:p {:class "text-mono text-xs text-gray-900"}
                        (get-in (js->clj data) ["project" "uuid"])]
                       ;; Time info - if needed
                       ;; [:p {:class "text-sm text-gray-900"}
                       ;;  "Created on "
                       ;;  [:time {:datetime "2020-01-07"}
                       ;;   "January 7, 2020"]]
                       (when (get-in (js->clj data) ["public"])
                         [:p {:class "mt-2 flex items-center text-sm text-gray-500"}
                          ;; Heroicon name: solid/check-circle
                          [:svg {:class "flex-shrink-0 mr-1.5 h-5 w-5 text-green-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
                           [:path {:fill-rule "evenodd", :d "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", :clip-rule "evenodd"}]]
                          "Public"])]]]]
                   [:div
                  ;; Heroicon name: solid/chevron-right
                    [:svg {:class "h-5 w-5 text-gray-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
                     [:path {:fill-rule "evenodd", :d "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", :clip-rule "evenodd"}]]]]]]))]]]))

(defn projects []
    [:<>
     [:h1 {:class "text-3xl mb-6"} "Projects"]
     [:div {:class "mb-6"} "Restoration projects, programs and initiatives at all spatial scales, from individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global goals for sustaining life on Earth. The FERM registry provides access to the database of ecosystem restoration projects, with the aim of monitoring, using various sources of information and priority indicators, progress towards the United Nations Decade on Ecosystem Restoration."]
     
     ;; Only list and allow to add a new project when user is allowed (is admin or belongs to a group)
     (if (or @config/is-admin (seq @config/privileges))
       [operations]
       [:div {:class "mb-6 font-bold"} "You can't add a new project or list unpublished projects as you haven't been yet assigned to a group."])])

(defn project []
  (with-let [routing-data (session/get :route)
             project-id (get-in routing-data [:route-params :id])
             _ (.then (config/get-project project-id)
                      #(let [clj-data (js->clj (.data %) :keywordize-keys true)]
                         (if (some? (.. % data))
                           (reset! config/md clj-data)
                           (reset! config/md {:project {:uuid (str (random-uuid))}}))
                         (reset! config/project-id (.-id %))))]
    [:<>
     [:div.container
      [:div.row
       [:div.col-md-12 [md-root]]]]]))

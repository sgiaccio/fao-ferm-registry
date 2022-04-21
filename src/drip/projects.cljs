(ns drip.projects
  (:require [reagent.core :refer [atom with-let]]
            [reagent.session :as session]
            [reitit.frontend.easy :refer [push-state]]

            [drip.config :as config]
            [drip.util :refer [href]]
            [drip.utils :as utils]
            
            [drip.questionnaire.md-root :refer [md-root]]))


(defn projects []
  (with-let [project-list (atom nil)
             _ (.then (config/get-all-projects) #(reset! project-list %))]
    [:div
     [:p "Restoration projects, programs and initiatives at all spatial scales, from individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global goals for sustaining life on Earth. The FERM register provides access to the database of ecosystem restoration projects, with the aim of monitoring, using various sources of information and priority indicators, progress towards the United Nations Decade on Ecosystem Restoration"]
     (when (some? @project-list)
       [:ul (map (fn [p]
                   [:li {:key "TODO"} [:a {:href (href :project {:id (.-id p)})}
                                       (or (get-in (js->clj (.data p)) ["project" "title"]) "No title")]])
                 @project-list)]
       [:table.table.table-hover
        [:thead
         [:tr
          [:th {:scope "col"} "Title"]
          ;; [:th {:scope "col"} "Country"]
          ;; [:th {:scope "col"} "Region"]
          ;; [:th {:scope "col"} "Province"]
          [:th]]]
        [:tbody
         (doall
          (map (fn [p]
                 [:tr {:on-click #(push-state :project {:id (.-id p)})
                       :style {:cursor "pointer"}}
                  [:th {:scope "row"} (or (get-in (js->clj (.data p)) ["project" "title"]) "No title")]
                  ;; [:td "Admin 1"]
                  ;; [:td "Admin 2"]
                  ;; [:td "Admin 3"]
                  [:td (if (= @config/userid (-> p .data .-uid)) "EDIT" "VIEW")]])
               @project-list))]])
     [:button.btn.btn-primary {:on-click #(push-state :project {:id "new"})}
      "Add new project"]]




    [:<>
     [:h1 {:class "text-3xl mb-6"} "Projects"]
     [:div {:class "mb-6"} "Restoration projects, programs and initiatives at all spatial scales, from individual sites to large landscapes and seascapes, play a vital role in achieving ambitious global goals for sustaining life on Earth. The FERM registry provides access to the database of ecosystem restoration projects, with the aim of monitoring, using various sources of information and priority indicators, progress towards the United Nations Decade on Ecosystem Restoration."]
     [:button {:class "inline-flex items-center mb-6 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" :on-click #(push-state :project {:id "new"})}
      "Add new project"]
     [:div {:class "bg-white shadow overflow-hidden sm:rounded-md mb-6"}
      [:ul {:class "divide-y divide-gray-200"}
       (doall
        (map (fn [p]
               [:li
                [:a {:href "javascript:void(0)", :class "block hover:bg-gray-50" :on-click #(push-state :project {:id (.-id p)})}
                 [:div {:class "flex items-center px-4 py-4 sm:px-6"}
                  [:div {:class "min-w-0 flex-1 flex items-center"}
                  ;; [:div {:class "flex-shrink-0"}
                  ;;  [:img {:class "h-12 w-12 rounded-full", :src "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}]]
                   [:div {:class "flex-shrink-0"}
                    ;; (if (or @config/is-admin (= @config/userid (-> p .data .-uid)))
                    (if (= @config/userid (-> p .data .-uid))
                     ;; Heroicon name: solid/pencil-alt
                     [:svg {:xmlns "http://www.w3.org/2000/svg", :class "h-5 w-5 text-gray-500", :viewBox "0 0 20 20", :fill "currentColor"}
                      [:path {:d "M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"}]
                      [:path {:fill-rule "evenodd", :d "M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z", :clip-rule "evenodd"}]]
                     ;; Heroicon name: solid/eye
                      [:svg {:xmlns "http://www.w3.org/2000/svg", :class "h-5 w-5 text-gray-500", :viewBox "0 0 20 20", :fill "currentColor"}
                       [:path {:d "M10 12a2 2 0 100-4 2 2 0 000 4z"}]
                       [:path {:fill-rule "evenodd", :d "M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z", :clip-rule "evenodd"}]])]
                   [:div {:class "min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4"}
                    [:div
                     [:p {:class "text-sm font-medium text-indigo-600 truncate"}
                      (or (get-in (js->clj (.data p)) ["project" "title"]) "No title")]
                     [:p {:class "mt-2 flex items-center text-sm text-gray-500"}
                     ;; Heroicon name: solid/mail
                     ;;  [:svg {:class "flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
                     ;;   [:path {:d "M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"}]
                     ;;   [:path {:d "M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"}]]
                      [:span {:class "truncate"}
                      ;; "ricardo.cooper@example.com"
                      ;;  "Budget: "
                      ;;  (or (get-in (js->clj (.data p)) ["project" "budget"]) "n/a")
                      ;;  (when (some? (get-in (js->clj (.data p)) ["project" "budget"]))
                      ;;    " USD")
                       (:adm0 (utils/get-admin2-names (get-in (js->clj (.data p)) ["aoi" 0 "admin-area" "admin-0"]) nil nil))]]]
                    [:div {:class "hidden md:block"}
                     [:div
                      [:p {:class "text-mono text-xs text-gray-900"}
                       (get-in (js->clj (.data p)) ["project" "uuid"])]
                      ;; [:p {:class "text-sm text-gray-900"}
                      ;;  "Created on "
                      ;;  [:time {:datetime "2020-01-07"}
                      ;;   "January 7, 2020"]]
                      [:p {:class "mt-2 flex items-center text-sm text-gray-500"}
                      ;; Heroicon name: solid/check-circle
                       [:svg {:class "flex-shrink-0 mr-1.5 h-5 w-5 text-green-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
                        [:path {:fill-rule "evenodd", :d "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", :clip-rule "evenodd"}]]
                       "Public"]]]]]
                  [:div
                  ;; Heroicon name: solid/chevron-right
                   [:svg {:class "h-5 w-5 text-gray-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
                    [:path {:fill-rule "evenodd", :d "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", :clip-rule "evenodd"}]]]]]])
             @project-list))]]]))

(defn project []
  (with-let [routing-data (session/get :route)
             project-id (get-in routing-data [:route-params :id])
             _ (.then (config/get-project project-id)
                      #(let [clj-data (js->clj (.data %) :keywordize-keys true)]
                         (if (= "new" (.-id %))
                           (reset! config/md {:project {:uuid (str (random-uuid))}})
                           (reset! config/md clj-data))
                        ;;  (reset! config/md (js->clj (.data %) :keywordize-keys true))
                         (reset! config/project-id (.-id %))))]
    [:<>
     [:div.container
      [:div.row
       [:div.col-md-12 [md-root]]]]]))

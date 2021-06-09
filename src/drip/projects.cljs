(ns drip.projects
  (:require [reagent.core :refer [atom with-let]]
            [reagent.session :as session]
            [reitit.frontend.easy :refer [push-state]]

            [drip.config :as config]
            [drip.util :refer [href]]
            [drip.questionnaire.md-root :refer [md-root]]))


;; (defn projects []
;;   (with-let [project-list (atom nil)
;;         _ (.then (config/get-all-projects) #(reset! project-list %))]
;;     [:h1 "Projects"]
;;     (when (some? @project-list)
;;       [:ul (map (fn [p]
;;                   (js/console.log p)
;;                   [:li {:key "TODO"} [:a {:href (href :project {:id (.-id p)})}
;;                                       (or (get-in (js->clj (.data p)) ["project" "title"]) "No title")]])
;;                 @project-list)])))

(defn projects []
  (with-let [project-list (atom nil)
             _ (.then (config/get-all-projects) #(reset! project-list %))]
    [:div.container
     [:h1 "Projects"]
     (when (some? @project-list)
       [:ul (map (fn [p]
                   (js/console.log p)
                   [:li {:key "TODO"} [:a {:href (href :project {:id (.-id p)})}
                                       (or (get-in (js->clj (.data p)) ["project" "title"]) "No title")]])
                 @project-list)]
       [:table.table.table-hover
        [:thead
         [:tr
          [:th {:scope "col"} "Title"]
          [:th {:scope "col"} "Country"]
          [:th {:scope "col"} "Region"]
          [:th {:scope "col"} "Province"]]]
        [:tbody
         (map (fn [p]
                (js/console.log p)
                [:tr {:on-click #(push-state :project {:id (.-id p)})
                      :style {:cursor "pointer"}}
                 [:th {:scope "row"} (or (get-in (js->clj (.data p)) ["project" "title"]) "No title")]
                 [:td "Admin 1"]
                 [:td "Admin 2"]
                 [:td "Admin 3"]])
              @project-list)]])
     [:button.btn.btn-primary {:on-click #(push-state :project {:id "new"})}
      "Add new project"]]))

(defn project []
  (with-let [routing-data (session/get :route)
             project-id (get-in routing-data [:route-params :id])
             _ (.then (config/get-project project-id)
                      #(do
                         (js/console.log %)
                         (reset! config/md (js->clj (.data %) :keywordize-keys true))
                         (reset! config/project-id (.-id %))))]
    [:div.container
     [:div.row
      [:div.col-md-12 [md-root]]]]))

;; (defn projects_ []
;;   (fn []
;;     (.then (config/get-all-projects) #(js/console.log %))
;;     [:span.main
;;      [:h1 "Projects"]
;;      [:ul (map (fn [item-id]
;;                  [:li {:name (str "item-" item-id) :key (str "item-" item-id)}
;;                   [:a {:href (href :item {:item-id item-id})} "Item: " item-id]])
;;                (range 1 60))]]))

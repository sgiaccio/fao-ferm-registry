(ns drip.core
  (:require
   [reagent.dom :as rdom]
   [reagent.session :as session]
   [reitit.frontend :as rf]
   [reitit.frontend.easy :as rfe]

  ;;  [drip.config :as config]
   [drip.util :refer [href]]
   [drip.projects :refer [projects project]]
  ;;  [drip.auth :as auth]
   
   ))



(defn home-page []
  [:div.container
   [:div.row
    [:div.col-md-12
     [:h1 "Welcome to the "
      [:a {:href (href :projects)} "FERM Registry"]]]]])

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
       [:div#firebaseui-auth-container {:style {:position "absolute"
                                                :top "200px"
                                                :right "300px"}}]
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
          ;;  (if (nil? @config/userid)
          ;;    [:a.nav-link {:href "#" :on-click #(auth/show-login-form)}
          ;;     "Login" [:span.sr-only "(current)"]]
          ;;    [:a.nav-link {:href "#" :on-click #(auth/logout)}
          ;;     "Logout" [:span.sr-only "(current)"]])
           ]]]]
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

(defn main []
  (mount-root))

(ns drip.core
  (:require
  ;;  [reagent.core :as r :refer [with-let]]
   [reagent.dom :as rdom]
   [reagent.session :as session]
   [reitit.frontend :as rf]
   [reitit.frontend.easy :as rfe]

   [drip.config :as config]
  ;;  [drip.util :refer [href]]
   [drip.projects :refer [projects project]]
   [drip.auth :as auth]

   [drip.login-form :as login-form]
   ))


;; (defn home-page []
;;   [:div.container
;;    [:div.row
;;     [:div.col-md-12
;;      [:h1 "Welcome to the "
;;       [:a {:href (href :projects)} "FERM Registry"]]]]])

(defn projects-page []
  [projects])

(defn project-page []
  [project])

;; (defn item-page []
;;   (fn []
;;     (let [routing-data (session/get :route)
;;           item (get-in routing-data [:route-params :item-id])]
;;       [:span.main
;;        [:h1 (str "Item " item " of md-editor")]
;;        [:p [:a {:href (href :items)} "Back to the list of items"]]])))

(defn about-page []
  (fn [] [:span.main
          [:h1 "About md-editor"]]))

(defn navbar []
  [:div {:class "relative bg-white mb-10"}
   [:div {:class "max-w-7xl mx-auto px-4 sm:px-6"}
    [:div {:class "flex justify-between items-center border-b-2 border-gray-100 py-2 md:justify-start md:space-x-10"}
     [:div {:class "flex justify-start lg:w-0 lg:flex-1"}
      [:a {:href "#"}
       [:span {:class "sr-only"} "FERM Registry"]
       [:img {:class "h-8 w-auto sm:h-20", :src "/img/UNDecade_LOGO_MASTER_EN.svg", :alt "UN Decade"}]]]
     [:div {:class "-mr-2 -my-2 md:hidden"}
      [:button {:type "button", :class "bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500", :aria-expanded "false"}
       [:span {:class "sr-only"} "Open menu"]
       ;;  Heroicon name: outline/menu
       [:svg {:class "h-6 w-6", :xmlns "http://www.w3.org/2000/svg", :fill "none", :viewBox "0 0 24 24", :stroke "currentColor", :aria-hidden "true"}
        [:path {:stroke-linecap "round", :stroke-linejoin "round", :stroke-width "2", :d "M4 6h16M4 12h16M4 18h16"}]]]]
     [:div {:class "hidden md:flex items-center justify-end md:flex-1 lg:w-0"}
      ;; [:a {:href "#", :class "whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"} "Sign in"]
      ;; [:a {:href "#", :class "ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"} "Sign up"]
      (when @config/is-admin [:a {:href "#", :on-click #(auth/logout) :class "ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-base font-medium text-black hover:bg-indigo-200"} "Admin"])
      [:a {:href "#", :on-click #(auth/logout) :class "ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"} "Logout"]]]]])

;; -------------------------
;; Page mounting component

(defn current-page []
  (fn []
    (if @config/auth-loaded
      (if (nil? @config/userid)
        ; TODO redirect
        [login-form/login-form]
        (let [page (:current-page (session/get :route))]
          [:<>
           [navbar]
           [:div {:class "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}
           ;;  We've used 3xl here, but feel free to try other max-widths based on your needs
            [:div {:class "max-w-3xl mx-auto"}
             [page]]]]))
      [:div "loading..."])))


;; -------------------------
;; Routes

(def router
  (rf/router
   [["/" {:name :index
          :view #'projects-page}]
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

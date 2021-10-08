(ns drip.core
  (:require
   [reagent.core :as r :refer [with-let]]
   [reagent.dom :as rdom]
   [reagent.session :as session]
   [reitit.frontend :as rf]
   [reitit.frontend.easy :as rfe]

   [drip.config :as config]
   [drip.util :refer [href]]
   [drip.projects :refer [projects project]]
   [drip.auth :as auth]))



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

(defn login-form []
  (with-let [email (r/atom "")
             password (r/atom "")]
    [:div {:class "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"}
     [:div {:class "max-w-md w-full space-y-8"}
      [:div
       [:img {:class "mx-auto h-12 w-auto", :src "https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg", :alt "Workflow"}]
       [:h2 {:class "mt-6 text-center text-3xl font-extrabold text-gray-900"} "Sign in to your account"]
      ;;  [:p {:class "mt-2 text-center text-sm text-gray-600"}
      ;;   [:a {:href "#", :class "font-medium text-indigo-600 hover:text-indigo-500"} "start your 14-day free trial"]]
       ]
      [:div {:class "mt-8 space-y-6"}
      ;;  [:input {:type "hidden", :name "remember", :value "true"}]
       [:div {:class "rounded-md shadow-sm -space-y-px"}
        [:div
         [:label {:for "email-address", :class "sr-only"} "Email address"]
         [:input {:id "email-address"
                  :name "email"
                  :type "email"
                  :autocomplete "email"
                  :required "required"
                  :class "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  :placeholder "Email address"
                  :value @email
                  :on-change #(reset! email (-> % .-target .-value))}]]
        [:div
         [:label {:for "password", :class "sr-only"} "Password"]
         [:input {:id "password"
                  :name "password"
                  :type "password"
                  :autocomplete "current-password"
                  :required "required"
                  :class "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  :placeholder "Password"
                  :value @password
                  :on-change #(reset! password (-> % .-target .-value))}]]]
       [:div {:class "flex items-center justify-between"}
        ;; [:div {:class "flex items-center"}
        ;;  [:input {:id "remember_me", :name "remember_me", :type "checkbox", :class "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"}]
        ;;  [:label {:for "remember_me", :class "ml-2 block text-sm text-gray-900"} "Remember me"]]
        [:div {:class "text-sm"}
         [:a {:href "#", :class "font-medium text-indigo-600 hover:text-indigo-500"} "Forgot your password?"]]]
       [:div
        [:button {:class "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  :on-click (fn [evt]
                              (.preventDefault evt)
                              (auth/authenticate-user @email @password))}
         [:span {:class "absolute left-0 inset-y-0 flex items-center pl-3"}
          ; Heroicon name: solid/lock-closed
          [:svg {:class "h-5 w-5 text-indigo-500 group-hover:text-indigo-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
           [:path {:fill-rule "evenodd", :d "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", :clip-rule "evenodd"}]]] "Login"]]
      ;;  [:div
      ;;   [:button {:class "group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-400 hover:from-purple-400 via-pink-500 hover:via-pink-600 to-red-500 hover:to-red-500 focus:outline-none"
      ;;             :on-click (fn [evt]
      ;;                         (.preventDefault evt)
      ;;                         (auth/sign-up @email @password))}
      ;;    [:span {:class "absolute left-0 inset-y-0 flex items-center pl-3"}] "Sign up"]]
       ]]]))

(defn navbar []
  [:div {:class "relative bg-white mb-10"}
   [:div {:class "max-w-7xl mx-auto px-4 sm:px-6"}
    [:div {:class "flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10"}
     [:div {:class "flex justify-start lg:w-0 lg:flex-1"}
      [:a {:href "#"}
       [:span {:class "sr-only"} "FERM Registry"]
       [:img {:class "h-8 w-auto sm:h-10", :src "https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg", :alt ""}]]]
     [:div {:class "-mr-2 -my-2 md:hidden"}
      [:button {:type "button", :class "bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500", :aria-expanded "false"}
       [:span {:class "sr-only"} "Open menu"]
       ;;  Heroicon name: outline/menu
       [:svg {:class "h-6 w-6", :xmlns "http://www.w3.org/2000/svg", :fill "none", :viewBox "0 0 24 24", :stroke "currentColor", :aria-hidden "true"}
        [:path {:stroke-linecap "round", :stroke-linejoin "round", :stroke-width "2", :d "M4 6h16M4 12h16M4 18h16"}]]]]
     [:div {:class "hidden md:flex items-center justify-end md:flex-1 lg:w-0"}
      ;; [:a {:href "#", :class "whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"} "Sign in"]
      ;; [:a {:href "#", :class "ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"} "Sign up"]
      [:a {:href "#", :on-click #(auth/logout) :class "ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"} "Logout"]]]]])

;; -------------------------
;; Page mounting component

(defn current-page []
  (fn []
    (if @config/auth-loaded
      (if (nil? @config/userid)
        ; TODO redirect
        [login-form]
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

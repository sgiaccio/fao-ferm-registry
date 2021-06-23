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
      [:form {:class "mt-8 space-y-6", :method "POST"}
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
        [:button {:type "submit"
                  :class "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  :on-click (fn [evt]
                              (.preventDefault evt)
                              (auth/authenticate-user @email @password))}
         [:span {:class "absolute left-0 inset-y-0 flex items-center pl-3"}
          ; Heroicon name: solid/lock-closed
          [:svg {:class "h-5 w-5 text-indigo-500 group-hover:text-indigo-400", :xmlns "http://www.w3.org/2000/svg", :viewbox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
           [:path {:fill-rule "evenodd", :d "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", :clip-rule "evenodd"}]]] "Sign in"]]]]]))

(defn login-form_ []
  (with-let [user (r/atom "")
             password (r/atom "")]
    [:<>
     [:label
      "User"
      [:input {:type "text"
               :value @user
               :on-change #(reset! user (-> % .-target .-value))}]]
     [:label
      "Password"
      [:input {:type "password"
               :value @password
               :on-change #(reset! password (-> % .-target .-value))}]]
     [:button {:on-click #(auth/authenticate-user @user @password)} "Login"]]))

;; -------------------------
;; Page mounting component

(defn current-page []
  (fn []
    (if @config/auth-loaded
      (if (nil? @config/userid)
        ; TODO redirect
        [login-form]
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
               [:a.nav-link {:href "#"
                             :on-click #(auth/logout)}
                "logout" [:span.sr-only "(current)"]]]]]]
           [page]
           ;; TODO: add footer
           ;; [:p "FERM-DRIP Registry ©2021"]
           [:footer]]))
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

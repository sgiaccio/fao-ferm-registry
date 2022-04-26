(ns drip.login-form
  (:require
   [reagent.core :as r :refer [with-let]]
   [drip.auth :as auth]))

(defonce show-reset-password (r/atom false))

(defn login-form []
  (with-let [email (r/atom "")
             password (r/atom "")
             registering (r/atom false)]
    (if (not @show-reset-password)

      [:div {:class "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"}
       [:div {:class "max-w-md w-full space-y-8"}
        [:div
         [:img {:class "mx-auto h-20 w-auto", :src "/img/UNDecade_LOGO_MASTER_EN.svg", :alt "UN Decade"}]
         [:h2 {:class "mt-6 text-center text-3xl font-extrabold text-gray-900"} "Sign in to your account"]
      ;;  [:p {:class "mt-2 text-center text-sm text-gray-600"}
      ;;   [:a {:href "#", :class "font-medium text-indigo-600 hover:text-indigo-500"} "start your 14-day free trial"]]
         ]
        [:div "Welcome to the FERM registry! The Ecosystem Restoration Monitoring Framework Registry aims to provide a register of ecosystem restoration monitoring projects, in the context of the United Nations Framework for Ecosystem Restoration, the Drylands Restoration Initiative Platform (DRIP), as well as various other platforms and initiatives."]
        [:div {:class "mt-8 space-y-6"}
      ;;  [:input {:type "hidden", :name "remember", :value "true"}]
         [:div {:class "rounded-md shadow-sm -space-y-px"}
          [:div
           [:label {:for "email-address", :class "sr-only"} "Email address"]
           [:input {:id "email-address"
                    :name "email"
                    :type "email"
                    :autoComplete "email"
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
                    :autoComplete "current-password"
                    :required "required"
                    :class "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    :placeholder "Password"
                    :value @password
                    :on-change #(reset! password (-> % .-target .-value))}]]]

       ;; RESET PASSWORD
         [:div {:class "flex items-center justify-between"}
        ;; [:div {:class "flex items-center"}
        ;;  [:input {:id "remember_me", :name "remember_me", :type "checkbox", :class "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"}]
        ;;  [:label {:for "remember_me", :class "ml-2 block text-sm text-gray-900"} "Remember me"]]
          [:div {:class "text-sm"}
           [:span {:on-click #(reset! show-reset-password true) :class "cursor-pointer font-medium text-indigo-600 hover:text-indigo-500"} "Forgot your password?"]]]

         (when (not @registering)
           [:<>
            [:div
             [:button {:class "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                       :on-click (fn [evt]
                                   (.preventDefault evt)
                                   (auth/authenticate-user @email @password))}
              [:span {:class "absolute left-0 inset-y-0 flex items-center pl-3"}
               ; Heroicon name: solid/lock-closed
               [:svg {:class "h-5 w-5 text-indigo-500 group-hover:text-indigo-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
                [:path {:fill-rule "evenodd", :d "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", :clip-rule "evenodd"}]]] "Login"]]
            [:div {:class "font-semibold mt-10"} "No account? "
             [:span {:on-click #(reset! registering true)
                     :class "text-blue-700 hover:text-blue-800 cursor-pointer underline"} "Register instead"]]])

         (when @registering
           [:<>
            [:div
             [:button {:class "group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-400 hover:from-purple-400 via-pink-500 hover:via-pink-600 to-red-500 hover:to-red-500 focus:outline-none"
                       :on-click (fn [evt]
                                   (.preventDefault evt)
                                   (auth/sign-up @email @password))}
              [:span {:class "absolute left-0 inset-y-0 flex items-center pl-3"}] "Sign up"]]
            [:div {:class "font-semibold mt-10"} "Got an account? "
             [:span {:on-click #(reset! registering false)
                     :class "text-blue-700 hover:text-blue-800 cursor-pointer underline"} "Login instead"]]])]]]
      




      [:div {:class "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"}
       [:div {:class "max-w-md w-full space-y-8"}
        [:div
         [:img {:class "mx-auto h-20 w-auto", :src "/img/UNDecade_LOGO_MASTER_EN.svg", :alt "UN Decade"}]
         [:h2 {:class "mt-6 text-center text-3xl font-extrabold text-gray-900"} "Reset password"]
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
                    :autoComplete "email"
                    :required "required"
                    :class "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    :placeholder "Email address"
                    :value @email
                    :on-change #(reset! email (-> % .-target .-value))}]]]

         [:div
          [:button {:class "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    :on-click (fn [evt]
                                (.preventDefault evt)
                                (auth/send-password-reset-email @email))}
           [:span {:class "absolute left-0 inset-y-0 flex items-center pl-3"}
          ; Heroicon name: solid/lock-closed
            [:svg {:class "h-5 w-5 text-indigo-500 group-hover:text-indigo-400", :xmlns "http://www.w3.org/2000/svg", :viewBox "0 0 20 20", :fill "currentColor", :aria-hidden "true"}
             [:path {:fill-rule "evenodd", :d "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", :clip-rule "evenodd"}]]] "Reset"]]]]])))
(ns drip.modal
  (:require [drip.config :refer [modal-content]]
            [drip.icons :refer [info]]))

; TODO: transitions

(defn modal []
  [:div {:class "fixed z-10 inset-0 overflow-y-auto", :aria-labelledby "modal-title", :role "dialog", :aria-modal "true"}
   [:div {:class "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"} ; "<!--\n      Background overlay, show/hide based on modal state.\n\n      Entering: \"ease-out duration-300\"From: \"opacity-0\"To: \"opacity-100\"Leaving: \"ease-in duration-200\"From: \"opacity-100\"To: \"opacity-0\"-->"
    [:div {:class "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", :aria-hidden "true"}] ; "<!-- This element is to trick the browser into centering the modal contents. -->"  
    [:span {:class "hidden sm:inline-block sm:align-middle sm:h-screen", :aria-hidden "true"} "​"] ; "<!--\n      Modal panel, show/hide based on modal state.\n\n      Entering: \"ease-out duration-300\"From: \"opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95\"To: \"opacity-100 translate-y-0 sm:scale-100\"Leaving: \"ease-in duration-200\"From: \"opacity-100 translate-y-0 sm:scale-100\"To: \"opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95\"-->"
    [:div {:class "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"}
     [:div {:class "hidden sm:block absolute top-0 right-0 pt-4 pr-4"}
      [:button {:on-click #(reset! modal-content nil) :type "button", :class "bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"}
       ; "<!-- Heroicon name: outline/x -->" 
       [:span {:class "sr-only"} "Close"] 
       [:svg {:class "h-6 w-6", :xmlns "http://www.w3.org/2000/svg", :fill "none", :viewBox "0 0 24 24", :stroke "currentColor", :aria-hidden "true"}
        [:path {:stroke-linecap "round", :stroke-linejoin "round", :stroke-width "2", :d "M6 18L18 6M6 6l12 12"}]]]]
     [:div {:class "sm:flex sm:items-start"}
      [:div {:class "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-400 sm:mx-0 sm:h-10 sm:w-10"}
       ; "<!-- Heroicon name: outline/exclamation -->"  
       info]
      [:div {:class "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"}
       [:h3 {:class "text-lg leading-6 font-medium text-gray-900", :id "modal-title"}
        (:title @modal-content)]
       [:div {:class "mt-2"}
        [:p {:class "text-sm text-gray-500"}
         (:message @modal-content)]]]]
    ;;  [:div {:class "mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"}
    ;;   [:button {:type "button", :class "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"} "Deactivate"]
    ;;   [:button {:type "button", :class "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"} "Cancel"]]
     ]]])
(ns drip.util
  (:require-macros [drip.util])
  (:require [reitit.frontend.easy :as rfe]
            ["react" :as react]
            [reagent.core :as r]
            [shadow.lazy :as lazy]))

(defn href
  "Return relative url for given route. Url can be used in HTML links."
  ([k]
   (href k nil nil))
  ([k params]
   (href k params nil))
  ([k params query]
   (rfe/href k params query)))

(defn lazy-component* [loadable]
  (react/lazy
   (fn []
     (-> (lazy/load loadable)
         (.then (fn [root-el]
                   ;; React.lazy expects to load a ES6 module with a React Component as default export

                   ;; this would be more correct in production settings
                   ;; #js {:default (r/reactify-component root-el)}

                   ;; we need wrap the loaded component one extra level so live-reload actually works
                   ;; since React will keep a reference to the initially loaded fn and won't update it
                  #js {:default (r/reactify-component (fn [props] [@loadable props]))}))))))

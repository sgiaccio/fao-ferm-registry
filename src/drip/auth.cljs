(ns drip.auth
  (:require
   [drip.config :refer [firebase-instance userid]]
   ["firebase" :default Firebase]
   ["firebaseui" :as Firebaseui]
   ["firebase/auth"]
   ["firebase/firestore"]))


(defonce ui (atom nil))

(defn init []
  (when (and (some? @firebase-instance) (nil? @ui))
    (let [UI (.-AuthUI (.-auth Firebaseui))]
      (reset! ui (UI. (.auth Firebase))))))

(defn show-login-form []
  (.start @ui
          "#firebaseui-auth-container"
          #js {:signInOptions #js [#js {:provider "password" :signInMethod "password"}]
               :callbacks #js {:signInSuccessWithAuthResult
                               (fn [authResult _]
                                 (reset! userid (.. authResult -user -uid))
                                 false)}}))

(defn logout []
;; firebase.auth().signOut().then(() => {
;;   // Sign-out successful.
;; }).catch((error) => {
;;   // An error happened.
;; });
  (-> Firebase .auth .signOut))

(init)
; Make sure that the auth ui is initialized
(add-watch firebase-instance
           :auth
           #(init))

; Set the uid when reloading the page if user has logged in already
(.onAuthStateChanged (.auth Firebase)
                     (fn [user]
                       (if (some? user)
                         (reset! userid (.-uid user))
                         (reset! userid nil))))


;; (reset! firebase-instance 1)
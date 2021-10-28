(ns drip.auth
  (:require
   [drip.config :refer [auth-loaded userid get-user is-admin]]
   ["firebase/auth" :refer (getAuth
                            createUserWithEmailAndPassword
                            signInWithEmailAndPassword
                            onAuthStateChanged
                            signOut)]))


(defonce auth (getAuth))

;; createUserWithEmailAndPassword(auth, email, password)
;;   .then((userCredential) => {
;;     // Signed in 
;;     const user = userCredential.user;
;;     // ...
;;   })
;;   .catch((error) => {
;;     const errorCode = error.code;
;;     const errorMessage = error.message;
;;     // ..
;;   });


(defn sign-up [email password]
  (-> (createUserWithEmailAndPassword auth email password)))

(defn authenticate-user [email password]
  (-> (signInWithEmailAndPassword auth email password)
      (.then (fn [user-credential]
               (let [uid (-> user-credential .-user .-uid)]
                 (reset! userid uid)
                 (.then (get-user uid)
                        (fn [fb-obj]
                          (reset! is-admin (some #(= % "admin") (-> fb-obj .data js->clj (get "roles")))))))))
      (.catch #(js/alert "Error logging in"))))

(defn logout []
  (-> (signOut auth)
      (.then #(reset! userid nil))
      (.catch #(js/alert "Error logging out"))))

(onAuthStateChanged auth
                    (fn [user]
                      (reset! auth-loaded true)
                      (if (some? user)
                        (let [uid (.-uid user)]
                          (reset! userid uid)
                          (.then (get-user uid)
                                 (fn [fb-obj]
                                   (reset! is-admin (some #(= % "admin") (-> fb-obj .data js->clj (get "roles")))))))
                        (reset! userid nil))))


;; For use with FirebaseUI, when it will be compatible with v9 API

;; (defonce ui (atom nil))
;;
;; (defn init []
;;   (when (and (some? @firebase-instance) (nil? @ui))
;;     (let [UI (.-AuthUI (.-auth Firebaseui))]
;;       (reset! ui (UI. (.auth firebase))))))

;; (defn show-login-form []
;;   (.start @ui
;;           "#firebaseui-auth-container"
;;           #js {:signInOptions #js [#js {:provider "password" :signInMethod "password"}]
;;                :callbacks #js {:signInSuccessWithAuthResult
;;                                (fn [authResult _]
;;                                  (reset! userid (.. authResult -user -uid))
;;                                  false)}}))

;; (defn logout []
;; ;; firebase.auth().signOut().then(() => {
;; ;;   // Sign-out successful.
;; ;; }).catch((error) => {
;; ;;   // An error happened.
;; ;; });
;;   (-> firebase .auth .signOut))

;; (init)
;; ; Make sure that the auth ui is initialized
;; (add-watch firebase-instance
;;            :auth
;;            #(init))

; Set the uid when reloading the page if user has logged in already
;; (.onAuthStateChanged (.auth firebase)
;;                      (fn [user]
;;                        (if (some? user)
;;                          (reset! userid (.-uid user))
;;                          (reset! userid nil))))

;; ;; (reset! firebase-instance 1)
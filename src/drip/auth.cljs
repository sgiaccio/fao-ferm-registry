(ns drip.auth
  (:require
   [drip.config :refer (auth-loaded userid is-admin privileges)]
   ["firebase/auth" :refer (getAuth
                            connectAuthEmulator
                            createUserWithEmailAndPassword
                            signInWithEmailAndPassword
                            onAuthStateChanged
                            signOut
                            sendPasswordResetEmail)]
   ["firebase/functions" :refer (getFunctions httpsCallable connectFunctionsEmulator)]
  ;;  ["firebase/app" :refer (getApp)]
   ))


(goog-define EMULATOR false)

(defonce auth (getAuth))  
(defonce functions (getFunctions))


(when goog.DEBUG
  (connectFunctionsEmulator functions "localhost", 5001)
  (connectAuthEmulator auth "http://localhost:9099"))

(defn get-user-list []
  (let [getUsers (httpsCallable functions "listAllUsers")]
    (getUsers)))

;; (defn add-admin-role [email]
;;   (let [addAdminRole (httpsCallable functions "addAdminRole")]
;;     (.then (addAdminRole (clj->js {:email email}))
;;            #(js/console.log %))))

(defn set-user-privileges
  "Returns a promise"
  [email privileges admin]
  (let [setUserPrivileges (httpsCallable functions "setUserPrivileges")]
    (setUserPrivileges (clj->js {:email email :privileges privileges :admin admin}))))

;; (defn set-group-role [email group role]
;;   (let [setGroupRole (httpsCallable functions "setGroupRole")]
;;     (.then (setGroupRole (clj->js { :email email :group group :role role }))
;;            #(js/console.log %))))

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

(defn get-id-token []
  (.. auth -currentUser getIdTokenResult))

(defn get-user-access-privileges []
  (.then (get-id-token)
         #(let [claims (:claims (js->clj % :keywordize-keys true))]
            (reset! is-admin (:admin claims))
            (reset! privileges (:privileges claims)))))

(defn authenticate-user [email password]
  (-> (signInWithEmailAndPassword auth email password)
      (.then (fn [user-credential]
               (let [uid (-> user-credential .-user .-uid)]
                 (reset! userid uid)
                 ;;  (.then (get-user uid)
                 ;;         (fn [fb-obj]
                 ;;           (reset! is-admin (some #(= % "admin") (-> fb-obj .data js->clj (get "roles"))))))
                 (get-user-access-privileges))))
      (.catch #(js/alert (str "Error logging in") ))))

(defn logout []
  (-> (signOut auth)
      (.then #(reset! userid nil))
      (.catch #(js/alert "Error logging out"))))

(defn get-access-token []
  (.. auth -currentUser -accessToken))

(onAuthStateChanged auth
                    (fn [user]
                      (reset! auth-loaded true)
                      (if (some? user)
                        (let [uid (.-uid user)]
                          ;; (js/console.log (get-access-token))
                          (reset! userid uid)
                          (get-user-access-privileges))
                        (reset! userid nil))))

(defn send-password-reset-email [email]
  (-> (sendPasswordResetEmail auth email)
      (.then (fn [] (js/alert "Password reset email sent")))
      (.catch (fn [error]
                (let [error-code (.-code error)]
                  (if (= error-code "auth/user-not-found")
                    (js/alert "Unknown user")
                    (js/alert "Error sending password reset email. Please try again")))))))


;; sendPasswordResetEmail(auth, email)
;;   .then(() => {
;;     // Password reset email sent!
;;     // ..
;;   })
;;   .catch((error) => {
;;     const errorCode = error.code;
;;     const errorMessage = error.message;
;;     // ..
;;   });
;; auth_send_password_reset.js

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
(ns drip.auth
  (:require
   [drip.config :refer [auth-loaded userid get-user is-admin]]
   ["firebase/auth" :refer (getAuth
                            ;; connectAuthEmulator
                            createUserWithEmailAndPassword
                            signInWithEmailAndPassword
                            onAuthStateChanged
                            signOut
                            sendPasswordResetEmail)]
   ["firebase/functions" :refer (getFunctions httpsCallable connectFunctionsEmulator)]
  ;;  ["firebase/app" :refer (getApp)]
   ))



(defonce auth (getAuth))
;; (connectAuthEmulator auth "http://localhost:9099")


(defonce functions (getFunctions))
;; (connectFunctionsEmulator functions "localhost", 5001)

(defn getUserList []
  (let [getUsers (httpsCallable functions "listAllUsers")]
    (.then (getUsers)
           #(js/console.log (.-data %)))))

(defn addAdminRole [email]
  (let [addAdminRole (httpsCallable functions "addAdminRole")]
    (.then (addAdminRole (clj->js {:email email}))
           #(js/console.log %))))

(defn assignToGroup [email group role]
  (let [assignToGroup (httpsCallable functions "assignToGroup")]
    (.then (assignToGroup (clj->js { :email email :group group :role role }))
           #(js/console.log %))))

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

(defn get-access-token []
  (.. auth -currentUser -accessToken))

(onAuthStateChanged auth
                    (fn [user]
                      (reset! auth-loaded true)
                      (if (some? user)
                        (let [uid (.-uid user)]
                          ;; (js/console.log (get-access-token))
                          (reset! userid uid)
                          (.then (get-user uid)
                                 (fn [fb-obj]
                                   (reset! is-admin (some #(= % "admin") (-> fb-obj .data js->clj (get "roles")))))))
                        (reset! userid nil))))

(defn send-password-reset-email [email]
  (-> (sendPasswordResetEmail auth email)
      (.then (fn [] (js/alert "Password reset email sent")))
      (.catch (fn [error]
                (let [error-code (.-code error)]
                  (if (= error-code "auth/user-not-found")
                    (js/alert "Unknown user")
                    (js/alert "Error sending password reset email. Please try again")))))))

(defn get-users []
  (.then ()))


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
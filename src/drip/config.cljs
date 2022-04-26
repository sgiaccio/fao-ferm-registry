(ns drip.config
  (:require
   [reagent.core :as r]
  ;;  [reagent.ratom :refer [make-reaction]]

   ["firebase/app" :refer (initializeApp)]
   ["firebase/firestore/lite" :refer (getFirestore connectFirestoreEmulator collection query where getDocs doc getDoc setDoc)]
   ["regenerator-runtime/runtime"])) ; TODO: see if we still need this after switching to version 9 modular firebase API


;; (goog-define EMULATOR false)

;; Check this https://github.com/fbielejec/cljs-firebase-client

(defonce firebase-instance (atom nil))

(def auth-loaded (r/atom false))
(def userid      (r/atom nil))
(def is-admin    (r/atom nil))
(def privileges  (r/atom {}))

(defn init [config]
  (when-not @firebase-instance
    (reset! firebase-instance (initializeApp (clj->js config)))))

(init (clj->js {:apiKey            "AIzaSyC1svtyo8lap_mUZtgn65n76ZIKsvgoxYE"
                :authDomain        "fao-ferm2-review.firebaseapp.com"
                :projectId         "fao-ferm2-review"
                :storageBucket     "fao-ferm2-review.appspot.com"
                :messagingSenderId "469091359823"
                :appId             "1:469091359823:web:3770a8e98eef6e9e23de3a"
                :measurementId     "G-149EPVPT3N"}))

(defonce db (getFirestore @firebase-instance))

(when goog.DEBUG
  (connectFirestoreEmulator db "localhost" 8080))

(defonce registry-collection (collection db "registry"))
;; (defonce agencies-collection (collection db "agencies"))
(defonce groups-collection (collection db "groups"))

(defonce languages {:en {:label "English" :label-short "en"}})

(defonce project-id (r/atom nil))

(defonce default-values {}
  ;; {:metadata
  ;;  {:citation {
  ;;              :title {:loc {:en "Ecosystem restoration project pi 3.14159265359"
  ;;                            :fr "Ecosystem restoration project pi 3.14159265359"}}
  ;;              :dates [{:date {:type :creation
  ;;                              :date "2019-06-04"}}
  ;;                      {:date {:type :lastUpdate
  ;;                              :date "2020-06-04"}}]}
  ;;   ;; :abstract {:loc {:en "The Ecosystem Restoration project pi 3.14159265359 is the biggest and the most ambitious project in the world. Underpinned by knowledge in the latest IPCC and IPBES reports, large-scale ecosystem restoration is urgent – the window of opportunity is closing rapidly. It needs a systemic approach to deliver tangible benefits. This project is therefore pivotal in demonstrating and promoting systemic solutions for upscaling urgent restoration to increase biodiversity and support a wide range of ecosystem services, as requested in the Biodiversity Strategy for 2030 for damaged terrestrial, freshwater, coastal and marine ecosystems."
  ;;   ;;                  :fr "The Ecosystem Restoration project pi 3.14159265359 is the biggest and the most ambitious project in the world. Underpinned by knowledge in the latest IPCC and IPBES reports, large-scale ecosystem restoration is urgent – the window of opportunity is closing rapidly. It needs a systemic approach to deliver tangible benefits. This project is therefore pivotal in demonstrating and promoting systemic solutions for upscaling urgent restoration to increase biodiversity and support a wide range of ecosystem services, as requested in the Biodiversity Strategy for 2030 for damaged terrestrial, freshwater, coastal and marine ecosystems."}}
  ;;   :status :completed
  ;;   :points-of-contact [{:poc {:role            nil
  ;;                              :organization    nil
  ;;                              :individual-name nil
  ;;                              :web-address     nil
  ;;                              :email           nil}}]
  ;;   ;; :topic-categories ["Location"]

  ;;   :keywords [{:keyword-group {:type     :discipline
  ;;                               :keywords [{:keyword nil}]}}]}
  ;;  :results
  ;;  {:partially-achieved-reasons []}}
  )

(defonce md (r/atom default-values))

(defn save []
  (let [;;doc (if-some [id @project-id]
        ;;      (doc registry-collection id)
        ;;      (doc registry-collection))
        doc (if (= @project-id "new")
              (doc registry-collection)
              (doc registry-collection @project-id))
        ;; md-with-group (when-not (:group @md) (assoc @md :group (-> @privileges first key)))
        ]
    (reset! project-id nil)
    ;; (setDoc doc (clj->js (assoc md-with-group :uid @userid)))
    (setDoc doc (clj->js (if-not (:group @md)
                           (assoc @md :group (-> @privileges first key))
                           @md)))))

(defn create-empty-doc []
  (let [new-ref (doc registry-collection)]
    (.-id new-ref)))

(defn get-all-projects []
  (.then (getDocs (query registry-collection))
         (fn [query-snapshot]
           ;; (doall (map #(.data %) (.-docs query-snapshot)))
           ^js/Array (.-docs query-snapshot))))

(defn get-public-projects []
  (.then (getDocs (query registry-collection (where "public" "==" true)))
         (fn [query-snapshot]
           ;; (doall (map #(.data %) (.-docs query-snapshot)))
           ^js/Array (.-docs query-snapshot))))

(defn get-user-accessible-projects
  "Returns a list of records accessible by the current user (either public or belonging to one of his groups)"
  []
  (let [user-groups (-> @privileges keys clj->js)
        q           (query registry-collection (where "group" "in" user-groups))
        private     (getDocs q)
        public      (get-public-projects)]
    (.then (js/Promise.all #js [private public])
           (fn [[pr pu]]
             ;; Deduplicate results from the two queries
             (let [duplicates (concat (vec pu) (vec ^js/Array (.-docs pr)))
                   t (into {} (map #(-> [(.-id %) %]) duplicates))]
               (vals t))))))

(defn get-projects []
  (cond
    @is-admin (get-all-projects)
    (not @userid) (get-public-projects)
    :else (get-user-accessible-projects)))

(defn get-project [id]
  (reset! project-id id)
  (let [doc-ref  (doc db "registry" id)]
    (getDoc doc-ref)))

;; (defn get-agencies []
;;   (.then (getDocs (query agencies-collection))
;;          (fn [query-snapshot]
;;            ^js/Array (.-docs query-snapshot))))

(defn get-groups []
  (.then (getDocs (query groups-collection))
         (fn [query-snapshot]
           ^js/Array (.-docs query-snapshot))))

(defn get-admin-level [project]
  (get @privileges (keyword (.. project data -group))))

(defn can-create []
  (or @is-admin
      (seq (filter #(contains? #{"admin" "editor"} (val %)) @privileges))))

(defn can-edit [project]
  (or @is-admin
      (contains? #{"admin" "editor"} (get-admin-level project))))

(defn get-user [uid]
  (let [doc-ref (doc db "users" uid)]
    (getDoc doc-ref)))

;; Sample higher level conf

;; (def form {:type :group
;;            :display :tab
;;            :title "Identification"
;;            :children [{:type :text
;;                        :label "Title"
;;                        :localized true
;;                        :multiple false}
;;                       {:type :group
;;                        :label "Dates"
;;                        :multiple true
;;                        :children [{:type :date
;;                                    :multiple :false}
;;                                   {:type :select
;;                                    :multiple false
;;                                    ;; :unique true ; TODO unique in which scope?
;;                                    :options {:adopted         "Adopted"
;;                                              :creation        "Creation"
;;                                              :deprecated      "Deprecated"
;;                                              :distribution    "Distribution"
;;                                              :expiry          "Expiry"
;;                                              :inForce         "In Force"
;;                                              :lastRevision    "Last Revision"
;;                                              :lastUpdate      "Last Update"
;;                                              :nextUpdate      "Next Update"
;;                                              :publication     "Publication"
;;                                              :released        "Released"
;;                                              :revision        "Revision"
;;                                              :superseded      "Superseded"
;;                                              :unavailable     "Unavailable"
;;                                              :validityBegins  "Validity Begins"
;;                                              :validityExpires "Validity Expires"}}]}
;;                       {:type :textarea
;;                        :label "Abstract"
;;                        :localized true
;;                        :multiple false}
;;                       {:type :select
;;                        :multiple false
;;                        :options [[:accepted          "Accepted"]
;;                                  [:completed         "Completed"]
;;                                  [:deprecated        "Deprecated"]
;;                                  [:final             "Final"]
;;                                  [:historicalArchive "Historical archive"]
;;                                  [:notAccepted       "Not Accepted"]
;;                                  [:obsolete          "Obsolete"]
;;                                  [:onGoing           "On going"]
;;                                  [:pending           "Pending"]
;;                                  [:planned           "Planned"]
;;                                  [:proposed          "Proposed"]
;;                                  [:required          "Required"]
;;                                  [:retired           "Retired"]
;;                                  [:superseded        "Superseded"]
;;                                  [:tentative         "Tentative"]
;;                                  [:underDevelopment  "Under development"]
;;                                  [:valid             "Valid"]
;;                                  [:withdrawn         "Withdrawn"]]}]})

(defonce modal-content (r/atom nil))

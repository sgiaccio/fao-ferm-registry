(ns drip.config
  (:require
   [reagent.core :as r]
   ["firebase" :default Firebase]
   ["firebase/auth"]
   ["firebase/firestore"]))


;; Check this https://github.com/fbielejec/cljs-firebase-client


;; firebase.initializeApp({
;;   apiKey: '### FIREBASE API KEY ###',
;;   authDomain: '### FIREBASE AUTH DOMAIN ###',
;;   projectId: '### CLOUD FIRESTORE PROJECT ID ###'
;; });

;; var db = firebase.firestore();


(defonce firebase-instance (atom nil))

(def userid (r/atom nil))

(defn init [config]
  (when-not @firebase-instance
    (reset! firebase-instance (-> Firebase (.initializeApp (clj->js config))))
    ;; (let [UI (.-AuthUI (.-auth Firebaseui))
    ;;       _  (reset! ui (UI. (.auth Firebase)))
    ;;       provider_id (.. Firebase -auth -EmailAuthProvider -PROVIDER_ID)
    ;;       ;; (.start @ui "#firebaseui-auth-container" #js {:signInOptions [(.. Firebase auth EmailAuthProvider PROVIDER_ID)]})
    ;;       ]
    ;;   (js/console.log "------------------------------")
    ;;   (js/console.log provider_id)
    ;;   (js/console.log @ui)
    ;;   (js/console.log #js {:signInOptions #js [ #js {:provider "password" :signInMethod "password"}]})
      
    ;;   (.start @ui "#firebaseui-auth-container" #js {:signInOptions #js [ #js {:provider "password" :signInMethod "password"}]})
    ;; ;; (js/console.log "---------")
    ;; ;; (reset! ui "(.AuthUI (.-auth Firebaseui) (.auth Firebase))")
    ;; ;; (js/console.log @ui)
    ;; ;; (.start @ui "#firebaseui-auth-container" #js {:signInOptions [(.. firebase auth EmailAuthProvider PROVIDER_ID)]})
    ;; )
    ))

(init (clj->js {:apiKey "AIzaSyDWpt9xQ9DLOYXhbi6QZtjXe3mIOdVvuIA"
                :authDomain "drip-f429f.firebaseapp.com"
                :projectId "drip-f429f"
                :storageBucket "drip-f429f.appspot.com"
                :messagingSenderId "807676682446"
                :appId "1:807676682446:web:94694090ff2fe30bad309f"}))
(def db (.firestore Firebase))
(def registry-collection (.collection db "registry"))



(defonce languages {:en {:label "English" :label-short "en"}
                ;;     :fr {:label "Français" :label-short "fr"}
                    })

(defonce project-id (r/atom nil))

(defonce default-values
  {:metadata
   {:citation {:title {:loc {:en "Ecosystem restoration project pi 3.14159265359"
                             :fr "Ecosystem restoration project pi 3.14159265359"}}
               :dates [{:date {:type :creation
                               :date "2019-06-04"}}
                       {:date {:type :lastUpdate
                               :date "2020-06-04"}}]}
    :abstract {:loc {:en "The Ecosystem Restoration project pi 3.14159265359 is the biggest and the most ambitious project in the world. Underpinned by knowledge in the latest IPCC and IPBES reports, large-scale ecosystem restoration is urgent – the window of opportunity is closing rapidly. It needs a systemic approach to deliver tangible benefits. This project is therefore pivotal in demonstrating and promoting systemic solutions for upscaling urgent restoration to increase biodiversity and support a wide range of ecosystem services, as requested in the Biodiversity Strategy for 2030 for damaged terrestrial, freshwater, coastal and marine ecosystems."
                     :fr "The Ecosystem Restoration project pi 3.14159265359 is the biggest and the most ambitious project in the world. Underpinned by knowledge in the latest IPCC and IPBES reports, large-scale ecosystem restoration is urgent – the window of opportunity is closing rapidly. It needs a systemic approach to deliver tangible benefits. This project is therefore pivotal in demonstrating and promoting systemic solutions for upscaling urgent restoration to increase biodiversity and support a wide range of ecosystem services, as requested in the Biodiversity Strategy for 2030 for damaged terrestrial, freshwater, coastal and marine ecosystems."}}
    :status :completed
    :points-of-contact [{:poc {:role            nil
                               :organization    nil
                               :individual-name nil
                               :web-address     nil
                               :email           nil}}]
    :topic-categories ["Location"]

    :keywords [{:keyword-group {:type     :discipline
                                :keywords [{:keyword nil}]}}]}
   :results
   {:partially-achieved-reasons []}})

(defonce md (r/atom default-values))

(defn save []
  (let [doc (if-some [id @project-id]
              (.doc registry-collection id)
              (.doc registry-collection))]
    (reset! project-id nil)
    (.set doc (clj->js (assoc @md :uid @userid)))))

(defn get-all-projects []
  (.then (.get (.collection db "registry"))
         (fn [query-snapshot]
           ;; (doall (map #(.data %) (.-docs query-snapshot)))
           (.-docs query-snapshot))))

;; db.collection ("cities") .doc ("SF");
(defn get-project [id]
  (if (= "new" id)
    (let [doc (.get (.doc registry-collection))]
      (reset! project-id (.-id doc))
      doc)
    (do
      (reset! project-id id)
      (.get (.doc registry-collection id)))))


;; (add-watch userid
;;            :userid
;;            #(js/alert @userid))





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

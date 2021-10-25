(ns drip.config
  (:require
   [reagent.core :as r]
  ;;  [reagent.ratom :refer [make-reaction]]

   ["firebase/app" :refer (initializeApp)]
   ["firebase/firestore/lite" :refer (getFirestore collection query getDocs doc getDoc setDoc)]
   ["regenerator-runtime/runtime"])) ; TODO: see if we still need this after switching to version 9 modular firebase API


;; Check this https://github.com/fbielejec/cljs-firebase-client

(defonce firebase-instance (atom nil))

(def auth-loaded (r/atom false))
(def userid      (r/atom nil))
(def is-admin    (r/atom nil))

(defn init [config]
  (when-not @firebase-instance
    (reset! firebase-instance (initializeApp (clj->js config)))))

(init (clj->js {:apiKey "AIzaSyDWpt9xQ9DLOYXhbi6QZtjXe3mIOdVvuIA"
                :authDomain "drip-f429f.firebaseapp.com"
                :projectId "drip-f429f"
                :storageBucket "drip-f429f.appspot.com"
                :messagingSenderId "807676682446"
                :appId "1:807676682446:web:94694090ff2fe30bad309f"}))

(defonce db (getFirestore @firebase-instance))
(defonce registry-collection (collection db "registry"))


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

;; (-> @(r/track md)
;;       js/console.log)

;; (defn person-keys []
;;   (-> @(r/track md)
;;       keys
;;       sort))


;; (make-reaction (fn []
;;                  (and
;;                   (some? @userid)
;;                   (or
;;                    (= @userid (:uid @md))
;;                    (nil? (:uid @md))))))

;; (def caz (r/cursor md [:aoi]))
;; (make-reaction (fn []
;;                  (js/console.log @userid)))


;; (js/console.log @md)



;; (defonce tmp-name (atom []))
;; (def aoi (r/cursor md [:aoi]))
;; (def baseline (r/cursor md [:baseline]))
;; (defn aggregate-state []
;;   (let [baselines (into [] (map identity @aoi))]
;;     (reset! baseline baselines)
;;     (swap! baseline
;;            (fn []
;;              ))))
;; (defonce tmp-name-logger (r/track! aggregate-state))





;; (defn ^:export history [& args]
;;   (let [d @md
;;         k (if (seq args)
;;             (map keyword args)
;;             (keys d))]
;;     @tmp-name))



(defn save []
  (let [;;doc (if-some [id @project-id]
        ;;      (doc registry-collection id)
        ;;      (doc registry-collection))
        doc (if (= @project-id "new")
              (doc registry-collection)
              (doc registry-collection @project-id))]
    (reset! project-id nil)
    (setDoc doc (clj->js (assoc @md :uid @userid)))))

(defn get-all-projects []
  (.then (getDocs (query registry-collection))
         (fn [query-snapshot]
           ;; (doall (map #(.data %) (.-docs query-snapshot)))
           ^js/Array (.-docs query-snapshot))))

(defn get-project [id]
  (reset! project-id id)
  (let [doc-ref  (doc db "registry" id)]
    (getDoc doc-ref)))

(defn get-user [uid]
  (let [doc-ref  (doc db "users" uid)]
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

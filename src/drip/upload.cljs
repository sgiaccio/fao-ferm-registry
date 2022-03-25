(ns drip.upload
  (:require
   ["firebase/storage" :refer (getStorage, ref, uploadBytes, getDownloadURL, listAll getBlob)]
   [clojure.string :as string]))


(defonce storage (getStorage))

(defn upload-file [project-id path file]
  (let [storage-ref (ref storage (str project-id "/" (string/join "/" path) "/" (.-name file)))
        uploadTask (uploadBytes storage-ref file)]
    ;; (js/console.log uploadTask)
    (.then uploadTask (fn [snapshot] (js/console.log snapshot)))
    ;; (.on uploadTask "stateChanged"
    ;;      #(js/console.log %)
    ;;      #(js/console.error %)
    ;;      (.then (getDownloadURL (.. uploadTask -snapshot -ref))
    ;;             #(js/console.log "File available at" %)))
    ))

;; ref (storage, 'files/uid')
(defn list-files [project-id path]
  (let [dir-ref (ref storage (str project-id "/" (string/join "/" path)))
        ;; _ (js/console.log project-id)
        ;; _ (js/console.log path)
        ]
    (listAll dir-ref)
    ))

(defn get-download-url [path]
  ;; getDownloadURL (ref (storage, 'images/stars.jpg'))
  (getDownloadURL (ref storage path)))

(defn download-blob [path]
  (getBlob (ref storage path)))
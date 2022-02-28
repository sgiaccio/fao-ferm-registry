(ns drip.upload
  (:require
   ["firebase/storage" :refer (getStorage, ref, uploadBytes, getDownloadURL)]
   [clojure.string :as string]))


(defonce storage (getStorage))

(defn upload-file [project-id path file]
  (let [storage-ref (ref storage (str project-id "/" (string/join "/" path) "/" (.-name file)))
        uploadTask (uploadBytes storage-ref file)]
    (js/console.log uploadTask)
    (.then uploadTask (fn [snapshot] (js/console.log snapshot)))
    ;; (.on uploadTask "stateChanged"
    ;;      #(js/console.log %)
    ;;      #(js/console.error %)
    ;;      (.then (getDownloadURL (.. uploadTask -snapshot -ref))
    ;;             #(js/console.log "File available at" %)))
    ))

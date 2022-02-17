(ns drip.upload
  (:require
   ["firebase/storage" :refer (getStorage, ref, uploadBytes)]
   [clojure.string :as string]))


(defonce storage (getStorage))

(defn upload-file [project-id path file]
  (let [storage-ref (ref storage (str project-id "/" (string/join "/" path) "/" (.-name file)))]
    (uploadBytes storage-ref file)))

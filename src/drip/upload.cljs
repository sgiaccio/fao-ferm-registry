(ns drip.upload
  (:require
   ["firebase/storage" :refer (getStorage, ref, uploadBytes, getDownloadURL, listAll getBlob)]
   [ajax.core :refer [POST raw-response-format]]
   [drip.config :refer [project-id]]))


(defonce storage (getStorage))

(defn upload-file [path file]
  (let [storage-ref (ref storage (str path "/" (.-name file)))
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
(defn list-files [path]
  (let [dir-ref (ref storage path)
        ;; _ (js/console.log project-id)
        ;; _ (js/console.log path)
        ]
    (listAll dir-ref)))

(defn get-download-url [path]
  ;; getDownloadURL (ref (storage, 'images/stars.jpg'))
  (getDownloadURL (ref storage path)))

(defn download-blob [path]
  (getBlob (ref storage path)))

(defn upload-file-multipart [path file]
  (let [form-data (doto
                   (js/FormData.)
                    (.append "project_id" @project-id) ;; TODO pass project-id as argument
                    (.append "file" file (.-name file)))]
    (js/Promise. (fn [resolve reject]
                   (POST path {:body form-data
                               :response-format (raw-response-format)
                               :timeout 10000
                               :handler (fn [response] (resolve response))
                               :error-handler (fn [{:keys [status status-text]}]
                                                (js/alert status-text)
                                                (reject status))})))))
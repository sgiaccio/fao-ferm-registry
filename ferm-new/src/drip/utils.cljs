(ns drip.utils
  (:require
   [drip.admin2 :as admin2])
  )

(defn get-admin2-names [admin0-id admin1-id admin2-id]
  (let [adm0 (if admin0-id
               (first (filter #(= (:code %) (name admin0-id)) admin2/admin2))
               nil)
        adm1 (if admin1-id
               (first (filter #(= (:code %) (name admin1-id)) (:children adm0)))
               nil)
        adm2 (if admin2-id
               (first (filter #(= (:code %) (name admin2-id)) (:children adm1)))
               nil)]
    {:adm0 (:name adm0)
     :adm1 (:name adm1)
     :adm2 (:name adm2)}))
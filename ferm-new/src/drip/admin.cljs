(ns drip.admin
  (:require
   [drip.auth :refer [get-user-list set-user-privileges]]
   [drip.config :refer [modal-content get-groups]]
   [reagent.core :as r :refer [with-let]]))

(defonce group-list (r/atom nil))

(defn unassign [privileges group]
  (when (js/confirm "are you sure")
     (swap! privileges dissoc group)))

(defn- get-group-name [group-id]
  (get @group-list group-id))

(defn user-details [user]
  ;; (js/console.log (clj->js @group-list))
  (with-let [custom-claims  (:customClaims user)
             admin          (r/atom (or (:admin custom-claims) false))
             privileges     (r/atom (:privileges custom-claims))
             group-menu     (r/atom (apply (partial dissoc @group-list) (keys @privileges)))
             selected-group (r/atom (if (seq @group-menu) (-> @group-menu first key) nil))
             selected-role  (r/atom "guest")]
    ;; (def group-menu (apply (partial dissoc @group-list) (keys @privileges)))
    ;; (reset! selected-group (-> group-menu first key))
    ;; (js/console.log "--------------------------")
    ;; (js/console.log "=? " @selected-group)
    [:div
     [:div
      {:class "mb-6 mt-6"}
      [:input {:type "checkbox"
               :class "mr-2"
               :id "admin"
               :name "admin"
               :checked @admin
               :on-change #(swap! admin not)}]
      [:label {:for "admin"} "Admin"]]
     (doall (for [[group privilege] (into [] @privileges)]
              [:div {:key group} (get-group-name group) ": " privilege " "
               [:span {:class "text-red-600 cursor-pointer hover:text-red-700"
                       :on-click (fn []
                                   (unassign privileges group)
                                   (reset! group-menu (apply (partial dissoc @group-list) (keys @privileges)))
                                   (when (seq @group-menu)
                                     (reset! selected-group (-> @group-menu first key))))} "[delete]"]]))
     (when (seq @group-menu) [:<>
                              [:select
                               {:class "mr-6 max-w-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                :value     @selected-group
                                :on-change #(reset! selected-group (-> % .-target .-value keyword))}
                               (doall (for [group @group-menu]
                                        [:option {:key (key group)
                                                  :value (key group)} (val group)]))]
                              [:select
                               {:class "mr-6 max-w-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                :value @selected-role
                                :on-change #(reset! selected-role (-> % .-target .-value))}
                               [:option {:value "guest"}  "guest"]
                               [:option {:value "editor"} "editor"]
                               [:option {:value "admin"}  "admin"]]
                              [:button {:type "button"
                                        :class "my-6 inline-flex items-center px-4 py-1 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        :on-click (fn []
                                                    (swap! privileges assoc @selected-group @selected-role)
                                                    (swap! group-menu dissoc @selected-group)
                                                    (when (seq @group-menu)
                                                      (reset! selected-group (-> @group-menu first key)))
                                                    (reset! selected-role "guest"))}
                               "Add "]])
     [:div
      [:button {:type "button"
                :class "my-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :on-click (fn []
                            (-> (set-user-privileges (:email user) @privileges @admin)
                                (.then (fn []
                                         (js/alert "Privileges assigned")
                                         (reset! modal-content nil)))
                                (.catch #(js/alert (str "Error assigning privileges" %)))))}
       "Save"]]]))


(defn user-list []
  (with-let [user-list  (r/atom nil)
             _          (.then (get-user-list)
                               #(reset! user-list (get-in (js->clj % :keywordize-keys true) [:data :users])))
             _          (.then (get-groups)
                               (fn [firebase-groups]
                                 (reset! group-list (into {} (map #(-> [(keyword (.-id %)) (get-in (js->clj (.data %)) ["name"])]) firebase-groups)))))]
    [:div
     [:div "Users"
      (when (and @user-list @group-list)
        [:ul
         (doall (for [user @user-list]
                  [:li {:key (:uid user)
                        :class "underline text-blue-600 hover:text-blue-500 cursor-pointer"
                        :on-click #(reset! modal-content {:title (str "User: " (:displayName user))
                                                          :message [user-details user]})}
                   (:displayName user) " - " (:email user)]))])]
     [:div {:class "mt-6"} "Groups"
      (when (and @user-list @group-list)
        [:ul
         (doall (for [group @group-list
                      :let [group-name (val group)]]
                  [:li {:key (key group)
                        :class "underline text-blue-600 hover:text-blue-500 cursor-pointer"
                        :on-click #(reset! modal-content {:title (str "Group: " group-name)
                                                          :message ""})}
                   group-name]))])]]))

(ns drip.icons)

(def trash
  [:svg.bi.bi-trash {:width "1em"
                          :height "1em"
                          :viewBox "0 0 16 16"
                          :fill "currentColor"
                          :xmlns "http://www.w3.org/2000/svg"}
   [:path {:d "M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"}]
   [:path {:fill-rule "evenodd"
           :d "M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"}]])

(def plus
  [:svg.bi.bi-x {:width "1em"
                    :height "1em"
                    :viewBox "0 0 16 16"
                    :fill "currentColor"
                    :xmlns "http://www.w3.org/2000/svg"}
   [:path {:fill-rule "evenodd"
           :d "M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"}]
   [:path {:fill-rule "evenodd"
           :d "M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"}]])

(def info
  [:svg {:xmlns "http://www.w3.org/2000/svg", :class "h-6 w-6", :fill "none", :viewbox "0 0 24 24", :stroke "currentColor"}
   [:path {:stroke-linecap "round", :stroke-linejoin "round", :stroke-width "2", :d "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}]])

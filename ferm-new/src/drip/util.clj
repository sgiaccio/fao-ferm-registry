(ns drip.util)

(defmacro lazy-component [the-sym]
  `(drip.util/lazy-component* (shadow.lazy/loadable ~the-sym)))

;; nanoseconds, using java 1.8 time
(-> (java.time.LocalDateTime/now)
    (.toEpochSecond java.time.ZoneOffset/UTC)
    (* 1000000000))

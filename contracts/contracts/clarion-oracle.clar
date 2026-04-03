(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-stale-price (err u201))
(define-constant err-zero-price (err u202))

(define-data-var stx-price uint u0)
(define-data-var updated-at uint u0)
(define-data-var max-price-age uint u144)

(define-private (is-owner)
  (is-eq tx-sender contract-owner)
)

(define-public (set-stx-price (new-price uint))
  (begin
    (asserts! (is-owner) err-owner-only)
    (asserts! (> new-price u0) err-zero-price)
    (var-set stx-price new-price)
    (var-set updated-at burn-block-height)
    (ok new-price)
  )
)

(define-public (set-max-price-age (new-max-age uint))
  (begin
    (asserts! (is-owner) err-owner-only)
    (var-set max-price-age new-max-age)
    (ok new-max-age)
  )
)

(define-read-only (get-stx-price)
  (let
    (
      (price (var-get stx-price))
      (last-updated (var-get updated-at))
    )
    (asserts! (> price u0) err-zero-price)
    (asserts! (<= (- burn-block-height last-updated) (var-get max-price-age)) err-stale-price)
    (ok price)
  )
)

(define-read-only (get-oracle-state)
  (ok
    {
      stx-price: (var-get stx-price),
      updated-at: (var-get updated-at),
      max-price-age: (var-get max-price-age)
    }
  )
)

(impl-trait .sip-010-trait.sip-010-trait)

(define-fungible-token mock-usdc)

(define-constant contract-owner tx-sender)
(define-constant token-uri none)
(define-constant err-owner-only (err u100))
(define-constant err-same-sender-recipient (err u101))
(define-constant err-zero-amount (err u102))
(define-constant err-not-authorized (err u103))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-zero-amount)
    (try! (ft-mint? mock-usdc amount recipient))
    (ok true)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (> amount u0) err-zero-amount)
    (asserts! (not (is-eq sender recipient)) err-same-sender-recipient)
    (asserts! (or (is-eq sender tx-sender) (is-eq sender contract-caller)) err-not-authorized)
    (match memo to-print (print to-print) 0x)
    (try! (ft-transfer? mock-usdc amount sender recipient))
    (ok true)
  )
)

(define-read-only (get-name)
  (ok "Mock USDC")
)

(define-read-only (get-symbol)
  (ok "mUSDC")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (owner principal))
  (ok (ft-get-balance mock-usdc owner))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply mock-usdc))
)

(define-read-only (get-token-uri)
  (ok token-uri)
)

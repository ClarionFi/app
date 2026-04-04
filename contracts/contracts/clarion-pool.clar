(use-trait sip-010-trait .sip-010-trait.sip-010-trait)

(define-constant contract-owner tx-sender)
(define-constant precision u1000000)
(define-constant bps-scale u10000)

(define-constant err-owner-only (err u300))
(define-constant err-not-initialized (err u301))
(define-constant err-already-initialized (err u302))
(define-constant err-pool-paused (err u303))
(define-constant err-asset-mismatch (err u304))
(define-constant err-zero-amount (err u305))
(define-constant err-insufficient-shares (err u306))
(define-constant err-insufficient-liquidity (err u307))
(define-constant err-insufficient-collateral (err u308))
(define-constant err-position-unsafe (err u309))
(define-constant err-no-debt (err u310))
(define-constant err-position-healthy (err u311))

(define-data-var initialized bool false)
(define-data-var paused bool false)
(define-data-var asset-contract (optional principal) none)

(define-data-var total-shares uint u0)
(define-data-var total-liquid-assets uint u0)
(define-data-var total-debt uint u0)

(define-data-var collateral-factor-bps uint u7000)
(define-data-var liquidation-threshold-bps uint u8000)
(define-data-var liquidation-bonus-bps uint u10500)
(define-data-var close-factor-bps uint u5000)
(define-data-var borrow-fee-bps uint u30)

(define-map supplier-shares
  principal
  uint
)
(define-map borrower-debt
  principal
  uint
)
(define-map borrower-collateral
  principal
  uint
)

(define-private (is-owner)
  (is-eq tx-sender contract-owner)
)

(define-private (ensure-active)
  (if (var-get paused)
    err-pool-paused
    (ok true)
  )
)

(define-private (ensure-initialized)
  (if (var-get initialized)
    (ok true)
    err-not-initialized
  )
)

(define-private (ensure-token (asset-token <sip-010-trait>))
  (if (is-eq (some (contract-of asset-token)) (var-get asset-contract))
    (ok true)
    err-asset-mismatch
  )
)

(define-private (total-assets)
  (+ (var-get total-liquid-assets) (var-get total-debt))
)

(define-private (get-collateral-value
    (collateral uint)
    (price uint)
  )
  (/ (* collateral price) precision)
)

(define-private (get-borrow-limit
    (collateral uint)
    (price uint)
  )
  (/ (* (get-collateral-value collateral price) (var-get collateral-factor-bps))
    bps-scale
  )
)

(define-private (get-liquidation-limit
    (collateral uint)
    (price uint)
  )
  (/
    (* (get-collateral-value collateral price)
      (var-get liquidation-threshold-bps)
    )
    bps-scale
  )
)

(define-private (compute-share-mint (amount uint))
  (let (
      (shares (var-get total-shares))
      (assets (total-assets))
    )
    (if (or (is-eq shares u0) (is-eq assets u0))
      amount
      (/ (* amount shares) assets)
    )
  )
)

(define-private (compute-asset-amount (shares uint))
  (let (
      (all-shares (var-get total-shares))
      (assets (total-assets))
    )
    (if (or (is-eq all-shares u0) (is-eq assets u0))
      u0
      (/ (* shares assets) all-shares)
    )
  )
)

(define-private (load-price)
  (contract-call? .clarion-oracle get-stx-price)
)

(define-private (position-safe-after
    (collateral uint)
    (debt uint)
  )
  (let ((price (unwrap-panic (load-price))))
    (<= debt (get-borrow-limit collateral price))
  )
)

(define-public (initialize (asset-token <sip-010-trait>))
  (begin
    (asserts! (is-owner) err-owner-only)
    (asserts! (not (var-get initialized)) err-already-initialized)
    (var-set asset-contract (some (contract-of asset-token)))
    (var-set initialized true)
    (ok true)
  )
)

(define-public (set-paused (new-paused bool))
  (begin
    (asserts! (is-owner) err-owner-only)
    (var-set paused new-paused)
    (ok new-paused)
  )
)

(define-public (set-risk-params
    (new-collateral-factor-bps uint)
    (new-liquidation-threshold-bps uint)
    (new-liquidation-bonus-bps uint)
    (new-close-factor-bps uint)
    (new-borrow-fee-bps uint)
  )
  (begin
    (asserts! (is-owner) err-owner-only)
    (asserts! (< new-collateral-factor-bps new-liquidation-threshold-bps)
      err-position-unsafe
    )
    (asserts! (<= new-liquidation-threshold-bps bps-scale) err-position-unsafe)
    (asserts! (>= new-liquidation-bonus-bps bps-scale) err-position-unsafe)
    (asserts! (<= new-close-factor-bps bps-scale) err-position-unsafe)
    (var-set collateral-factor-bps new-collateral-factor-bps)
    (var-set liquidation-threshold-bps new-liquidation-threshold-bps)
    (var-set liquidation-bonus-bps new-liquidation-bonus-bps)
    (var-set close-factor-bps new-close-factor-bps)
    (var-set borrow-fee-bps new-borrow-fee-bps)
    (ok true)
  )
)

(define-public (supply
    (asset-token <sip-010-trait>)
    (amount uint)
  )
  (let (
      (minted-shares (compute-share-mint amount))
      (current-shares (default-to u0 (map-get? supplier-shares tx-sender)))
    )
    (try! (ensure-initialized))
    (try! (ensure-active))
    (try! (ensure-token asset-token))
    (asserts! (> amount u0) err-zero-amount)
    (try! (contract-call? asset-token transfer amount tx-sender .clarion-pool none))
    (var-set total-shares (+ (var-get total-shares) minted-shares))
    (var-set total-liquid-assets (+ (var-get total-liquid-assets) amount))
    (map-set supplier-shares tx-sender (+ current-shares minted-shares))
    (ok minted-shares)
  )
)

(define-public (withdraw
    (asset-token <sip-010-trait>)
    (share-amount uint)
  )
  (let (
      (current-shares (default-to u0 (map-get? supplier-shares tx-sender)))
      (asset-amount (compute-asset-amount share-amount))
    )
    (try! (ensure-initialized))
    (try! (ensure-active))
    (try! (ensure-token asset-token))
    (asserts! (> share-amount u0) err-zero-amount)
    (asserts! (>= current-shares share-amount) err-insufficient-shares)
    (asserts! (> asset-amount u0) err-zero-amount)
    (asserts! (>= (var-get total-liquid-assets) asset-amount)
      err-insufficient-liquidity
    )
    (var-set total-shares (- (var-get total-shares) share-amount))
    (var-set total-liquid-assets (- (var-get total-liquid-assets) asset-amount))
    (map-set supplier-shares tx-sender (- current-shares share-amount))
    (try! (contract-call? asset-token transfer asset-amount .clarion-pool tx-sender
      none
    ))
    (ok asset-amount)
  )
)

(define-public (deposit-collateral (amount uint))
  (let ((current-collateral (default-to u0 (map-get? borrower-collateral tx-sender))))
    (try! (ensure-initialized))
    (try! (ensure-active))
    (asserts! (> amount u0) err-zero-amount)
    (try! (stx-transfer? amount tx-sender .clarion-pool))
    (map-set borrower-collateral tx-sender (+ current-collateral amount))
    (ok (+ current-collateral amount))
  )
)

(define-public (withdraw-collateral (amount uint))
  (let (
      (caller tx-sender)
      (current-collateral (default-to u0 (map-get? borrower-collateral tx-sender)))
      (current-debt (default-to u0 (map-get? borrower-debt tx-sender)))
    )
    (try! (ensure-initialized))
    (try! (ensure-active))
    (asserts! (> amount u0) err-zero-amount)
    (asserts! (>= current-collateral amount) err-insufficient-collateral)
    (let ((next-collateral (- current-collateral amount)))
      (asserts! (position-safe-after next-collateral current-debt)
        err-position-unsafe
      )
      (map-set borrower-collateral tx-sender next-collateral)
      (try! (as-contract? ((with-stx amount)) (try! (stx-transfer? amount tx-sender caller))))
      (ok next-collateral)
    )
  )
)

(define-public (borrow
    (asset-token <sip-010-trait>)
    (amount uint)
  )
  (let (
      (current-collateral (default-to u0 (map-get? borrower-collateral tx-sender)))
      (current-debt (default-to u0 (map-get? borrower-debt tx-sender)))
      (fee (/ (* amount (var-get borrow-fee-bps)) bps-scale))
      (next-debt (+ current-debt amount fee))
    )
    (try! (ensure-initialized))
    (try! (ensure-active))
    (try! (ensure-token asset-token))
    (asserts! (> amount u0) err-zero-amount)
    (asserts! (>= (var-get total-liquid-assets) amount)
      err-insufficient-liquidity
    )
    (asserts! (position-safe-after current-collateral next-debt)
      err-position-unsafe
    )
    (map-set borrower-debt tx-sender next-debt)
    (var-set total-debt (+ (var-get total-debt) amount fee))
    (var-set total-liquid-assets (- (var-get total-liquid-assets) amount))
    (try! (contract-call? asset-token transfer amount .clarion-pool tx-sender none))
    (ok next-debt)
  )
)

(define-public (repay
    (asset-token <sip-010-trait>)
    (amount uint)
  )
  (let (
      (current-debt (default-to u0 (map-get? borrower-debt tx-sender)))
      (repay-amount (if (> amount current-debt)
        current-debt
        amount
      ))
      (next-debt (- current-debt repay-amount))
    )
    (try! (ensure-initialized))
    (try! (ensure-active))
    (try! (ensure-token asset-token))
    (asserts! (> current-debt u0) err-no-debt)
    (asserts! (> amount u0) err-zero-amount)
    (try! (contract-call? asset-token transfer repay-amount tx-sender .clarion-pool
      none
    ))
    (map-set borrower-debt tx-sender next-debt)
    (var-set total-debt (- (var-get total-debt) repay-amount))
    (var-set total-liquid-assets (+ (var-get total-liquid-assets) repay-amount))
    (ok next-debt)
  )
)

(define-public (liquidate
    (asset-token <sip-010-trait>)
    (borrower principal)
    (requested-repay uint)
  )
  (let (
      (liquidator tx-sender)
      (price (unwrap-panic (load-price)))
      (current-debt (default-to u0 (map-get? borrower-debt borrower)))
      (current-collateral (default-to u0 (map-get? borrower-collateral borrower)))
      (liquidation-limit (get-liquidation-limit current-collateral price))
      (max-close (/ (* current-debt (var-get close-factor-bps)) bps-scale))
      (repay-amount (if (> requested-repay max-close)
        max-close
        requested-repay
      ))
      (base-seize (/ (* repay-amount precision) price))
      (collateral-to-seize (/ (* base-seize (var-get liquidation-bonus-bps)) bps-scale))
      (capped-seize (if (> collateral-to-seize current-collateral)
        current-collateral
        collateral-to-seize
      ))
      (next-debt (- current-debt repay-amount))
      (next-collateral (- current-collateral capped-seize))
    )
    (try! (ensure-initialized))
    (try! (ensure-active))
    (try! (ensure-token asset-token))
    (asserts! (> requested-repay u0) err-zero-amount)
    (asserts! (> current-debt u0) err-no-debt)
    (asserts! (> current-debt liquidation-limit) err-position-healthy)
    (try! (contract-call? asset-token transfer repay-amount liquidator
      .clarion-pool none
    ))
    (map-set borrower-debt borrower next-debt)
    (map-set borrower-collateral borrower next-collateral)
    (var-set total-debt (- (var-get total-debt) repay-amount))
    (var-set total-liquid-assets (+ (var-get total-liquid-assets) repay-amount))
    (try! (as-contract? ((with-stx capped-seize)) (try! (stx-transfer? capped-seize tx-sender liquidator))))
    (ok {
      repaid: repay-amount,
      seized: capped-seize,
      remaining-debt: next-debt,
    })
  )
)

(define-read-only (get-supplier-position (supplier principal))
  (let (
      (shares (default-to u0 (map-get? supplier-shares supplier)))
      (asset-claim (compute-asset-amount shares))
    )
    (ok {
      shares: shares,
      asset-claim: asset-claim,
    })
  )
)

(define-read-only (get-borrower-position (borrower principal))
  (let (
      (price (unwrap-panic (load-price)))
      (collateral (default-to u0 (map-get? borrower-collateral borrower)))
      (debt (default-to u0 (map-get? borrower-debt borrower)))
      (borrow-limit (get-borrow-limit collateral price))
      (liquidation-limit (get-liquidation-limit collateral price))
      (health-factor (if (is-eq debt u0)
        u999999999
        (/ (* liquidation-limit precision) debt)
      ))
    )
    (ok {
      collateral: collateral,
      debt: debt,
      borrow-limit: borrow-limit,
      liquidation-limit: liquidation-limit,
      health-factor: health-factor,
    })
  )
)

(define-read-only (get-pool-state)
  (ok {
    initialized: (var-get initialized),
    paused: (var-get paused),
    asset-contract: (var-get asset-contract),
    total-shares: (var-get total-shares),
    total-liquid-assets: (var-get total-liquid-assets),
    total-debt: (var-get total-debt),
    total-assets: (total-assets),
    collateral-factor-bps: (var-get collateral-factor-bps),
    liquidation-threshold-bps: (var-get liquidation-threshold-bps),
    liquidation-bonus-bps: (var-get liquidation-bonus-bps),
    close-factor-bps: (var-get close-factor-bps),
    borrow-fee-bps: (var-get borrow-fee-bps),
  })
)

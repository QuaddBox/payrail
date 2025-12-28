
;; Payrail MVP Smart Contract
;; Handles business registration, organization management, and payroll execution.

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-REGISTERED (err u101))
(define-constant ERR-NOT-REGISTERED (err u102))
(define-constant ERR-ORG-ALREADY-EXISTS (err u103))
(define-constant ERR-INSUFFICIENT-FUNDS (err u104))
(define-constant ERR-INVALID-AMOUNT (err u105))
(define-constant ERR-LIST-MISMATCH (err u106))
(define-constant ERR-TRANSFER-FAILED (err u107))

;; Data Maps
(define-map businesses principal { registered: bool, org-id: (optional uint) })
(define-map organizations uint { owner: principal, name: (string-ascii 64) })
(define-map freelancer-registry principal { registered: bool })

;; Data Vars
(define-data-var last-org-id uint u0)

;; --- Read-Only Functions ---

(define-read-only (get-business-info (business principal))
  (map-get? businesses business)
)

(define-read-only (get-org-info (org-id uint))
  (map-get? organizations org-id)
)

(define-read-only (is-freelancer-registered (freelancer principal))
  (default-to false (get registered (map-get? freelancer-registry freelancer)))
)

;; --- Public Functions ---

;; Register a business wallet
(define-public (register-business)
  (let ((caller tx-sender))
    (asserts! (is-none (get-business-info caller)) ERR-ALREADY-REGISTERED)
    (ok (map-set businesses caller { registered: true, org-id: none }))
  )
)

;; Create an organization (one per business for MVP)
(define-public (create-organization (name (string-ascii 64)))
  (let (
    (caller tx-sender)
    (business (unwrap! (get-business-info caller) ERR-NOT-REGISTERED))
    (new-id (+ (var-get last-org-id) u1))
  )
    (asserts! (is-none (get org-id business)) ERR-ORG-ALREADY-EXISTS)
    
    (map-set organizations new-id { owner: caller, name: name })
    (map-set businesses caller { registered: true, org-id: (some new-id) })
    (var-set last-org-id new-id)
    (ok new-id)
  )
)

;; Register a freelancer (simple registry for MVP validation)
(define-public (register-freelancer)
  (ok (map-set freelancer-registry tx-sender { registered: true }))
)

;; Execute Payroll (STX Transfer)
(define-public (execute-payroll (recipient principal) (amount uint))
  (let (
    (caller tx-sender)
    (business (unwrap! (get-business-info caller) ERR-NOT-REGISTERED))
  )
    ;; 1. Check if caller owns an organization
    (asserts! (is-some (get org-id business)) ERR-NOT-AUTHORIZED)
    
    ;; 2. Validate amount
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; 3. Transfer STX
    (try! (stx-transfer? amount caller recipient))
    
    ;; 4. Emit Event
    (print { event: "payroll-payment", payer: caller, recipient: recipient, amount: amount })
    
    (ok true)
  )
)

;; --- Batch Payroll ---

;; Private helper: process a single payment in the batch
(define-private (process-single-payment 
  (entry {to: principal, ustx: uint}) 
  (prev-result (response bool uint)))
  (match prev-result
    success (stx-transfer? (get ustx entry) tx-sender (get to entry))
    error (err error)
  )
)

;; Execute Batch Payroll (up to 20 recipients in one transaction)
(define-public (execute-batch-payroll 
  (recipients (list 20 {to: principal, ustx: uint}))
  (period-ref (string-ascii 32)))
  (let (
    (caller tx-sender)
    (business (unwrap! (get-business-info caller) ERR-NOT-REGISTERED))
    (count (len recipients))
  )
    ;; 1. Verify caller owns an organization
    (asserts! (is-some (get org-id business)) ERR-NOT-AUTHORIZED)
    
    ;; 2. Verify list is not empty
    (asserts! (> count u0) ERR-INVALID-AMOUNT)
    
    ;; 3. Execute all transfers using fold (atomic - all or nothing)
    (try! (fold process-single-payment recipients (ok true)))
    
    ;; 4. Emit batch event
    (print { 
      event: "batch-payroll", 
      payer: caller, 
      recipient-count: count,
      period: period-ref 
    })
    
    (ok true)
  )
)


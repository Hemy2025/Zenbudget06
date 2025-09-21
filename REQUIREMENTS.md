# IoForfettario / ZenBudget06 – Product Requirements Document (PRD)

## 1. Introduzione
**IoForfettario** è un’app SaaS/mobile dedicata ai professionisti e piccoli imprenditori in regime forfettario in Italia.  
L’obiettivo è offrire una piattaforma **all-in-one** che semplifica la gestione fiscale e finanziaria: fatturazione elettronica, accantonamento automatico delle imposte, pagamento F24, e gestione abbonamenti degli utenti.

---

## 2. Obiettivi principali
- Permettere l’emissione e la ricezione di **fatture elettroniche** direttamente dall’app.  
- Fornire agli utenti un **conto corrente con IBAN italiano** integrato.  
- Implementare regole di **accantonamento automatico** della liquidità per il pagamento delle imposte.  
- Gestire il **pagamento degli F24 precompilati** via API.  
- Offrire un **modello di abbonamento SaaS** per monetizzare il servizio.  
- Garantire **compliance legale** (SdI, bollo, conservazione sostitutiva, PSD2, AML/KYC).

---

## 3. Attori
- **Utente finale (forfettario)** → utilizza l’app per emettere fatture, vedere il conto, gestire tasse.  
- **Backend IoForfettario** → logica centrale, orchestrazione API (Aruba, Fabrick, Stripe).  
- **Provider terzi**:
  - Aruba (fatturazione elettronica)  
  - Fabrick (IBAN, accantonamenti, F24)  
  - Stripe (abbonamenti SaaS)

---

## 4. Requisiti funzionali (FR)

### 4.1 Fatturazione elettronica (via Aruba)
- FR1: Creazione di fatture elettroniche XML FatturaPA 1.2.2.  
- FR2: Invio fattura tramite API Aruba.  
- FR3: Gestione notifiche SdI (consegna, scarto, rifiuto).  
- FR4: Conservazione sostitutiva automatica per 10 anni.  
- FR5: Emissione automatica **bollo virtuale** (> €77,47).

### 4.2 Conto corrente e accantonamenti (via Fabrick)
- FR6: Assegnazione di un **IBAN italiano** univoco a ciascun utente.  
- FR7: Visualizzazione saldo e movimenti in tempo reale.  
- FR8: Regole automatiche di accantonamento (es. 20% di ogni fattura).  
- FR9: Trasferimenti interni/sub-account dedicati al “conto imposte”.

### 4.3 Pagamenti F24 (via Fabrick)
- FR10: Importazione F24 precompilati (modello semplice).  
- FR11: Validazione F24 via API.  
- FR12: Pagamento F24 via API Fabrick.  
- FR13: Notifica esito pagamento F24 → aggiornamento dashboard.

### 4.4 Monetizzazione SaaS (via Stripe)
- FR14: Gestione abbonamenti (mensile/annuale).  
- FR15: Checkout tramite carta, Apple Pay, Google Pay.  
- FR16: Ricezione eventi Stripe via webhook (rinnovo, scadenza, cancellazione).  
- FR17: Emissione fattura elettronica verso cliente (integrazione Stripe ↔ Aruba).

### 4.5 Dashboard & UX
- FR18: Home con saldo conto, accantonamenti, fatture emesse/ricevute, scadenze fiscali.  
- FR19: Wizard emissione fattura (semplificato per forfettari: N2.2, bollo automatico).  
- FR20: Storico fatture (filtri: stato, cliente, periodo).  
- FR21: Storico F24 pagati / in attesa.  
- FR22: Notifiche push/email per scadenze (bollo, F24, abbonamento).

---

## 5. Requisiti non funzionali (NFR)
- **NFR1 – Sicurezza**: autenticazione JWT/OAuth2; webhook firmati (HMAC).  
- **NFR2 – Scalabilità**: supporto fino a 10.000 utenti attivi/mese (scaling orizzontale).  
- **NFR3 – Affidabilità**: retry policy per API esterne, idempotency per pagamenti.  
- **NFR4 – Privacy**: GDPR compliant, log minimizzati, dati fiscali crittografati at-rest e in-transit.  
- **NFR5 – Performance**: risposta API < 500ms per operazioni standard.  
- **NFR6 – Audit**: tracciamento invii, pagamenti, accessi.

---

## 6. User Stories (Agile)
- **US1**: Come utente forfettario, voglio creare una fattura elettronica dall’app in meno di 2 minuti, così posso fatturare senza commercialista.  
- **US2**: Come utente, voglio che una parte di ogni incasso venga messa da parte automaticamente, così non rischio di non avere soldi per le tasse.  
- **US3**: Come utente, voglio ricevere una notifica quando l’F24 è pronto e pagarlo con un click.  
- **US4**: Come admin IoForfettario, voglio monitorare lo stato di invio FE e F24 di ogni utente, per offrire supporto in caso di errori.  
- **US5**: Come utente, voglio sottoscrivere un abbonamento con carta, così posso accedere alle funzionalità premium.

---

## 7. Integrazioni esterne
- **Aruba**: invio FE, notifiche SdI, conservazione.  
- **Fabrick**: IBAN, movimenti, accantonamenti, pagamenti F24.  
- **Stripe**: abbonamenti e pagamenti.

---

## 8. Roadmap (sprint plan)
- **Sprint 1**: Setup repo + integrazione Aruba (FE base).  
- **Sprint 2**: Integrazione Fabrick (IBAN, saldo, accantonamenti).  
- **Sprint 3**: Integrazione F24 (creazione, validazione, pagamento).  
- **Sprint 4**: Stripe (abbonamenti, checkout, webhooks).  
- **Sprint 5**: Dashboard UX + notifiche push/email.  
- **Sprint 6**: Hardening sicurezza + testing E2E sandbox.

---

## 9. Rischi & mitigazioni
- **R1**: Ritardi integrazione API → mitigazione: test paralleli in sandbox.  
- **R2**: Complessità normativa F24 → mitigazione: partire con “F24 Simple”.  
- **R3**: Vendor lock-in (Aruba/Fabrick/Stripe) → mitigazione: astrazione via adapter nel backend.

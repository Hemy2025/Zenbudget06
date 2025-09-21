# IoForfettario / ZenBudget06 – System Architecture

## Overview
Questo documento descrive l’architettura logica di **IoForfettario (ZenBudget06)**, con integrazione di:
- **Aruba e-Invoicing** → emissione fatture elettroniche, notifiche SdI, conservazione sostitutiva.
- **Fabrick BaaS** → conti correnti con IBAN italiani, regole di accantonamento automatico per imposte, pagamento modelli F24 via API.
- **Stripe** → gestione abbonamenti SaaS e pagamenti utenti (Checkout, Subscription Billing).

---

## Diagramma architetturale

```mermaid
flowchart LR
  subgraph Client["Client (Web/Mobile App)"]
    UI["UI IoForfettario"]
  end

  subgraph Core["Backend IoForfettario"]
    API["REST/GraphQL API"]
    Rules["Business Rules\n• Regime forfettario (N2.2)\n• Calcolo bollo > €77,47\n• Accantonamento imposte"]
    Store["DB (utenti, fatture, movimenti, abbonamenti)"]
    Webhooks["Webhook Receiver"]
    Scheduler["Jobs/Workers"]
  end

  subgraph Aruba["Aruba e-Invoicing"]
    AInvio["POST /invoices"]
    ANotif["Webhook SdI → esiti"]
    ACons["Conservazione sostitutiva"]
  end

  subgraph Fabrick["Fabrick BaaS (IBAN IT, F24)"]
    FAcc["Conti & Movimenti (IBAN IT)"]
    FTransf["Accantonamento\n(sub-account)"]
    FF24["API F24 Simple"]
  end

  subgraph Stripe["Stripe (Billing/Checkout)"]
    SChk["Checkout / Payment Intents"]
    SSub["Billing / Subscriptions"]
    SWbh["Webhook events"]
  end

  UI --> API
  API --> Store
  API --> Rules

  %% Aruba
  API --> AInvio
  AInvio --> ANotif
  ANotif --> Webhooks
  ACons --> Store

  %% Fabrick
  API --> FAcc
  Rules --> FTransf
  FTransf --> FAcc
  API --> FF24
  FF24 --> Webhooks

  %% Stripe
  UI --> SChk
  API <-->|Manage Plans| SSub
  SWbh --> Webhooks

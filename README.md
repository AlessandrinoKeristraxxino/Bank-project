# ATM App

Una semplice applicazione web stile ATM per simulare operazioni bancarie base direttamente nel browser.

## Funzionalità

- Inserimento carta e sblocco con PIN
- Prelievi rapidi con importi predefiniti
- Depositi manuali
- Saldo disponibile aggiornato in tempo reale
- Storico delle transazioni recenti
- Salvataggio locale dei dati con `localStorage`

## Come avviare

1. Apri `index.html` nel browser.
2. Clicca su **Inserisci carta**.
3. Inserisci il PIN `1234`.
4. Usa i pulsanti per prelevare o depositare.

## Struttura del progetto

- `index.html` - struttura della pagina
- `styles/style.css` - stile grafico dell'interfaccia
- `script/script.js` - logica dell'ATM

## Note

- Il saldo iniziale è `€ 1.250,00`.
- I dati delle operazioni restano salvati nel browser finché non vengono cancellati i dati del sito.
- L'app è una simulazione frontend, non si collega a un backend bancario reale.

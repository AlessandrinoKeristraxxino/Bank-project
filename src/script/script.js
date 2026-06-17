const state = {
    isCardInserted: false,
    isUnlocked: false,
    balance: 1250,
    deposits: 0,
    withdrawals: 0,
    history: []
};

const correctPin = '1234';

const elements = {
    cardStatus: document.getElementById('card-status'),
    balanceValue: document.getElementById('balance-value'),
    depositTotal: document.getElementById('deposit-total'),
    withdrawTotal: document.getElementById('withdraw-total'),
    lastStatus: document.getElementById('last-status'),
    messageBox: document.getElementById('message-box'),
    transactionList: document.getElementById('transaction-list'),
    pinInput: document.getElementById('pin-input'),
    amountInput: document.getElementById('amount-input'),
    insertCardBtn: document.getElementById('insert-card-btn'),
    unlockBtn: document.getElementById('unlock-btn'),
    withdrawBtn: document.getElementById('withdraw-btn'),
    depositBtn: document.getElementById('deposit-btn'),
    resetBtn: document.getElementById('reset-btn'),
    quickButtons: document.querySelectorAll('.quick-btn')
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
}

function setMessage(text, type = 'info') {
    elements.messageBox.textContent = text;
    elements.messageBox.classList.remove('error', 'warning');

    if (type === 'error' || type === 'warning') {
        elements.messageBox.classList.add(type);
    }

    elements.lastStatus.textContent = text;
}

function saveState() {
    localStorage.setItem('atm-app-state', JSON.stringify({
        balance: state.balance,
        deposits: state.deposits,
        withdrawals: state.withdrawals,
        history: state.history
    }));
}

function loadState() {
    const rawState = localStorage.getItem('atm-app-state');

    if (!rawState) {
        return;
    }

    try {
        const savedState = JSON.parse(rawState);
        state.balance = Number(savedState.balance) || state.balance;
        state.deposits = Number(savedState.deposits) || 0;
        state.withdrawals = Number(savedState.withdrawals) || 0;
        state.history = Array.isArray(savedState.history) ? savedState.history : [];
    } catch {
        localStorage.removeItem('atm-app-state');
    }
}

function renderHistory() {
    elements.transactionList.innerHTML = '';

    if (state.history.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'Nessuna transazione ancora registrata.';
        elements.transactionList.appendChild(emptyItem);
        return;
    }

    state.history.slice(0, 6).forEach((entry) => {
        const item = document.createElement('li');
        const label = document.createElement('span');
        const time = document.createElement('time');

        label.textContent = entry.label;
        time.textContent = entry.time;

        item.append(label, time);
        elements.transactionList.appendChild(item);
    });
}

function render() {
    elements.balanceValue.textContent = formatCurrency(state.balance);
    elements.depositTotal.textContent = formatCurrency(state.deposits);
    elements.withdrawTotal.textContent = formatCurrency(state.withdrawals);
    elements.cardStatus.textContent = state.isCardInserted ? 'Carta inserita' : 'Carta non inserita';

    const unlocked = state.isCardInserted && state.isUnlocked;
    elements.pinInput.disabled = !state.isCardInserted;
    elements.amountInput.disabled = !unlocked;
    elements.unlockBtn.disabled = !state.isCardInserted;
    elements.withdrawBtn.disabled = !unlocked;
    elements.depositBtn.disabled = !unlocked;
    elements.quickButtons.forEach((button) => {
        button.disabled = !unlocked;
    });
    elements.resetBtn.disabled = !state.isCardInserted;

    renderHistory();
}

function recordTransaction(label) {
    state.history.unshift({
        label,
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    });

    if (state.history.length > 8) {
        state.history.length = 8;
    }

    saveState();
    renderHistory();
}

function getAmount() {
    const amount = Number(elements.amountInput.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        return null;
    }

    return Math.round(amount);
}

function requireUnlocked() {
    if (!state.isCardInserted) {
        setMessage('Inserisci la carta prima di procedere.', 'warning');
        return false;
    }

    if (!state.isUnlocked) {
        setMessage('Inserisci il PIN corretto per sbloccare l’ATM.', 'warning');
        return false;
    }

    return true;
}

function deposit(amount) {
    if (!requireUnlocked()) {
        return;
    }

    if (amount === null) {
        setMessage('Inserisci un importo valido.', 'error');
        return;
    }

    state.balance += amount;
    state.deposits += amount;
    recordTransaction(`Deposito di ${formatCurrency(amount)}`);
    setMessage(`Deposito completato: ${formatCurrency(amount)} aggiunti al saldo.`, 'info');
    saveState();
    render();
}

function withdraw(amount) {
    if (!requireUnlocked()) {
        return;
    }

    if (amount === null) {
        setMessage('Inserisci un importo valido.', 'error');
        return;
    }

    if (amount > state.balance) {
        setMessage('Saldo insufficiente per questo prelievo.', 'error');
        return;
    }

    state.balance -= amount;
    state.withdrawals += amount;
    recordTransaction(`Prelievo di ${formatCurrency(amount)}`);
    setMessage(`Prelievo completato: ${formatCurrency(amount)} ritirati.`, 'info');
    saveState();
    render();
}

elements.insertCardBtn.addEventListener('click', () => {
    state.isCardInserted = true;
    setMessage('Carta inserita. Inserisci il PIN per continuare.');
    render();
});

elements.unlockBtn.addEventListener('click', () => {
    if (!state.isCardInserted) {
        setMessage('Prima inserisci la carta.', 'warning');
        return;
    }

    if (elements.pinInput.value === correctPin) {
        state.isUnlocked = true;
        setMessage('PIN corretto. ATM sbloccato.');
        render();
        return;
    }

    state.isUnlocked = false;
    setMessage('PIN non valido.', 'error');
});

elements.withdrawBtn.addEventListener('click', () => {
    withdraw(getAmount());
});

elements.depositBtn.addEventListener('click', () => {
    deposit(getAmount());
});

elements.quickButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const amount = Number(button.dataset.amount);
        withdraw(amount);
    });
});

elements.resetBtn.addEventListener('click', () => {
    state.isCardInserted = false;
    state.isUnlocked = false;
    elements.pinInput.value = '';
    elements.amountInput.value = '';
    setMessage('Carta rimossa. Sessione bloccata.');
    render();
});

elements.pinInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        elements.unlockBtn.click();
    }
});

elements.amountInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        elements.withdrawBtn.click();
    }
});

loadState();
render();
setMessage('Benvenuto nell’ATM app. Inserisci la carta per iniziare.');

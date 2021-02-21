const Modal = {
    //editable: document.querySelector('#form'),
    open() {
        // Abrir modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        // fechar o modal
        // remover a class active do modal
        document.querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
   //editableIndex: '',
    //editableID: '',

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    edit(id) {
        const index = Transaction.all.transactions.findIndex(
          (transactionIn) => transactionIn.id === id
        )
    
        const transaction = Transaction.all.transactions[index]
        transaction.date = transaction.date.split('/').reverse().join('-')
    
        Transaction.editableIndex = index
        Transaction.editableID = id
    
        Modal.title.innerText = 'Editar Transação'
        Modal.editable.setAttribute('data-editable', 'true')
        Form.setValues(transaction)
        Form.plotsDisabled()
    
        Modal.toggle('transaction')
      },

    incomes() {
        // somar as entradas
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        // somar as saidas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        // entradas - saidas

        return Transaction.incomes() + Transaction.expenses();
    },
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction , index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
        <tr>
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick='Transaction.remove(${index})' src="./assets/minus.svg" alt="remover transação">
        </td>
        <td>
            <i onclick='Transaction.edit('${index}')' class="fas fa-pencil-alt fa-2x"></i>
        </td>
    </tr>`
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {

    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },


    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatData() {

    },

    validateFields() {
        const {
            description,
            amount,
            date
        } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let {
            description,
            amount,
            date
        } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()


        try {
            //verificar se todas informaçoes foram preenchidas
            Form.validateFields()

            //formatar os dados para salvar
            const transaction = Form.formatValues()

            //salvar de fato
            Form.saveTransaction(transaction)

            //apagar os dados do formulario
            Form.clearFields()

            //modal feche
            Modal.close()


        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {

        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}


// theme switcher             
const themeSwitcher = document.getElementById("theme-switch");

themeSwitcher.checked = false;
function clickHandler() {
    if (this.checked) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.add("light");
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
    totalImg()
    totalLightbackground()
}
themeSwitcher.addEventListener("click", clickHandler);


function checkTheme() {
    const localStorageTheme = localStorage.getItem("theme");

    if (localStorageTheme !== null && localStorageTheme === "dark") {
        // set the theme of body
        document.body.className = localStorageTheme;

        // adjust the slider position
        const themeSwitch = document.getElementById("theme-switch");
        themeSwitch.checked = true;
    }
}
App.init()
// Enhanced main.js with additional desktop features
class DaybookApp {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('daybook_entries')) || [];
        this.categories = JSON.parse(localStorage.getItem('daybook_categories')) || {
            income: ['Salary', 'Freelance', 'Business', 'Investment', 'Other'],
            expense: ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Other']
        };
        this.accounts = JSON.parse(localStorage.getItem('daybook_accounts')) || [];
        this.currentSection = 'dashboard';
        this.currentEntryType = 'income';
        this.currentEditId = null;
        this.currentCategoryType = 'income';
        this.currentAccountType = 'receivable';
        this.currentEditAccountId = null;
        
        this.init();
        this.setupElectronIntegration();
        
        // Initialize export manager after ensuring the class is loaded
        this.initializeExportManager();
    }

    setupElectronIntegration() {
        // Check if running in Electron
        if (window.electronAPI) {
            // Handle menu events
            window.electronAPI.onMenuNewEntry(() => {
                this.showSection('add-entry');
            });

            window.electronAPI.onMenuNavigate((event, section) => {
                this.showSection(section);
            });

            window.electronAPI.onMenuAbout(async () => {
                const version = await window.electronAPI.getAppVersion();
                await window.electronAPI.showMessageBox({
                    type: 'info',
                    title: 'About Daybook Desktop',
                    message: `Daybook Desktop v${version}`,
                    detail: 'A comprehensive financial records management application.\n\nBuilt with Electron, HTML, CSS, and JavaScript.'
                });
            });

            // Add keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'n':
                            e.preventDefault();
                            this.showSection('add-entry');
                            break;
                        case '1':
                            e.preventDefault();
                            this.showSection('dashboard');
                            break;
                        case '2':
                            e.preventDefault();
                            this.showSection('income');
                            break;
                        case '3':
                            e.preventDefault();
                            this.showSection('expense');
                            break;
                        case '4':
                            e.preventDefault();
                            this.showSection('ledger');
                            break;
                    }
                }
            });
        }
    }

    // Override the existing alert method to use Electron's dialog
    async showAlert(message, type = 'info') {
        if (window.electronAPI) {
            await window.electronAPI.showMessageBox({
                type: type,
                title: 'Daybook Desktop',
                message: message
            });
        } else {
            alert(message);
        }
    }

    async addEntry() {
        const date = document.getElementById('entry-date').value;
        const category = document.getElementById('entry-category').value;
        const amount = parseFloat(document.getElementById('entry-amount').value);
        const description = document.getElementById('entry-description').value;

        if (!date || !category || !amount) {
            await this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const entry = {
            id: Date.now(),
            date,
            type: this.currentEntryType,
            category,
            amount,
            description
        };

        this.entries.push(entry);
        this.saveEntries();
        this.updateDashboard();
        this.renderIncome();
        this.renderExpense();
        this.renderLedger();

        // Reset form
        document.getElementById('entry-form').reset();
        document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];

        await this.showAlert('Entry added successfully!', 'info');
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.updateCurrentDate();
        this.populateCategories();
        this.updateDashboard();
        this.renderIncome();
        this.renderExpense();
        this.renderLedger();
        this.renderCategories();
        this.renderAccounts();
        this.startAutoBackup();
    }

    // Initialize export manager with proper error handling
    initializeExportManager() {
        console.log('Attempting to initialize ExportManager...');
        console.log('window.ExportManager available:', typeof window.ExportManager !== 'undefined');
        
        if (typeof window.ExportManager !== 'undefined') {
            try {
                this.exportManager = new window.ExportManager(this);
                console.log('ExportManager initialized successfully');
            } catch (error) {
                console.error('Error initializing ExportManager:', error);
                this.exportManager = null;
            }
        } else {
            console.log('ExportManager not available, retrying in 100ms...');
            // Retry after a short delay if ExportManager is not yet loaded
            setTimeout(() => {
                this.initializeExportManager();
            }, 100);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Entry type toggle
        document.getElementById('income-toggle').addEventListener('click', () => {
            this.setEntryType('income');
        });

        document.getElementById('expense-toggle').addEventListener('click', () => {
            this.setEntryType('expense');
        });

        // Forms
        document.getElementById('entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEntry();
        });

        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateEntry();
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });

        // Filters
        document.getElementById('income-date-filter').addEventListener('change', () => {
            this.renderIncome();
        });

        document.getElementById('income-category-filter').addEventListener('change', () => {
            this.renderIncome();
        });

        document.getElementById('expense-date-filter').addEventListener('change', () => {
            this.renderExpense();
        });

        document.getElementById('expense-category-filter').addEventListener('change', () => {
            this.renderExpense();
        });

        document.getElementById('ledger-date-from').addEventListener('change', () => {
            this.renderLedger();
        });

        document.getElementById('ledger-date-to').addEventListener('change', () => {
            this.renderLedger();
        });

        // Profit & Loss
        document.getElementById('generate-pl').addEventListener('click', () => {
            this.generateProfitLoss();
        });

        document.getElementById('export-pdf').addEventListener('click', () => {
            this.exportPDF();
        });

        document.getElementById('export-excel').addEventListener('click', () => {
            this.exportExcel();
        });

        // Backup buttons
        document.getElementById('export-backup').addEventListener('click', () => {
            this.exportBackup();
        });

        document.getElementById('import-backup').addEventListener('click', () => {
            this.importBackup();
        });

        // Categories
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.showCategoryModal();
        });

        document.getElementById('income-categories-tab').addEventListener('click', () => {
            this.setCategoryType('income');
        });

        document.getElementById('expense-categories-tab').addEventListener('click', () => {
            this.setCategoryType('expense');
        });

        // Accounts
        document.getElementById('add-account-btn').addEventListener('click', () => {
            this.showAccountModal();
        });

        document.getElementById('receivables-tab').addEventListener('click', () => {
            this.setAccountType('receivable');
        });

        document.getElementById('payables-tab').addEventListener('click', () => {
            this.setAccountType('payable');
        });

        document.getElementById('account-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAccount();
        });

        document.getElementById('payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.recordPayment();
        });

        // Account filters
        document.getElementById('account-search').addEventListener('input', () => {
            this.renderAccounts();
        });

        document.getElementById('account-status-filter').addEventListener('change', () => {
            this.renderAccounts();
        });

        // Modals
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => {
                this.hideModals();
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModals();
            }
        });

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entry-date').value = today;
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show selected section
        document.getElementById(section).classList.add('active');

        // Update nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        this.currentSection = section;
    }

    updateCurrentDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);
    }

    setEntryType(type) {
        this.currentEntryType = type;
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${type}-toggle`).classList.add('active');
        
        // Update category dropdown
        this.populateEntryCategories();
    }

    populateCategories() {
        this.populateEntryCategories();
        this.populateFilterCategories();
    }

    populateEntryCategories() {
        const categorySelect = document.getElementById('entry-category');
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        this.categories[this.currentEntryType].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    populateFilterCategories() {
        // Income filter
        const incomeFilter = document.getElementById('income-category-filter');
        incomeFilter.innerHTML = '<option value="">All Categories</option>';
        this.categories.income.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            incomeFilter.appendChild(option);
        });

        // Expense filter
        const expenseFilter = document.getElementById('expense-category-filter');
        expenseFilter.innerHTML = '<option value="">All Categories</option>';
        this.categories.expense.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            expenseFilter.appendChild(option);
        });
    }

    editEntry(id) {
        const entry = this.entries.find(e => e.id === id);
        if (!entry) return;

        this.currentEditId = id;
        
        document.getElementById('edit-date').value = entry.date;
        document.getElementById('edit-amount').value = entry.amount;
        document.getElementById('edit-description').value = entry.description;
        
        // Populate categories for edit
        const editCategorySelect = document.getElementById('edit-category');
        editCategorySelect.innerHTML = '<option value="">Select Category</option>';
        this.categories[entry.type].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            if (category === entry.category) option.selected = true;
            editCategorySelect.appendChild(option);
        });

        document.getElementById('edit-modal').style.display = 'block';
    }

    async updateEntry() {
        const entry = this.entries.find(e => e.id === this.currentEditId);
        if (!entry) return;

        entry.date = document.getElementById('edit-date').value;
        entry.category = document.getElementById('edit-category').value;
        entry.amount = parseFloat(document.getElementById('edit-amount').value);
        entry.description = document.getElementById('edit-description').value;

        this.saveEntries();
        this.updateDashboard();
        this.renderIncome();
        this.renderExpense();
        this.renderLedger();
        this.hideModals();

        await this.showAlert('Entry updated successfully!', 'info');
    }

    async deleteEntry(id) {
        const result = window.electronAPI ? 
            await window.electronAPI.showMessageBox({
                type: 'question',
                title: 'Confirm Delete',
                message: 'Are you sure you want to delete this entry?',
                buttons: ['Yes', 'No'],
                defaultId: 1
            }) : 
            { response: confirm('Are you sure you want to delete this entry?') ? 0 : 1 };

        if (result.response === 0) {
            this.entries = this.entries.filter(e => e.id !== id);
            this.saveEntries();
            this.updateDashboard();
            this.renderIncome();
            this.renderExpense();
            this.renderLedger();
        }
    }

    formatCurrency(amount) {
        return `₨ ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }

    getTodayEntries() {
        const today = new Date().toISOString().split('T')[0];
        return this.entries.filter(entry => entry.date === today);
    }

    updateDashboard() {
        const todayEntries = this.getTodayEntries();
        
        const todayIncome = todayEntries
            .filter(e => e.type === 'income')
            .reduce((sum, e) => sum + e.amount, 0);
        
        const todayExpense = todayEntries
            .filter(e => e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0);
        
        const netBalance = todayIncome - todayExpense;

        document.getElementById('today-income').textContent = this.formatCurrency(todayIncome);
        document.getElementById('today-expense').textContent = this.formatCurrency(todayExpense);
        document.getElementById('net-balance').textContent = this.formatCurrency(netBalance);

        // Update net balance color
        const netBalanceElement = document.getElementById('net-balance');
        if (netBalance > 0) {
            netBalanceElement.style.color = '#27ae60';
        } else if (netBalance < 0) {
            netBalanceElement.style.color = '#e74c3c';
        } else {
            netBalanceElement.style.color = '#3498db';
        }

        this.renderRecentTransactions();
    }

    renderRecentTransactions() {
        const recentEntries = this.entries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recent-transactions');
        container.innerHTML = '';

        if (recentEntries.length === 0) {
            container.innerHTML = '<p>No transactions found.</p>';
            return;
        }

        recentEntries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            item.innerHTML = `
                <div class="transaction-info">
                    <h4>${entry.category}</h4>
                    <p>${entry.date} • ${entry.description || 'No description'}</p>
                </div>
                <div class="transaction-amount ${entry.type}">
                    ${entry.type === 'income' ? '+' : '-'}${this.formatCurrency(entry.amount)}
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderIncome() {
        const dateFilter = document.getElementById('income-date-filter').value;
        const categoryFilter = document.getElementById('income-category-filter').value;
        
        let filteredEntries = this.entries.filter(e => e.type === 'income');
        
        if (dateFilter) {
            filteredEntries = filteredEntries.filter(e => e.date === dateFilter);
        }
        
        if (categoryFilter) {
            filteredEntries = filteredEntries.filter(e => e.category === categoryFilter);
        }

        const tbody = document.getElementById('income-table-body');
        tbody.innerHTML = '';

        filteredEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.category}</td>
                <td>${this.formatCurrency(entry.amount)}</td>
                <td>${entry.description || '-'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="window.app.editEntry(${entry.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="window.app.deleteEntry(${entry.id})">Delete</button>
lete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderExpense() {
        const dateFilter = document.getElementById('expense-date-filter').value;
        const categoryFilter = document.getElementById('expense-category-filter').value;
        
        let filteredEntries = this.entries.filter(e => e.type === 'expense');
        
        if (dateFilter) {
            filteredEntries = filteredEntries.filter(e => e.date === dateFilter);
        }
        
        if (categoryFilter) {
            filteredEntries = filteredEntries.filter(e => e.category === categoryFilter);
        }

        const tbody = document.getElementById('expense-table-body');
        tbody.innerHTML = '';

        filteredEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.category}</td>
                <td>${this.formatCurrency(entry.amount)}</td>
                <td>${entry.description || '-'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="window.app.editEntry(${entry.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="window.app.deleteEntry(${entry.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderLedger() {
        const dateFrom = document.getElementById('ledger-date-from').value;
        const dateTo = document.getElementById('ledger-date-to').value;
        
        let filteredEntries = [...this.entries];
        
        if (dateFrom) {
            filteredEntries = filteredEntries.filter(e => e.date >= dateFrom);
        }
        
        if (dateTo) {
            filteredEntries = filteredEntries.filter(e => e.date <= dateTo);
        }

        // Sort by date
        filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

        const tbody = document.getElementById('ledger-table-body');
        tbody.innerHTML = '';

        let runningBalance = 0;

        filteredEntries.forEach(entry => {
            if (entry.type === 'income') {
                runningBalance += entry.amount;
            } else {
                runningBalance -= entry.amount;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td><span class="type-indicator ${entry.type}">${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span></td>
                <td>${entry.category}</td>
                <td>${this.formatCurrency(entry.amount)}</td>
                <td style="color: ${runningBalance >= 0 ? '#27ae60' : '#e74c3c'}">${this.formatCurrency(runningBalance)}</td>
                <td>${entry.description || '-'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="window.app.editEntry(${entry.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="window.app.deleteEntry(${entry.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

async addAccount() {
        const date = document.getElementById('account-date').value;
        const type = document.getElementById('account-type').value;
        const party = document.getElementById('account-party').value.trim();
        const amount = parseFloat(document.getElementById('account-amount').value);
        const description = document.getElementById('account-description').value;
        const dueDate = document.getElementById('account-due-date').value;
        
        if (!date || !party || !amount) {
            await this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const accountEntry = {
            id: Date.now(),
            date,
            type,
            party,
            amount,
            description,
            dueDate,
            paidAmount: 0
        };

        this.accounts.push(accountEntry);
        this.saveAccounts();
        this.renderAccounts();
        this.hideModals();

        await this.showAlert('Account entry added successfully!', 'info');
    }

    setAccountType(type) {
        this.currentAccountType = type;
        
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${type}s-tab`).classList.add('active');

        this.renderAccounts();
    }

    async recordPayment() {
        const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
        const accountEntry = this.accounts.find(a => a.id === this.currentEditAccountId);

        if (!accountEntry || paymentAmount <= 0 || paymentAmount > (accountEntry.amount - accountEntry.paidAmount)) {
            await this.showAlert('Invalid payment amount', 'error');
            return;
        }

        // Update paid amount
        accountEntry.paidAmount += paymentAmount;
        this.saveAccounts();
        this.renderAccounts();
        this.hideModals();

        await this.showAlert('Payment recorded successfully!', 'info');
    }

    renderAccounts() {
        const searchQuery = document.getElementById('account-search').value.toLowerCase();
        const statusFilter = document.getElementById('account-status-filter').value;

        const filteredAccounts = this.accounts.filter(account => {
            const matchType = account.type === this.currentAccountType;
            const matchSearch = account.party.toLowerCase().includes(searchQuery) || account.description.toLowerCase().includes(searchQuery);
            const matchStatus = !statusFilter || (statusFilter === 'pending' && account.paidAmount === 0)            || (statusFilter === 'partial' && account.paidAmount > 0 && account.paidAmount < account.amount)            || (statusFilter === 'paid' && account.paidAmount >= account.amount);
            return matchType && matchSearch && matchStatus;
        });

        const tbody = document.getElementById('accounts-table-body');
        tbody.innerHTML = '';

        filteredAccounts.forEach(account => {
            const balance = account.amount - account.paidAmount;
            const status = balance === 0 ? 'Paid' : (account.paidAmount === 0 ? 'Pending' : 'Partially Paid');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.date}</td>
                <td>${account.party}</td>
                <td>${account.description || '-'}</td>
                <td>${this.formatCurrency(account.amount)}</td>
                <td>${this.formatCurrency(account.paidAmount)}</td>
                <td>${this.formatCurrency(balance)}</td>
                <td>${status}</td>
                <td>${account.dueDate || '-'}</td>
                <td>
                    <button class="action-btn payment-btn" onclick="window.app.showPaymentModal(${account.id})">Record Payment</button>
                    <button class="action-btn edit-btn" onclick="window.app.editAccount(${account.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="window.app.deleteAccount(${account.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updateAccountSummary();
    }

    updateAccountSummary() {
        const totalReceivables = this.accounts.filter(a => a.type === 'receivable').reduce((sum, a) => sum + a.amount - a.paidAmount, 0);
        const totalPayables = this.accounts.filter(a => a.type === 'payable').reduce((sum, a) => sum + a.amount - a.paidAmount, 0);
        const netPosition = totalReceivables - totalPayables;

        document.getElementById('total-receivables').textContent = this.formatCurrency(totalReceivables);
        document.getElementById('total-payables').textContent = this.formatCurrency(totalPayables);
        document.getElementById('net-account-position').textContent = this.formatCurrency(netPosition);
    }

    showAccountModal() {
        document.getElementById('account-modal-title').textContent = 'Add Account Entry';
        document.getElementById('account-form').reset();
        this.currentEditAccountId = null;
        document.getElementById('account-modal').style.display = 'block';
    }

    showPaymentModal(accountId) {
        const accountEntry = this.accounts.find(a => a.id === accountId);
        if (!accountEntry) return;

        this.currentEditAccountId = accountId;
        document.getElementById('payment-party').textContent = accountEntry.party;
        document.getElementById('payment-original').textContent = this.formatCurrency(accountEntry.amount);
        document.getElementById('payment-already-paid').textContent = this.formatCurrency(accountEntry.paidAmount);
        document.getElementById('payment-balance').textContent = this.formatCurrency(accountEntry.amount - accountEntry.paidAmount);
        document.getElementById('payment-form').reset();

        document.getElementById('payment-modal').style.display = 'block';
    }

    editAccount(accountId) {
        const accountEntry = this.accounts.find(a => a.id === accountId);
        if (!accountEntry) return;

        this.currentEditAccountId = accountId;
        document.getElementById('account-date').value = accountEntry.date;
        document.getElementById('account-type').value = accountEntry.type;
        document.getElementById('account-party').value = accountEntry.party;
        document.getElementById('account-amount').value = accountEntry.amount;
        document.getElementById('account-description').value = accountEntry.description;
        document.getElementById('account-due-date').value = accountEntry.dueDate || '';

        document.getElementById('account-modal-title').textContent = 'Edit Account Entry';
        document.getElementById('account-modal').style.display = 'block';
    }

    async deleteAccount(accountId) {
        const result = window.electronAPI ? 
            await window.electronAPI.showMessageBox({
                type: 'question',
                title: 'Confirm Delete',
                message: 'Are you sure you want to delete this account entry?',
                buttons: ['Yes', 'No'],
                defaultId: 1
            }) : 
            { response: confirm('Are you sure you want to delete this account entry?') ? 0 : 1 };

        if (result.response === 0) {
            this.accounts = this.accounts.filter(a => a.id !== accountId);
            this.saveAccounts();
            this.renderAccounts();
        }
    }

    saveAccounts() {
        localStorage.setItem('daybook_accounts', JSON.stringify(this.accounts));
    }

    async generateProfitLoss() {
        const dateFrom = document.getElementById('pl-date-from').value;
        const dateTo = document.getElementById('pl-date-to').value;
        
        if (!dateFrom || !dateTo) {
            await this.showAlert('Please select both from and to dates', 'warning');
            return;
        }

        let filteredEntries = this.entries.filter(e => 
            e.date >= dateFrom && e.date <= dateTo
        );

        const totalIncome = filteredEntries
            .filter(e => e.type === 'income')
            .reduce((sum, e) => sum + e.amount, 0);

        const totalExpenses = filteredEntries
            .filter(e => e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0);

        const netProfitLoss = totalIncome - totalExpenses;

        document.getElementById('total-income').textContent = this.formatCurrency(totalIncome);
        document.getElementById('total-expenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('net-profit-loss').textContent = this.formatCurrency(netProfitLoss);

        // Update net profit/loss color
        const netElement = document.getElementById('net-profit-loss');
        if (netProfitLoss > 0) {
            netElement.style.color = '#27ae60';
        } else if (netProfitLoss < 0) {
            netElement.style.color = '#e74c3c';
        } else {
            netElement.style.color = '#3498db';
        }
    }

    async exportPDF() {
        console.log('exportPDF called, exportManager:', this.exportManager);
        if (this.exportManager) {
            try {
                await this.exportManager.exportToPDF();
            } catch (error) {
                console.error('PDF export error:', error);
                await this.showAlert('Error exporting PDF: ' + error.message, 'error');
            }
        } else {
            console.error('Export manager not initialized');
            // Try to initialize again
            this.initializeExportManager();
            await this.showAlert('Export manager not initialized. Please try again in a moment.', 'error');
        }
    }

    async exportExcel() {
        console.log('exportExcel called, exportManager:', this.exportManager);
        if (this.exportManager) {
            try {
                await this.exportManager.exportToExcel();
            } catch (error) {
                console.error('Excel export error:', error);
                await this.showAlert('Error exporting Excel: ' + error.message, 'error');
            }
        } else {
            console.error('Export manager not initialized');
            // Try to initialize again
            this.initializeExportManager();
            await this.showAlert('Export manager not initialized. Please try again in a moment.', 'error');
        }
    }

    // Backup functionality
    async exportBackup() {
        const backupData = {
            entries: this.entries,
            categories: this.categories,
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            appName: 'Daybook Desktop'
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        if (window.electronAPI) {
            // Use Electron's file save dialog
            const filePath = await window.electronAPI.showSaveDialog({
                title: 'Save Backup',
                defaultPath: `daybook_backup_${new Date().toISOString().split('T')[0]}.json`,
                filters: [{ name: 'JSON Files', extensions: ['json'] }]
            });
            
            if (filePath) {
                await window.electronAPI.saveFile(filePath, dataStr);
                await this.showAlert('Backup saved successfully!', 'info');
            }
        } else {
            // Fallback for web version
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `daybook_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            await this.showAlert('Backup downloaded successfully!', 'info');
        }
    }

    async importBackup() {
        if (window.electronAPI) {
            const filePath = await window.electronAPI.showOpenDialog({
                title: 'Select Backup File',
                filters: [{ name: 'JSON Files', extensions: ['json'] }],
                properties: ['openFile']
            });
            
            if (filePath && filePath.length > 0) {
                try {
                    const data = await window.electronAPI.readFile(filePath[0]);
                    await this.processBackupData(JSON.parse(data));
                } catch (error) {
                    await this.showAlert('Error reading backup file: ' + error.message, 'error');
                }
            }
        } else {
            // Fallback for web version
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const text = await file.text();
                        await this.processBackupData(JSON.parse(text));
                    } catch (error) {
                        await this.showAlert('Error reading backup file: ' + error.message, 'error');
                    }
                }
            };
            input.click();
        }
    }

    async processBackupData(backupData) {
        if (!backupData.entries || !backupData.categories) {
            await this.showAlert('Invalid backup file format', 'error');
            return;
        }

        const result = window.electronAPI ? 
            await window.electronAPI.showMessageBox({
                type: 'question',
                title: 'Import Backup',
                message: 'This will replace all current data. Continue?',
                buttons: ['Yes', 'No'],
                defaultId: 1
            }) : 
            { response: confirm('This will replace all current data. Continue?') ? 0 : 1 };

        if (result.response === 0) {
            this.entries = backupData.entries || [];
            this.categories = backupData.categories || {
                income: ['Salary', 'Freelance', 'Business', 'Investment', 'Other'],
                expense: ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Other']
            };
            
            this.saveEntries();
            this.saveCategories();
            this.populateCategories();
            this.updateDashboard();
            this.renderIncome();
            this.renderExpense();
            this.renderLedger();
            this.renderCategories();
            
            await this.showAlert(`Backup imported successfully! Restored ${this.entries.length} entries.`, 'info');
        }
    }

    // Auto backup functionality
    startAutoBackup() {
        // Create auto backup every 24 hours
        setInterval(() => {
            this.createAutoBackup();
        }, 24 * 60 * 60 * 1000); // 24 hours
        
        // Create backup on app close
        window.addEventListener('beforeunload', () => {
            this.createAutoBackup();
        });
    }

    async createAutoBackup() {
        try {
            const backupData = {
                entries: this.entries,
                categories: this.categories,
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                appName: 'Daybook Desktop',
                autoBackup: true
            };

            if (window.electronAPI) {
                await window.electronAPI.createAutoBackup(JSON.stringify(backupData, null, 2));
            } else {
                // Store in localStorage as fallback
                localStorage.setItem('daybook_auto_backup', JSON.stringify(backupData));
            }
        } catch (error) {
            console.error('Auto backup failed:', error);
        }
    }

    setCategoryType(type) {
        this.currentCategoryType = type;
        
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${type}-categories-tab`).classList.add('active');
        
        this.renderCategories();
    }

    renderCategories() {
        const container = document.getElementById('categories-list');
        container.innerHTML = '';

        this.categories[this.currentCategoryType].forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <div class="category-info">
                    <h4>${category}</h4>
                    <span class="category-type ${this.currentCategoryType}">${this.currentCategoryType.charAt(0).toUpperCase() + this.currentCategoryType.slice(1)}</span>
                </div>
                <div class="category-actions">
                    <button class="action-btn delete-btn" onclick="window.app.deleteCategory('${category}')">Delete</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    showCategoryModal() {
        document.getElementById('category-type').value = this.currentCategoryType;
        document.getElementById('category-modal').style.display = 'block';
    }

    async addCategory() {
        const name = document.getElementById('category-name').value.trim();
        const type = document.getElementById('category-type').value;

        if (!name) {
            await this.showAlert('Please enter a category name', 'warning');
            return;
        }

        if (this.categories[type].includes(name)) {
            await this.showAlert('Category already exists', 'warning');
            return;
        }

        this.categories[type].push(name);
        this.saveCategories();
        this.populateCategories();
        this.renderCategories();
        this.hideModals();
        document.getElementById('category-form').reset();

        await this.showAlert('Category added successfully!', 'info');
    }

    async deleteCategory(category) {
        const result = window.electronAPI ? 
            await window.electronAPI.showMessageBox({
                type: 'question',
                title: 'Confirm Delete',
                message: `Are you sure you want to delete the category "${category}"?`,
                buttons: ['Yes', 'No'],
                defaultId: 1
            }) : 
            { response: confirm(`Are you sure you want to delete the category "${category}"?`) ? 0 : 1 };

        if (result.response === 0) {
            this.categories[this.currentCategoryType] = this.categories[this.currentCategoryType].filter(c => c !== category);
            this.saveCategories();
            this.populateCategories();
            this.renderCategories();
        }
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    saveEntries() {
        localStorage.setItem('daybook_entries', JSON.stringify(this.entries));
    }

    saveCategories() {
        localStorage.setItem('daybook_categories', JSON.stringify(this.categories));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    window.app = new DaybookApp();
});

// ===========================
// Authentication Check
// ===========================
const isLoggedIn = localStorage.getItem('treasureFortuneLoggedIn');
if (!isLoggedIn) {
    window.location.href = 'login.html';
}

// ===========================
// App State Management
// ===========================
class AppState {
    constructor() {
        this.loadState();
    }

    loadState() {
        const savedState = localStorage.getItem('treasureFortuneState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.user = state.user || { name: 'User', email: '' };
            this.wallet = state.wallet || 0;
            this.savings = state.savings || 0;
            this.loan = state.loan || { amount: 0, paid: 0 };
            this.transactions = state.transactions || [];
            this.notifications = state.notifications || [];
        } else {
            // Initialize with default data
            this.user = { name: 'Fatima Ahmed', email: 'fatima@example.com' };
            this.wallet = 50000;
            this.savings = 1250000;
            this.loan = { amount: 500000, paid: 125000 };
            this.transactions = [
                { id: 1, type: 'savings', amount: 50000, date: '2026-04-10', description: 'Savings Deposit' },
                { id: 2, type: 'payment', amount: -83333, date: '2026-04-05', description: 'Loan Payment' },
                { id: 3, type: 'savings', amount: 100000, date: '2026-04-01', description: 'Savings Deposit' }
            ];
            this.notifications = [
                { id: 1, type: 'warning', title: 'Payment Due Soon', message: 'Your next loan payment is due in 5 days', time: '2 hours ago' },
                { id: 2, type: 'success', title: 'Savings Added', message: 'You successfully added ₦50,000 to your savings', time: '1 day ago' }
            ];
            this.saveState();
        }
    }

    saveState() {
        const state = {
            user: this.user,
            wallet: this.wallet,
            savings: this.savings,
            loan: this.loan,
            transactions: this.transactions,
            notifications: this.notifications
        };
        localStorage.setItem('treasureFortuneState', JSON.stringify(state));
    }

    addSavings(amount) {
        this.savings += amount;
        this.addTransaction('savings', amount, 'Savings Deposit');
        this.addNotification('success', 'Savings Added', `You successfully added ₦${amount.toLocaleString()} to your savings`);
        this.saveState();
    }

    makePayment(amount) {
        if (amount > this.loan.amount - this.loan.paid) {
            amount = this.loan.amount - this.loan.paid;
        }
        this.loan.paid += amount;
        this.addTransaction('payment', -amount, 'Loan Payment');
        
        // Check if loan is fully repaid
        if (this.loan.paid >= this.loan.amount) {
            this.handleLoanCompletion();
        } else {
            this.addNotification('success', 'Payment Successful', `You paid ₦${amount.toLocaleString()} towards your loan`);
        }
        
        this.saveState();
    }
    
    handleLoanCompletion() {
        // Clear the active loan data (keep transactions intact)
        this.loan = { amount: 0, paid: 0 };
        
        // Save the cleared state
        this.saveState();
        
        // The UI will be updated by the caller
    }

    addTransaction(type, amount, description) {
        const transaction = {
            id: Date.now(),
            type,
            amount,
            date: new Date().toISOString().split('T')[0],
            description,
            status: 'successful'
        };
        this.transactions.unshift(transaction);
        this.saveState();
    }

    addNotification(type, title, message) {
        const notification = {
            id: Date.now(),
            type,
            title,
            message,
            time: 'Just now'
        };
        this.notifications.unshift(notification);
        this.saveState();
    }

    updateUser(name, email) {
        this.user.name = name;
        this.user.email = email;
        this.saveState();
    }

    clearNotifications() {
        this.notifications = [];
        this.saveState();
    }

    sendMoney(recipient, amount) {
        if (amount > this.savings) {
            return false;
        }
        this.savings -= amount;
        this.addTransaction('transfer', -amount, `Transfer to ${recipient}`);
        this.addNotification('success', 'Transfer Successful', `You sent ₦${amount.toLocaleString()} to ${recipient}`);
        this.saveState();
        return true;
    }

    getLoanRemaining() {
        return this.loan.amount - this.loan.paid;
    }

    getLoanProgress() {
        if (this.loan.amount === 0) return 0;
        return Math.round((this.loan.paid / this.loan.amount) * 100);
    }
}

// ===========================
// UI Controller
// ===========================
class UIController {
    constructor(appState) {
        this.appState = appState;
        this.currentPage = 'dashboard';
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
    }

    initializeElements() {
        // Navigation
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('mainContent');
        
        // User profile
        this.userProfile = document.getElementById('userProfile');
        this.profileDropdown = document.getElementById('profileDropdown');
        this.displayUserName = document.getElementById('displayUserName');
        this.userName = document.getElementById('userName');
        this.userAvatar = document.getElementById('userAvatar');
        
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        
        // Notifications
        this.notificationIcon = document.getElementById('notificationIcon');
        this.notificationBadge = document.getElementById('notificationBadge');
        
        // Modal
        this.modal = document.getElementById('actionModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalLabel = document.getElementById('modalLabel');
        this.modalInput = document.getElementById('modalInput');
        this.modalSubmit = document.getElementById('modalSubmit');
        this.modalCancel = document.getElementById('modalCancel');
        this.modalClose = document.getElementById('modalClose');
        
        // Dashboard elements
        this.totalSavings = document.getElementById('totalSavings');
        this.activeLoan = document.getElementById('activeLoan');
        this.remainingLoan = document.getElementById('remainingLoan');
        this.nextPayment = document.getElementById('nextPayment');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressPaid = document.getElementById('progressPaid');
        this.progressRemaining = document.getElementById('progressRemaining');
        this.recentTransactionsList = document.getElementById('recentTransactionsList');
        
        // Loans page
        this.loanAmount = document.getElementById('loanAmount');
        this.loanRemaining = document.getElementById('loanRemaining');
        this.loanPaid = document.getElementById('loanPaid');
        this.loanProgress = document.getElementById('loanProgress');
        this.noLoanState = document.getElementById('noLoanState');
        this.activeLoanState = document.getElementById('activeLoanState');
        
        // Wallet
        this.walletBalance = document.getElementById('walletBalance');
        
        // Savings page
        this.savingsBalance = document.getElementById('savingsBalance');
        this.savingsWalletBalance = document.getElementById('savingsWalletBalance');
        this.savingsInput = document.getElementById('savingsInput');
        this.addSavingsSubmit = document.getElementById('addSavingsSubmit');
        
        // Pending action for confirmation
        this.pendingAction = null;
        
        // Transactions page
        this.allTransactionsList = document.getElementById('allTransactionsList');
        
        // Notifications page
        this.notificationsList = document.getElementById('notificationsList');
        
        // Settings page
        this.settingsName = document.getElementById('settingsName');
        this.settingsEmail = document.getElementById('settingsEmail');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    }

    attachEventListeners() {
        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) this.navigateTo(page);
            });
        });
        
        // View all links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) this.navigateTo(page);
            });
        });
        
        // Menu toggle
        this.menuToggle.addEventListener('click', () => {
            this.sidebar.classList.toggle('active');
            this.sidebar.classList.toggle('collapsed');
            this.mainContent.classList.toggle('expanded');
        });
        
        // User profile dropdown
        this.userProfile.addEventListener('click', () => {
            this.profileDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.userProfile.contains(e.target)) {
                this.profileDropdown.classList.remove('active');
            }
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = this.themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
        
        // Notification icon
        this.notificationIcon.addEventListener('click', () => {
            this.navigateTo('notifications');
        });
        
        // Quick action buttons - use bank transfer modal for both
        document.getElementById('makePaymentBtn')?.addEventListener('click', () => {
            this.openBankTransferModal('payment');
        });
        
        document.getElementById('addSavingsBtn')?.addEventListener('click', () => {
            this.openBankTransferModal('savings');
        });

        document.getElementById('makeRepaymentBtn')?.addEventListener('click', () => {
            this.openBankTransferModal('payment');
        });
        
        // Simple Payment Modal handlers
        document.getElementById('closeSimplePayment')?.addEventListener('click', () => this.closeSimplePaymentModal());
        document.getElementById('cancelSimplePayment')?.addEventListener('click', () => this.closeSimplePaymentModal());
        document.getElementById('confirmSimplePayment')?.addEventListener('click', () => this.handleSimplePayment());
        
        // Quick amount buttons
        document.querySelectorAll('.quick-amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                document.getElementById('simplePaymentAmount').value = amount;
            });
        });
        
        document.getElementById('borrowLoanBtn')?.addEventListener('click', () => {
            this.openBorrowLoanModal();
        });
        
        // Savings form
        this.addSavingsSubmit?.addEventListener('click', () => {
            this.openBankTransferModal('savings');
        });
        
        // Top Up Wallet - use bank transfer modal
        document.getElementById('topUpBtn')?.addEventListener('click', () => {
            this.openBankTransferModal('topup');
        });
        document.getElementById('closeTopUpModal')?.addEventListener('click', () => this.closeTopUpModal());
        document.getElementById('cancelTopUp')?.addEventListener('click', () => this.closeTopUpModal());
        document.getElementById('confirmTopUp')?.addEventListener('click', () => this.handleTopUp());
        
        // Confirmation Modal
        document.getElementById('closeConfirmModal')?.addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('cancelConfirm')?.addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirmAction')?.addEventListener('click', () => this.executeConfirmedAction());
        
        // Settings form
        this.saveSettingsBtn?.addEventListener('click', () => {
            this.handleSaveSettings();
        });
        
        // Modal
        this.modalSubmit.addEventListener('click', () => {
            this.handleModalSubmit();
        });
        
        this.modalCancel.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modalClose.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        document.getElementById('sidebarLogout')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
        
        // Bank Transfer Modal Events (Unified for Payment & Savings)
        document.getElementById('bankTransferModalClose')?.addEventListener('click', () => this.closeBankTransferModal());
        document.getElementById('bankTransferCancel')?.addEventListener('click', () => this.closeBankTransferModal());
        document.getElementById('confirmTransferBtn')?.addEventListener('click', () => this.handleTransferConfirmation());
        document.getElementById('copyAccountBtn')?.addEventListener('click', () => this.copyAccountNumber());
        document.getElementById('bankTransferModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'bankTransferModal') this.closeBankTransferModal();
        });
        
        // Borrow Loan Modal Events
        this.borrowLoanModal = document.getElementById('borrowLoanModal');
        document.getElementById('borrowLoanModalClose')?.addEventListener('click', () => this.closeBorrowLoanModal());
        document.getElementById('borrowLoanCancel')?.addEventListener('click', () => this.closeBorrowLoanModal());
        document.getElementById('submitLoanBtn')?.addEventListener('click', () => this.handleBorrowLoan());
        this.borrowLoanModal?.addEventListener('click', (e) => {
            if (e.target === this.borrowLoanModal) this.closeBorrowLoanModal();
        });
    }

    navigateTo(page) {
        this.currentPage = page;
        
        // Update active nav item
        this.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === page) {
                item.classList.add('active');
            }
        });
        
        // Show active page
        this.pages.forEach(p => {
            p.classList.remove('active');
            if (p.id === `${page}Page`) {
                p.classList.add('active');
            }
        });
        
        // Update page-specific content
        this.updatePageContent(page);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('active');
        }
    }

    updatePageContent(page) {
        switch(page) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'loans':
                this.updateLoansPage();
                break;
            case 'savings':
                this.updateSavingsPage();
                break;
            case 'transactions':
                this.updateTransactionsPage();
                break;
            case 'notifications':
                this.updateNotificationsPage();
                break;
            case 'settings':
                this.updateSettingsPage();
                break;
            case 'profile':
                this.updateProfilePage();
                break;
        }
    }

    updateUI() {
        // Update user info
        this.displayUserName.textContent = this.appState.user.name;
        this.userName.textContent = this.appState.user.name.split(' ')[0];
        this.userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.appState.user.name)}&background=7c3aed&color=fff`;
        
        // Update notification badge
        this.notificationBadge.textContent = this.appState.notifications.length;
        if (this.appState.notifications.length === 0) {
            this.notificationBadge.style.display = 'none';
        } else {
            this.notificationBadge.style.display = 'block';
        }
        
        // Update current page
        this.updatePageContent(this.currentPage);
    }

    updateDashboard() {
        // Update summary cards
        this.walletBalance.textContent = `₦${this.appState.wallet.toLocaleString()}`;
        this.totalSavings.textContent = `₦${this.appState.savings.toLocaleString()}`;
        this.activeLoan.textContent = `₦${this.appState.loan.amount.toLocaleString()}`;
        this.remainingLoan.textContent = `₦${this.appState.getLoanRemaining().toLocaleString()}`;
        
        // Calculate next payment date (18th of current month)
        const nextDate = new Date();
        nextDate.setDate(18);
        if (nextDate < new Date()) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        this.nextPayment.textContent = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        // Update progress
        const progress = this.appState.getLoanProgress();
        this.progressFill.style.width = `${progress}%`;
        this.progressPercent.textContent = `${progress}% Complete`;
        this.progressPaid.textContent = `₦${this.appState.loan.paid.toLocaleString()} paid`;
        this.progressRemaining.textContent = `₦${this.appState.getLoanRemaining().toLocaleString()} remaining`;
        
        // Update recent transactions
        this.renderTransactions(this.recentTransactionsList, this.appState.transactions.slice(0, 3));
    }

    updateLoansPage() {
        const hasLoan = this.appState.loan.amount > 0;
        
        if (hasLoan) {
            // Add fade out animation
            this.noLoanState.style.transition = 'opacity 0.3s ease';
            this.noLoanState.style.opacity = '0';
            
            setTimeout(() => {
                this.noLoanState.style.display = 'none';
                this.noLoanState.style.opacity = '1';
                
                this.activeLoanState.style.display = 'block';
                this.activeLoanState.style.opacity = '0';
                
                // Trigger reflow
                void this.activeLoanState.offsetWidth;
                
                this.activeLoanState.style.transition = 'opacity 0.4s ease';
                this.activeLoanState.style.opacity = '1';
                
                this.loanAmount.textContent = `₦${this.appState.loan.amount.toLocaleString()}`;
                this.loanRemaining.textContent = `₦${this.appState.getLoanRemaining().toLocaleString()}`;
                this.loanPaid.textContent = `₦${this.appState.loan.paid.toLocaleString()}`;
                this.loanProgress.textContent = `${this.appState.getLoanProgress()}%`;
            }, 300);
        } else {
            // Add fade out animation
            this.activeLoanState.style.transition = 'opacity 0.3s ease';
            this.activeLoanState.style.opacity = '0';
            
            setTimeout(() => {
                this.activeLoanState.style.display = 'none';
                this.activeLoanState.style.opacity = '1';
                
                this.noLoanState.style.display = 'block';
                this.noLoanState.style.opacity = '0';
                
                // Trigger reflow
                void this.noLoanState.offsetWidth;
                
                this.noLoanState.style.transition = 'opacity 0.4s ease';
                this.noLoanState.style.opacity = '1';
            }, 300);
        }
    }

    updateSavingsPage() {
        this.savingsBalance.textContent = `₦${this.appState.savings.toLocaleString()}`;
        if (this.savingsWalletBalance) {
            this.savingsWalletBalance.textContent = `₦${this.appState.wallet.toLocaleString()}`;
        }
    }

    updateTransactionsPage() {
        this.renderTransactions(this.allTransactionsList, this.appState.transactions);
    }

    updateNotificationsPage() {
        if (this.appState.notifications.length === 0) {
            this.notificationsList.innerHTML = '<div class="empty-state-small">No notifications</div>';
            return;
        }
        
        this.notificationsList.innerHTML = this.appState.notifications.map(notif => `
            <div class="notification-item ${notif.type}">
                <div class="notification-icon-wrapper">
                    <i class="fas fa-${notif.type === 'warning' ? 'exclamation-triangle' : 'check-circle'}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <div class="notification-time">${notif.time}</div>
                </div>
            </div>
        `).join('');
    }

    updateSettingsPage() {
        this.settingsName.value = this.appState.user.name;
        this.settingsEmail.value = this.appState.user.email;
    }

    updateProfilePage() {
        this.profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.appState.user.name)}&background=5b21b6&color=fff&size=200`;
        this.profileName.textContent = this.appState.user.name;
        this.profileEmail.textContent = this.appState.user.email || 'No email set';
        this.profileSavings.textContent = `₦${this.appState.savings.toLocaleString()}`;
        this.profileLoans.textContent = `₦${this.appState.getLoanRemaining().toLocaleString()}`;
        this.profileTransactions.textContent = this.appState.transactions.length.toString();
    }

    renderTransactions(container, transactions) {
        if (transactions.length === 0) {
            container.innerHTML = '<div class="empty-state-small">No transactions yet</div>';
            return;
        }
        
        container.innerHTML = transactions.map(trans => {
            const isPositive = trans.amount > 0;
            let icon = 'arrow-up';
            let iconClass = 'payment';
            
            if (trans.type === 'savings' || trans.type === 'topup') {
                icon = 'arrow-down';
                iconClass = trans.type === 'topup' ? 'wallet' : 'savings';
            }
            
            // Status badge
            const statusBadge = trans.status === 'pending'
                ? '<span class="transaction-status pending">Pending</span>'
                : '<span class="transaction-status completed">Successful</span>';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-icon ${iconClass}">
                            <i class="fas fa-${icon}"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${trans.description}</h4>
                            <p>${new Date(trans.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <span class="amount ${isPositive ? 'positive' : 'negative'}">
                            ${isPositive ? '+' : ''}₦${Math.abs(trans.amount).toLocaleString()}
                        </span>
                        ${statusBadge}
                    </div>
                </div>
            `;
        }).join('');
    }

    openModal(type) {
        this.modalType = type;
        if (type === 'payment') {
            this.modalTitle.textContent = 'Make Loan Payment';
            this.modalLabel.textContent = 'Enter payment amount';
            this.modalInput.placeholder = 'Enter amount';
            this.modalInput.max = this.appState.getLoanRemaining();
            this.modalInput.type = 'number';
        } else if (type === 'transfer') {
            this.modalTitle.textContent = 'Send Money';
            this.modalLabel.textContent = 'Recipient Account Name';
            this.modalInput.placeholder = 'Enter recipient name';
            this.modalInput.type = 'text';
            this.modalInput.removeAttribute('max');
        } else {
            this.modalTitle.textContent = 'Add Savings';
            this.modalLabel.textContent = 'Enter savings amount';
            this.modalInput.placeholder = 'Enter amount';
            this.modalInput.type = 'number';
            this.modalInput.removeAttribute('max');
        }
        this.modalInput.value = '';
        this.modal.classList.add('active');
    }

    openTransferModal() {
        // Show a second input for transfer amount
        this.modalType = 'transfer';
        this.modalTitle.textContent = 'Send Money';
        this.modalLabel.textContent = 'Enter amount';
        this.modalInput.placeholder = 'Enter amount to send';
        this.modalInput.type = 'number';
        this.modalInput.max = this.appState.savings;
        
        // Store the recipient name from previous input if exists
        this.transferRecipient = this.modalInput.getAttribute('data-recipient') || '';
        
        this.modalInput.value = '';
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.modalInput.value = '';
    }

    handleModalSubmit() {
        const amount = parseInt(this.modalInput.value);
        
        if (!amount || amount < 100) {
            alert('Please enter a valid amount (minimum ₦100)');
            return;
        }
        
        if (this.modalType === 'payment') {
            if (amount > this.appState.getLoanRemaining()) {
                alert('Payment amount cannot exceed remaining loan balance');
                return;
            }
            this.appState.makePayment(amount);
            this.updateUI();
            this.closeModal();
            this.showSuccessMessage('Payment successful!');
        } else if (this.modalType === 'transfer') {
            // For transfer, we need recipient name
            const recipient = prompt('Enter recipient account name:');
            if (!recipient || recipient.trim() === '') {
                alert('Please enter recipient name');
                return;
            }
            
            if (amount > this.appState.savings) {
                alert('Insufficient balance');
                return;
            }
            
            const success = this.appState.sendMoney(recipient.trim(), amount);
            if (!success) {
                alert('Transfer failed. Please try again.');
                return;
            }
            this.updateUI();
            this.closeModal();
            this.showSuccessMessage(`Sent ₦${amount.toLocaleString()} to ${recipient}!`);
        } else {
            this.appState.addSavings(amount);
            this.updateUI();
            this.closeModal();
            this.showSuccessMessage('Savings added successfully!');
        }
    }

    handleAddSavings() {
        const amount = parseInt(this.savingsInput.value);
        
        if (!amount || amount < 100) {
            this.showToast('warning', 'Invalid Amount', 'Please enter a valid amount (minimum ₦100)');
            return;
        }
        
        // Check if user has sufficient balance
        if (this.appState.wallet < amount) {
            this.showToast('error', 'Insufficient Balance', 'Please top up your wallet to save');
            return;
        }
        
        // Show confirmation modal
        this.pendingAction = {
            type: 'savings',
            amount: amount
        };
        this.openConfirmModal(
            'Confirm Savings',
            `Are you sure you want to save ₦${amount.toLocaleString()} from your wallet?`,
            `₦${amount.toLocaleString()}`
        );
        this.savingsInput.value = '';
    }

    handleSaveSettings() {
        const name = this.settingsName.value.trim();
        const email = this.settingsEmail.value.trim();
        
        if (!name) {
            alert('Please enter your name');
            return;
        }
        
        if (!email) {
            alert('Please enter your email');
            return;
        }
        
        this.appState.updateUser(name, email);
        this.updateUI();
        this.showSuccessMessage('Settings saved successfully!');
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('treasureFortuneLoggedIn');
            window.location.href = 'login.html';
        }
    }

    // Bank Transfer Modal Methods (Unified for Payment & Savings)
    openBankTransferModal(type) {
        this.transferType = type;
        const modal = document.getElementById('bankTransferModal');
        const title = document.getElementById('bankTransferTitle');
        const amountLabel = document.getElementById('amountFormLabel');
        const amountInput = document.getElementById('transferAmountInput');
        const instruction = document.getElementById('transferInstruction');
        
        if (type === 'payment') {
            title.textContent = 'Complete Your Payment';
            amountLabel.textContent = 'Enter Payment Amount';
            amountInput.placeholder = `Remaining: ₦${this.appState.getLoanRemaining().toLocaleString()}`;
            amountInput.value = '';
            amountInput.disabled = false;
            instruction.textContent = 'Enter the amount you want to pay, then transfer to the account above.';
        } else if (type === 'topup') {
            title.textContent = 'Top Up Wallet';
            amountLabel.textContent = 'Enter Amount';
            amountInput.placeholder = 'Enter amount to top up';
            amountInput.value = '';
            amountInput.disabled = false;
            instruction.textContent = 'Transfer to the account above to top up your wallet.';
        } else {
            title.textContent = 'Add Savings';
            amountLabel.textContent = 'Enter Amount You Want to Save';
            amountInput.placeholder = 'Enter amount';
            amountInput.value = '';
            amountInput.disabled = false;
            instruction.textContent = 'Transfer this amount to the account above, then confirm below.';
        }
        
        modal.classList.add('active');
    }

    closeBankTransferModal() {
        const modal = document.getElementById('bankTransferModal');
        modal.classList.remove('active');
    }

    copyAccountNumber() {
        const accountNumber = '1234567890';
        navigator.clipboard.writeText(accountNumber).then(() => {
            this.showToast('success', 'Copied!', 'Account number copied!');
        });
    }

    handleTransferConfirmation() {
        const amount = parseInt(document.getElementById('transferAmountInput').value);
        
        if (!amount || amount < 100) {
            this.showToast('warning', 'Invalid Amount', 'Please enter a valid amount (minimum ₦100)');
            return;
        }
        
        // For payment, check remaining loan balance and wallet
        if (this.transferType === 'payment') {
            const remainingLoan = this.appState.getLoanRemaining();
            if (amount > remainingLoan) {
                this.showToast('warning', 'Amount Too High', `You cannot pay more than your remaining loan balance (₦${remainingLoan.toLocaleString()})`);
                return;
            }
            if (this.appState.wallet < amount) {
                this.showToast('error', 'Insufficient Balance', 'Your wallet balance is low. Please top up to make payment.');
                return;
            }
        }

        // Close modal
        this.closeBankTransferModal();
        
        // Show processing overlay
        const overlay = document.getElementById('processingOverlay');
        const text = document.getElementById('processingText');
        
        overlay.classList.add('active');
        
        // Phase 1: Processing
        setTimeout(() => {
            const dots = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
            text.innerHTML = (this.transferType === 'payment' ? 'Confirming your payment' : 'Confirming your deposit') + dots;
        }, 3000);
        
        // Phase 2: Complete
        setTimeout(() => {
            overlay.classList.remove('active');
            
            if (this.transferType === 'payment') {
                // Deduct from wallet
                this.appState.wallet -= amount;
                
                // Handle payment
                const transaction = {
                    id: Date.now(),
                    type: 'payment',
                    amount: -amount,
                    date: new Date().toISOString().split('T')[0],
                    description: 'Loan Payment',
                    status: 'successful'
                };
                
                this.appState.transactions.unshift(transaction);
                this.appState.addNotification('warning', 'Payment Under Review', 'Your payment is pending verification');
                this.appState.loan.paid += amount;
                
                // Check if loan is fully repaid and handle completion
                if (this.appState.loan.paid >= this.appState.loan.amount) {
                    // Show the success overlay first
                    const successOverlay = document.getElementById('loanSuccessOverlay');
                    successOverlay.classList.add('active');
                    
                    // After 2.5 seconds, hide overlay and clear loan/notifications
                    setTimeout(() => {
                        successOverlay.classList.remove('active');
                        
                        // Clear the loan data
                        this.appState.loan = { amount: 0, paid: 0 };
                        
                        this.appState.saveState();
                        this.updateUI();
                        
                        this.showToast('success', 'Loan Completed', 'You can now borrow a new loan!');
                    }, 2500);
                    
                    return; // Exit early to avoid duplicate updateUI
                }
            } else if (this.transferType === 'topup') {
                // Handle topup - add to wallet
                this.appState.wallet += amount;
                
                const transaction = {
                    id: Date.now(),
                    type: 'topup',
                    amount: amount,
                    date: new Date().toISOString().split('T')[0],
                    description: 'Wallet Top Up',
                    status: 'successful'
                };
                
                this.appState.transactions.unshift(transaction);
                this.appState.addNotification('success', 'Top Up Successful', `₦${amount.toLocaleString()} added to your wallet`);
            } else if (this.transferType === 'savings') {
                // Check wallet balance for savings
                if (this.appState.wallet < amount) {
                    this.showToast('error', 'Insufficient Balance', 'Your wallet balance is low. Please top up to save.');
                    return;
                }
                
                // Deduct from wallet
                this.appState.wallet -= amount;
                
                // Handle savings
                const transaction = {
                    id: Date.now(),
                    type: 'savings',
                    amount: amount,
                    date: new Date().toISOString().split('T')[0],
                    description: 'Savings Deposit',
                    status: 'successful'
                };
                
                this.appState.transactions.unshift(transaction);
                this.appState.addNotification('warning', 'Savings Under Review', 'Your deposit is pending verification');
                this.appState.savings += amount;
            }

            this.appState.saveState();
            this.updateUI();
            
            this.showToast('info', 'Processing Complete', 'Your money will reflect in your account within a few minutes.');
        }, 6000);
    }

    // Simple Payment Modal Methods
    openSimplePaymentModal() {
        const modal = document.getElementById('simplePaymentModal');
        modal.classList.add('active');
        
        // Show loan balance info
        document.getElementById('modalLoanBalance').textContent = `₦${this.appState.getLoanRemaining().toLocaleString()}`;
        document.getElementById('modalLoanPaid').textContent = `₦${this.appState.loan.paid.toLocaleString()}`;
        
        document.getElementById('simplePaymentAmount').value = '';
    }
    
    closeSimplePaymentModal() {
        const modal = document.getElementById('simplePaymentModal');
        modal.classList.remove('active');
    }
    
    handleSimplePayment() {
        const amount = parseInt(document.getElementById('simplePaymentAmount').value);
        
        if (!amount || amount < 100) {
            this.showToast('warning', 'Invalid Amount', 'Please enter a valid amount (minimum ₦100)');
            return;
        }
        
        if (amount > this.appState.getLoanRemaining()) {
            this.showToast('warning', 'Amount Too High', 'Payment cannot exceed remaining balance');
            return;
        }
        
        // Check if user has sufficient balance
        if (this.appState.wallet < amount) {
            this.showToast('error', 'Insufficient Balance', 'Please top up your wallet to make this payment');
            return;
        }
        
        // Show confirmation modal
        this.pendingAction = {
            type: 'loanPayment',
            amount: amount
        };
        this.openConfirmModal(
            'Confirm Loan Repayment',
            `Are you sure you want to repay ₦${amount.toLocaleString()} from your wallet?`,
            `₦${amount.toLocaleString()}`
        );
        this.closeSimplePaymentModal();
    }
    
    // Top Up Methods
    openTopUpModal() {
        const modal = document.getElementById('topUpModal');
        modal.classList.add('active');
        document.getElementById('currentWalletBalance').textContent = `₦${this.appState.wallet.toLocaleString()}`;
        document.getElementById('topUpAmount').value = '';
    }
    
    closeTopUpModal() {
        const modal = document.getElementById('topUpModal');
        modal.classList.remove('active');
    }
    
    handleTopUp() {
        const amount = parseInt(document.getElementById('topUpAmount').value);
        
        if (!amount || amount < 100) {
            this.showToast('warning', 'Invalid Amount', 'Please enter a valid amount (minimum ₦100)');
            return;
        }
        
        // Show confirmation
        this.pendingAction = {
            type: 'topUp',
            amount: amount
        };
        this.openConfirmModal(
            'Confirm Top Up',
            `Are you sure you want to top up ₦${amount.toLocaleString()} to your wallet?`,
            `₦${amount.toLocaleString()}`
        );
        this.closeTopUpModal();
    }
    
    // Confirmation Modal Methods
    openConfirmModal(title, message, amount) {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmAmount').textContent = amount;
        modal.classList.add('active');
    }
    
    closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('active');
        this.pendingAction = null;
    }
    
    executeConfirmedAction() {
        if (!this.pendingAction) return;
        
        const { type, amount } = this.pendingAction;
        
        if (type === 'loanPayment') {
            this.processLoanPayment(amount);
        } else if (type === 'topUp') {
            this.processTopUp(amount);
        } else if (type === 'savings') {
            this.processSavings(amount);
        }
        
        this.closeConfirmModal();
    }
    
    processLoanPayment(amount) {
        // Show processing
        const overlay = document.getElementById('processingOverlay');
        const text = document.getElementById('processingText');
        text.innerHTML = 'Processing your payment<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
        overlay.classList.add('active');
        
        setTimeout(() => {
            overlay.classList.remove('active');
            
            // Deduct from wallet
            this.appState.wallet -= amount;
            
            // Calculate remaining after payment
            const remaining = this.appState.getLoanRemaining() - amount;
            
            // Process payment
            this.appState.makePayment(amount);
            
            // Check if loan is fully repaid
            if (remaining <= 0) {
                const successOverlay = document.getElementById('loanSuccessOverlay');
                successOverlay.classList.add('active');
                
                setTimeout(() => {
                    successOverlay.classList.remove('active');
                    this.appState.saveState();
                    this.updateUI();
                    this.showToast('success', 'Loan Completed', 'You can now borrow a new loan!');
                }, 2500);
            } else {
                this.updateUI();
                this.showToast('success', 'Payment Successful', `You paid ₦${amount.toLocaleString()} towards your loan`);
            }
        }, 3000);
    }
    
    processTopUp(amount) {
        // Show processing
        const overlay = document.getElementById('processingOverlay');
        const text = document.getElementById('processingText');
        text.innerHTML = 'Processing top up<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
        overlay.classList.add('active');
        
        setTimeout(() => {
            overlay.classList.remove('active');
            
            // Add to wallet
            this.appState.wallet += amount;
            this.appState.addTransaction('topup', amount, 'Wallet Top Up');
            this.appState.saveState();
            this.updateUI();
            this.showToast('success', 'Top Up Successful', `₦${amount.toLocaleString()} added to your wallet`);
        }, 3000);
    }
    
    processSavings(amount) {
        // Show processing
        const overlay = document.getElementById('processingOverlay');
        const text = document.getElementById('processingText');
        text.innerHTML = 'Processing savings<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
        overlay.classList.add('active');
        
        setTimeout(() => {
            overlay.classList.remove('active');
            
            // Deduct from wallet and add to savings
            this.appState.wallet -= amount;
            this.appState.addSavings(amount);
            this.updateUI();
        }, 3000);
    }

    // Borrow Loan Methods
    openBorrowLoanModal() {
        this.borrowLoanModal = document.getElementById('borrowLoanModal');
        this.borrowLoanModal.classList.add('active');
        document.getElementById('loanAmountInput').value = '';
        document.getElementById('loanPurposeInput').value = '';
    }

    closeBorrowLoanModal() {
        this.borrowLoanModal = document.getElementById('borrowLoanModal');
        this.borrowLoanModal.classList.remove('active');
    }

    handleBorrowLoan() {
        const amount = parseInt(document.getElementById('loanAmountInput').value);
        const purpose = document.getElementById('loanPurposeInput').value.trim();

        if (!amount || amount < 1000) {
            alert('Please enter a valid loan amount (minimum ₦1,000)');
            return;
        }

        // Create new loan
        this.appState.loan = {
            amount: amount,
            paid: 0,
            purpose: purpose
        };

        this.appState.addNotification('success', 'Loan Approved', `Your loan of ₦${amount.toLocaleString()} has been approved!`);
        this.appState.saveState();

        this.closeBorrowLoanModal();
        this.updateUI();
        this.showSuccessMessage(`Loan of ₦${amount.toLocaleString()} approved!`);
    }

    showSuccessMessage(message) {
        this.showToast('success', 'Success', message);
    }

    showToast(type, title, message, duration = 5000) {
        const container = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check',
            info: 'fa-info',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        });
        
        // Auto dismiss
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'toastSlideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    showProcessingComplete(message) {
        this.showToast('info', 'Processing Complete', message, 8000);
    }
}

// ===========================
// Initialize App
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    const appState = new AppState();
    const uiController = new UIController(appState);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

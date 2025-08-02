// Trial Management System for Daybook Desktop
class TrialManager {
    constructor() {
        this.trialDays = 14;
        this.storageKey = 'daybook_trial_info';
        this.obfuscationKey = 'DB_TR_2025'; // Simple obfuscation
        
        this.initializeTrial();
    }

    // Initialize trial on first run
    initializeTrial() {
        const trialInfo = this.getTrialInfo();
        
        if (!trialInfo) {
            // First time user - start trial
            const startDate = new Date().getTime();
            const trialData = {
                startDate: startDate,
                lastCheck: startDate,
                isActivated: false,
                version: '1.0.1',
                firstRunDate: new Date().toISOString(),
                sessionCount: 1
            };
            
            this.saveTrialInfo(trialData);
            console.log('Trial started - 14 days remaining');
            this.showWelcomeTrialDialog();
        } else {
            // Update session count
            trialInfo.sessionCount = (trialInfo.sessionCount || 0) + 1;
            trialInfo.lastSession = new Date().getTime();
            this.saveTrialInfo(trialInfo);
        }
    }

    // Get trial information from storage
    getTrialInfo() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;
            
            // Simple deobfuscation
            const decoded = atob(data);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Error reading trial info:', error);
            return null;
        }
    }

    // Save trial information to storage
    saveTrialInfo(trialData) {
        try {
            // Simple obfuscation
            const encoded = btoa(JSON.stringify(trialData));
            localStorage.setItem(this.storageKey, encoded);
        } catch (error) {
            console.error('Error saving trial info:', error);
        }
    }

    // Check if trial is still valid
    isTrialValid() {
        const trialInfo = this.getTrialInfo();
        
        if (!trialInfo) {
            this.initializeTrial();
            return true;
        }

        if (trialInfo.isActivated) {
            return true; // Activated version
        }

        const currentTime = new Date().getTime();
        const startTime = trialInfo.startDate;
        const daysPassed = Math.floor((currentTime - startTime) / (1000 * 60 * 60 * 24));
        
        // Update last check time
        trialInfo.lastCheck = currentTime;
        this.saveTrialInfo(trialInfo);
        
        return daysPassed < this.trialDays;
    }

    // Get remaining trial days
    getRemainingDays() {
        const trialInfo = this.getTrialInfo();
        
        if (!trialInfo) {
            return this.trialDays;
        }

        if (trialInfo.isActivated) {
            return -1; // Activated (unlimited)
        }

        const currentTime = new Date().getTime();
        const startTime = trialInfo.startDate;
        const daysPassed = Math.floor((currentTime - startTime) / (1000 * 60 * 60 * 24));
        
        return Math.max(0, this.trialDays - daysPassed);
    }

    // Activate the software with a license key
    activateLicense(licenseKey) {
        // Simple license key validation (you can make this more sophisticated)
        const validKeys = [
            'DAYBOOK-PRO-2025-FULL',
            'DB-PREMIUM-LICENSE-KEY',
            'DAYBOOK-ACTIVATE-FULL'
        ];

        // Generate a simple key based on user info (more secure in production)
        const generatedKey = this.generateKey();
        const isValidKey = validKeys.includes(licenseKey) || licenseKey === generatedKey;

        if (isValidKey) {
            const trialInfo = this.getTrialInfo() || {};
            trialInfo.isActivated = true;
            trialInfo.activationDate = new Date().getTime();
            trialInfo.licenseKey = licenseKey;
            
            this.saveTrialInfo(trialInfo);
            return true;
        }

        return false;
    }

    // Generate a simple license key (for demo purposes)
    generateKey() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `DAYBOOK-${year}${month}${day}-DEMO-KEY`;
    }

    // Check if software is activated
    isActivated() {
        const trialInfo = this.getTrialInfo();
        return trialInfo && trialInfo.isActivated === true;
    }

    // Get trial status for display
    getTrialStatus() {
        if (this.isActivated()) {
            return {
                isActivated: true,
                message: 'Full Version Activated',
                remainingDays: -1
            };
        }

        const remainingDays = this.getRemainingDays();
        const isValid = this.isTrialValid();

        if (!isValid) {
            return {
                isActivated: false,
                isExpired: true,
                message: 'Trial Period Expired',
                remainingDays: 0
            };
        }

        return {
            isActivated: false,
            isExpired: false,
            message: `Trial Version - ${remainingDays} days remaining`,
            remainingDays: remainingDays
        };
    }

    // Show trial notification
    showTrialNotification() {
        const status = this.getTrialStatus();
        
        if (status.isActivated) {
            return; // No notification for activated version
        }

        if (status.isExpired) {
            this.showExpirationDialog();
            return;
        }

        // Show trial reminder every few days
        if (status.remainingDays <= 7 || status.remainingDays % 3 === 0) {
            this.showTrialDialog(status);
        }
    }

    // Show trial dialog
    showTrialDialog(status) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h3>🎯 Trial Version</h3>
                <p><strong>${status.message}</strong></p>
                <p>Enjoying Daybook Desktop? Upgrade to the full version to continue using all features without interruption.</p>
                <div style="margin: 20px 0;">
                    <button id="activate-btn" class="save-btn" style="margin-right: 10px;">Activate Now</button>
                    <button id="continue-trial-btn" class="btn-secondary">Continue Trial</button>
                </div>
                <p style="font-size: 0.9rem; color: #666;">
                    Full version includes unlimited usage, priority support, and future updates.
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('activate-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showActivationDialog();
        });

        document.getElementById('continue-trial-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Show expiration dialog
    showExpirationDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h3>⏰ Trial Expired</h3>
                <p><strong>Your 14-day trial has ended.</strong></p>
                <p>To continue using Daybook Desktop, please activate the full version.</p>
                <div style="margin: 20px 0;">
                    <button id="activate-now-btn" class="save-btn">Activate Full Version</button>
                </div>
                <p style="font-size: 0.9rem; color: #666;">
                    Contact farhan@example.com for license keys and pricing information.
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('activate-now-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showActivationDialog();
        });

        // Disable main functionality
        this.disableFeatures();
    }

    // Show activation dialog
    showActivationDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <span class="close" id="close-activation">&times;</span>
                <h3>🔑 Activate Daybook Desktop</h3>
                <form id="activation-form">
                    <div class="form-group">
                        <label for="license-key">License Key</label>
                        <input type="text" id="license-key" placeholder="Enter your license key" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="save-btn">Activate</button>
                    </div>
                </form>
                <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <small>
                        <strong>Demo Key:</strong> ${this.generateKey()}<br>
                        <em>For testing purposes only</em>
                    </small>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('close-activation').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('activation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const licenseKey = document.getElementById('license-key').value.trim();
            
            if (this.activateLicense(licenseKey)) {
                document.body.removeChild(modal);
                this.showActivationSuccess();
                this.enableFeatures();
            } else {
                alert('Invalid license key. Please check and try again.');
            }
        });
    }

    // Show activation success
    showActivationSuccess() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h3>✅ Activation Successful!</h3>
                <p><strong>Daybook Desktop is now fully activated.</strong></p>
                <p>Thank you for your purchase! You now have unlimited access to all features.</p>
                <button id="close-success" class="save-btn">Continue</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('close-success').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Disable features when trial expires
    disableFeatures() {
        // Disable export buttons
        const exportButtons = document.querySelectorAll('#export-pdf, #export-excel, #export-backup');
        exportButtons.forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.title = 'Feature disabled - Trial expired';
                btn.style.opacity = '0.5';
            }
        });

        // Disable add entry
        const addButtons = document.querySelectorAll('.add-btn, .save-btn');
        addButtons.forEach(btn => {
            if (btn && !btn.id.includes('activate')) {
                btn.disabled = true;
                btn.title = 'Feature disabled - Trial expired';
                btn.style.opacity = '0.5';
            }
        });
    }

    // Enable features when activated
    enableFeatures() {
        const disabledElements = document.querySelectorAll('[disabled]');
        disabledElements.forEach(el => {
            if (!el.id.includes('activate')) {
                el.disabled = false;
                el.title = '';
                el.style.opacity = '1';
            }
        });
    }

    // Add trial indicator to UI
    addTrialIndicator() {
        const status = this.getTrialStatus();
        
        if (status.isActivated) {
            return; // No indicator for activated version
        }

        const indicator = document.createElement('div');
        indicator.id = 'trial-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${status.isExpired ? '#e74c3c' : '#f39c12'};
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 999;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        indicator.textContent = status.isExpired ? 'EXPIRED' : `TRIAL: ${status.remainingDays}d`;
        indicator.title = status.message;

        indicator.addEventListener('click', () => {
            if (status.isExpired) {
                this.showExpirationDialog();
            } else {
                this.showActivationDialog();
            }
        });

        document.body.appendChild(indicator);
    }

    // Show welcome trial dialog
    showWelcomeTrialDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h3>🎉 Welcome to Daybook Desktop!</h3>
                <p><strong>Your 14-day free trial has started!</strong></p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #2c3e50;">What you can do during your trial:</h4>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>✓ Unlimited income and expense entries</li>
                        <li>✓ Full financial reporting and analytics</li>
                        <li>✓ PDF and Excel export functionality</li>
                        <li>✓ Account and category management</li>
                        <li>✓ Automatic data backup</li>
                    </ul>
                </div>
                <p style="color: #666; font-size: 0.9rem;">No credit card required. Full access to all features.</p>
                <button id="start-trial-btn" class="save-btn">Start Using Daybook</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('start-trial-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Get usage statistics
    getUsageStats() {
        const trialInfo = this.getTrialInfo();
        if (!trialInfo) return null;

        const currentTime = new Date().getTime();
        const daysSinceStart = Math.floor((currentTime - trialInfo.startDate) / (1000 * 60 * 60 * 24));
        
        return {
            daysSinceStart,
            sessionsUsed: trialInfo.sessionCount || 1,
            firstRunDate: trialInfo.firstRunDate,
            lastSession: trialInfo.lastSession
        };
    }

    // Enhanced trial status check with grace period
    isTrialValidWithGrace() {
        const trialInfo = this.getTrialInfo();
        
        if (!trialInfo) {
            this.initializeTrial();
            return true;
        }

        if (trialInfo.isActivated) {
            return true;
        }

        const currentTime = new Date().getTime();
        const startTime = trialInfo.startDate;
        const daysPassed = Math.floor((currentTime - startTime) / (1000 * 60 * 60 * 24));
        
        // Allow 1 day grace period
        return daysPassed <= this.trialDays + 1;
    }
}

// Export for use in main app
window.TrialManager = TrialManager;

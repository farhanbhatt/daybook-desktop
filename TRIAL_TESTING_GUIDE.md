# 🔬 Trial System Testing Guide

## Overview
Your Daybook Desktop app now includes a comprehensive 14-day trial system. This guide will help you test all the trial functionality.

## Quick Test Options

### Option 1: Run Test Page (Recommended)
```bash
# Open the dedicated test page
start test-trial.html
```

### Option 2: Run Main Application
```bash
# Start the Electron app
npm run electron
```

### Option 3: Use Test Script
```bash
# Run the interactive test script
test-app.bat
```

## Trial System Features

### ✅ What's Implemented

1. **14-Day Trial Period**
   - Automatically starts on first run
   - Tracks remaining days accurately
   - Shows welcome dialog for new users

2. **Visual Indicators**
   - Trial indicator in top-right corner
   - App title shows trial status
   - Color-coded status (orange for active, red for expired)

3. **User-Friendly Dialogs**
   - Welcome dialog explaining trial benefits
   - Activation dialog with license key input
   - Trial reminder notifications
   - Expiration warning dialogs

4. **Feature Management**
   - Disables export features when trial expires
   - Provides activation prompts
   - Maintains full functionality during trial

5. **License Key System**
   - Pre-defined license keys for testing
   - Demo key generation (date-based)
   - Activation success/failure feedback

6. **Data Persistence**
   - Trial info stored in localStorage
   - Session counting
   - Usage statistics tracking

## Testing Scenarios

### 🧪 Test Case 1: New User Experience
1. Clear trial data (localStorage)
2. Start the app
3. **Expected**: Welcome dialog appears showing trial benefits
4. **Expected**: Trial indicator shows "14 days remaining"

### 🧪 Test Case 2: License Activation
1. Click activation dialog
2. Enter demo key: `DAYBOOK-20250801-DEMO-KEY` (or current date)
3. Click "Activate"
4. **Expected**: Success message and unlimited access

### 🧪 Test Case 3: Trial Expiration
1. Use "Simulate Trial Expiry" in test page
2. **Expected**: Features disabled, expiration dialog shown
3. **Expected**: Export buttons become disabled

### 🧪 Test Case 4: Trial Restoration
1. After expiry simulation, click "Restore Trial"
2. **Expected**: Trial resets to 14 days remaining

## Valid License Keys

### Pre-configured Keys:
- `DAYBOOK-PRO-2025-FULL`
- `DB-PREMIUM-LICENSE-KEY`
- `DAYBOOK-ACTIVATE-FULL`

### Demo Key (Generated Daily):
- `DAYBOOK-YYYYMMDD-DEMO-KEY` (e.g., `DAYBOOK-20250801-DEMO-KEY`)

## Test Commands

### Browser Console Testing
```javascript
// Check trial status
const trialManager = new TrialManager();
console.log(trialManager.getTrialStatus());

// Test activation
trialManager.activateLicense('DAYBOOK-PRO-2025-FULL');

// Clear trial data
localStorage.removeItem('daybook_trial_info');

// Simulate expiry
const info = trialManager.getTrialInfo();
info.startDate = Date.now() - (15 * 24 * 60 * 60 * 1000);
trialManager.saveTrialInfo(info);
```

### Testing Different States

1. **Fresh Install**: Clear localStorage, restart app
2. **Mid-Trial**: Normal usage, check remaining days
3. **Near Expiry**: Simulate 12+ days passed
4. **Expired**: Simulate 15+ days passed
5. **Activated**: Use valid license key

## Expected Behaviors

### During Trial (Days 1-14):
- ✅ All features available
- 📍 Trial indicator visible
- 🔔 Occasional reminder dialogs (after day 7)

### Trial Expired (Day 15+):
- ❌ Export features disabled
- 🚫 Activation prompts appear
- 📍 Red "EXPIRED" indicator

### After Activation:
- ✅ All features permanently enabled
- 📍 No trial indicator
- 💚 "Full Version Activated" status

## Troubleshooting

### Common Issues:
1. **Trial system not loading**: Check browser console for errors
2. **LocalStorage not persisting**: Check browser settings
3. **Dialogs not appearing**: Check for popup blockers

### Reset Commands:
```javascript
// Complete reset
localStorage.clear();
location.reload();

// Trial-specific reset
localStorage.removeItem('daybook_trial_info');
```

## File Structure

```
modern_daybook/
├── trial.js              # Main trial system logic
├── app.js                # App integration
├── index.html            # Main app UI
├── test-trial.html       # Dedicated test page
├── test-app.bat          # Test automation script
└── TRIAL_TESTING_GUIDE.md # This guide
```

## Success Criteria

✅ **Trial system passes if:**
1. New users see welcome dialog
2. Trial countdown works accurately
3. Features disable after expiration
4. Valid license keys activate successfully
5. Visual indicators update correctly
6. No console errors during normal operation

## Support

For any issues with the trial system:
1. Check browser console for errors
2. Use the test page for debugging
3. Verify localStorage data integrity
4. Test with different license keys

---

**Happy Testing! 🚀**

The trial system is now fully integrated and ready for production use.

# Test Instructions for Accounts Feature

## ✅ After installing the updated app (v1.0.1), you should now see:

### 1. **Navigation Menu**
- Look for "Accounts" in the left sidebar menu

### 2. **Accounts Section Features**
When you click on "Accounts", you should see:

#### **Summary Cards at the top:**
- Total Receivables (money owed to you)
- Total Payables (money you owe)
- Net Position (receivables minus payables)

#### **Two Tabs:**
- **Receivables (Debit)** - Money others owe you
- **Payables (Credit)** - Money you owe others

#### **Add Account Entry Button**
- Blue button to add new account entries

#### **Search and Filter Options**
- Search by name or description
- Filter by status (All, Pending, Partially Paid, Paid)

#### **Account Table with columns:**
- Date
- Party Name
- Description
- Original Amount
- Paid Amount
- Balance
- Status
- Due Date
- Actions (Record Payment, Edit, Delete)

## 🧪 **Test Steps:**

### Step 1: Add a Receivable
1. Click "Add Account Entry"
2. Select "Receivable (Debit - Money to receive)"
3. Enter a customer name
4. Enter an amount (e.g., 10000)
5. Add description
6. Save

### Step 2: Add a Payable
1. Click "Add Account Entry"
2. Select "Payable (Credit - Money to pay)"
3. Enter a supplier name
4. Enter an amount (e.g., 5000)
5. Add description
6. Save

### Step 3: Record a Payment
1. Click "Record Payment" on any account
2. Enter a payment amount
3. Save

### Step 4: Check Summary
- The summary cards should update automatically
- Net Position = Total Receivables - Total Payables

## 🚨 **If you don't see the Accounts section:**
1. Make sure you installed the new version (1.0.1)
2. Try closing and reopening the app
3. The app should show version 1.0.1 in the about dialog

## ✨ **All functionality should be working now!**

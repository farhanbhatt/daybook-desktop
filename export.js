// Export utility functions for PDF and Excel generation
// Import necessary libraries (these will be loaded via CDN in index.html)

class ExportManager {
    constructor(app) {
        this.app = app;
        this.librariesReady = false;
        this.initializeLibraries();
    }

    async initializeLibraries() {
        // Wait a bit for all scripts to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Initializing libraries...');
        console.log('window.jsPDF:', window.jsPDF);
        console.log('window.XLSX:', window.XLSX);
        
        // Check different possible ways jsPDF might be exposed
        const jsPDFChecks = [
            typeof window.jsPDF !== 'undefined',
            typeof window.jspdf !== 'undefined',
            typeof jsPDF !== 'undefined'
        ];
        
        console.log('jsPDF checks:', jsPDFChecks);
        
        if (jsPDFChecks.some(check => check)) {
            console.log('jsPDF library found!');
            this.librariesReady = true;
        } else {
            console.error('jsPDF library not found, attempting to reinitialize...');
            // Try to reload the script
            await this.reloadLibraries();
        }
        
        if (typeof window.XLSX === 'undefined') {
            console.error('XLSX library not loaded');
        }
    }
    
    async reloadLibraries() {
        console.log('Attempting to reload jsPDF library...');
        
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = './libs/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF script reloaded');
                setTimeout(() => {
                    console.log('After reload - window.jsPDF:', window.jsPDF);
                    if (typeof window.jsPDF !== 'undefined') {
                        this.librariesReady = true;
                        console.log('jsPDF is now available!');
                    }
                    resolve();
                }, 100);
            };
            script.onerror = () => {
                console.error('Failed to reload jsPDF script');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    // Generate PDF report
    async exportToPDF() {
        try {
            console.log('exportToPDF called - checking library availability...');
            console.log('this.librariesReady:', this.librariesReady);
            console.log('typeof window.jsPDF:', typeof window.jsPDF);
            
            // Wait for libraries to be ready if they're still initializing
            if (!this.librariesReady) {
                console.log('Libraries not ready, waiting...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.initializeLibraries();
            }
            
            // Check if jsPDF is available using multiple methods
            const jsPDFAvailable = typeof window.jsPDF !== 'undefined' || 
                                 typeof window.jspdf !== 'undefined' || 
                                 typeof jsPDF !== 'undefined';
            
            if (!jsPDFAvailable) {
                console.error('jsPDF still not available after initialization');
                await this.app.showAlert('PDF library not loaded. Please try again or restart the application.', 'error');
                return;
            }
            
            console.log('jsPDF is available, proceeding with PDF generation...');

            // Handle different ways jsPDF might be exposed - simplified for legacy version
            let jsPDF;
            
            console.log('Trying to find jsPDF constructor...');
            console.log('window.jsPDF:', window.jsPDF);
            console.log('window.jspdf:', window.jspdf);
            console.log('global jsPDF:', typeof jsPDF !== 'undefined' ? jsPDF : 'undefined');
            
            // Try different access methods
            if (typeof window.jsPDF === 'function') {
                // Legacy jsPDF - direct function
                jsPDF = window.jsPDF;
                console.log('Using window.jsPDF (direct function)');
            } else if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
                // Quick fix method: window.jspdf.jsPDF()
                jsPDF = window.jspdf.jsPDF;
                console.log('Using window.jspdf.jsPDF (quick fix method)');
            } else if (window.jsPDF && window.jsPDF.jsPDF && typeof window.jsPDF.jsPDF === 'function') {
                // Nested constructor
                jsPDF = window.jsPDF.jsPDF;
                console.log('Using window.jsPDF.jsPDF (nested)');
            } else if (typeof jsPDF !== 'undefined' && typeof jsPDF === 'function') {
                // Global jsPDF
                console.log('Using global jsPDF');
                // jsPDF is already available
            } else {
                console.error('Could not find jsPDF constructor');
                console.log('Available window properties with pdf:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
            }
            
            console.log('jsPDF constructor:', jsPDF);
            console.log('typeof jsPDF:', typeof jsPDF);
            
            if (typeof jsPDF !== 'function') {
                console.error('jsPDF constructor not found or not a function');
                console.log('Available on window:', Object.keys(window).filter(key => key.toLowerCase().includes('pdf')));
                await this.app.showAlert('PDF constructor not available. Please restart the application.', 'error');
                return;
            }
            
            const doc = new jsPDF();

            // Get date range from profit & loss form
            const dateFrom = document.getElementById('pl-date-from').value;
            const dateTo = document.getElementById('pl-date-to').value;

            if (!dateFrom || !dateTo) {
                await this.app.showAlert('Please select date range first in Profit & Loss section', 'warning');
                return;
            }

            // Filter entries by date range
            const filteredEntries = this.app.entries.filter(e => 
                e.date >= dateFrom && e.date <= dateTo
            );

            // Calculate totals
            const incomeEntries = filteredEntries.filter(e => e.type === 'income');
            const expenseEntries = filteredEntries.filter(e => e.type === 'expense');
            const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
            const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
            const netProfit = totalIncome - totalExpenses;

            // Set up document
            doc.setFontSize(20);
            doc.text('Daybook Financial Report', 20, 30);
            
            doc.setFontSize(12);
            doc.text(`Period: ${dateFrom} to ${dateTo}`, 20, 45);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);

            // Summary section
            doc.setFontSize(16);
            doc.text('Summary', 20, 75);
            
            doc.setFontSize(12);
            doc.text(`Total Income: ${this.app.formatCurrency(totalIncome)}`, 30, 90);
            doc.text(`Total Expenses: ${this.app.formatCurrency(totalExpenses)}`, 30, 100);
            doc.text(`Net ${netProfit >= 0 ? 'Profit' : 'Loss'}: ${this.app.formatCurrency(Math.abs(netProfit))}`, 30, 110);

            let yPosition = 130;

            // Income section
            if (incomeEntries.length > 0) {
                doc.setFontSize(14);
                doc.text('Income Details', 20, yPosition);
                yPosition += 15;

                // Create income table - legacy format
                const incomeData = incomeEntries.map(entry => [
                    entry.date,
                    entry.category,
                    this.app.formatCurrency(entry.amount),
                    entry.description || '-'
                ]);

                // Use legacy autoTable format
                doc.autoTable(['Date', 'Category', 'Amount', 'Description'], incomeData, {
                    startY: yPosition,
                    theme: 'grid',
                    headerStyles: { fillColor: [46, 204, 113] },
                    margin: { left: 20, right: 20 }
                });

                // Calculate new Y position manually for legacy version
                yPosition = yPosition + 15 + (incomeData.length * 8) + 20; // header + rows + margin
            }

            // Expense section
            if (expenseEntries.length > 0) {
                doc.setFontSize(14);
                doc.text('Expense Details', 20, yPosition);
                yPosition += 15;

                // Create expense table - legacy format
                const expenseData = expenseEntries.map(entry => [
                    entry.date,
                    entry.category,
                    this.app.formatCurrency(entry.amount),
                    entry.description || '-'
                ]);

                // Use legacy autoTable format
                doc.autoTable(['Date', 'Category', 'Amount', 'Description'], expenseData, {
                    startY: yPosition,
                    theme: 'grid',
                    headerStyles: { fillColor: [231, 76, 60] },
                    margin: { left: 20, right: 20 }
                });
            }

            // Save the PDF
            if (window.electronAPI) {
                // Use Electron's save dialog
                const filePath = await window.electronAPI.showSaveDialog({
                    title: 'Save PDF Report',
                    defaultPath: `daybook_report_${dateFrom}_to_${dateTo}.pdf`,
                    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
                });
                
                if (filePath) {
                    const pdfData = doc.output('arraybuffer');
                    // Convert ArrayBuffer to Uint8Array for Electron
                    const uint8Array = new Uint8Array(pdfData);
                    await window.electronAPI.saveFile(filePath, uint8Array);
                    await this.app.showAlert('PDF report saved successfully!', 'info');
                }
            } else {
                // Download directly in browser
                doc.save(`daybook_report_${dateFrom}_to_${dateTo}.pdf`);
                await this.app.showAlert('PDF report downloaded successfully!', 'info');
            }

        } catch (error) {
            console.error('PDF export error:', error);
            await this.app.showAlert('Error generating PDF: ' + error.message, 'error');
        }
    }

    // Generate Excel report
    async exportToExcel() {
        try {
            // Check if XLSX is available
            if (typeof XLSX === 'undefined') {
                await this.app.showAlert('Excel library not loaded. Please refresh the page.', 'error');
                return;
            }

            // Get date range from profit & loss form
            const dateFrom = document.getElementById('pl-date-from').value;
            const dateTo = document.getElementById('pl-date-to').value;

            if (!dateFrom || !dateTo) {
                await this.app.showAlert('Please select date range first in Profit & Loss section', 'warning');
                return;
            }

            // Filter entries by date range
            const filteredEntries = this.app.entries.filter(e => 
                e.date >= dateFrom && e.date <= dateTo
            );

            // Calculate totals
            const incomeEntries = filteredEntries.filter(e => e.type === 'income');
            const expenseEntries = filteredEntries.filter(e => e.type === 'expense');
            const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
            const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
            const netProfit = totalIncome - totalExpenses;

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Summary sheet
            const summaryData = [
                ['Daybook Financial Report'],
                [`Period: ${dateFrom} to ${dateTo}`],
                [`Generated: ${new Date().toLocaleDateString()}`],
                [''],
                ['Summary'],
                ['Total Income', totalIncome],
                ['Total Expenses', totalExpenses],
                [`Net ${netProfit >= 0 ? 'Profit' : 'Loss'}`, Math.abs(netProfit)],
            ];

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

            // Income sheet
            if (incomeEntries.length > 0) {
                const incomeData = [
                    ['Date', 'Category', 'Amount', 'Description'],
                    ...incomeEntries.map(entry => [
                        entry.date,
                        entry.category,
                        entry.amount,
                        entry.description || ''
                    ])
                ];
                const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
                XLSX.utils.book_append_sheet(wb, incomeSheet, 'Income');
            }

            // Expense sheet
            if (expenseEntries.length > 0) {
                const expenseData = [
                    ['Date', 'Category', 'Amount', 'Description'],
                    ...expenseEntries.map(entry => [
                        entry.date,
                        entry.category,
                        entry.amount,
                        entry.description || ''
                    ])
                ];
                const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
                XLSX.utils.book_append_sheet(wb, expenseSheet, 'Expenses');
            }

            // All entries sheet
            if (filteredEntries.length > 0) {
                const allData = [
                    ['Date', 'Type', 'Category', 'Amount', 'Description'],
                    ...filteredEntries.map(entry => [
                        entry.date,
                        entry.type,
                        entry.category,
                        entry.amount,
                        entry.description || ''
                    ])
                ];
                const allSheet = XLSX.utils.aoa_to_sheet(allData);
                XLSX.utils.book_append_sheet(wb, allSheet, 'All Entries');
            }

            // Save the Excel file
            if (window.electronAPI) {
                // Use Electron's save dialog
                const filePath = await window.electronAPI.showSaveDialog({
                    title: 'Save Excel Report',
                    defaultPath: `daybook_report_${dateFrom}_to_${dateTo}.xlsx`,
                    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
                });
                
                if (filePath) {
                    const excelData = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                    await window.electronAPI.saveFile(filePath, excelData);
                    await this.app.showAlert('Excel report saved successfully!', 'info');
                }
            } else {
                // Download directly in browser
                XLSX.writeFile(wb, `daybook_report_${dateFrom}_to_${dateTo}.xlsx`);
                await this.app.showAlert('Excel report downloaded successfully!', 'info');
            }

        } catch (error) {
            console.error('Excel export error:', error);
            await this.app.showAlert('Error generating Excel: ' + error.message, 'error');
        }
    }
}

// Export the class for use in app.js
console.log('Export.js loaded, defining window.ExportManager');
window.ExportManager = ExportManager;
console.log('window.ExportManager defined:', typeof window.ExportManager);

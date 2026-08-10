// Konfigurasi URL Web App Google Apps Script
// GANTI URL INI DENGAN URL WEB APP MILIK ANDA SETELAH DEPLOY backend.gs
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx29s3PIEw9OyhXnNK9-RqEB3PmVXA1Es6MisCg-jSeCNjAoq8PHd-mbS6--qoNgE8yaA/exec';

// Kategori default
const categories = {
    Income: ['Gaji', 'Bonus', 'Hasil Usaha', 'Pemberian', 'Lainnya'],
    Expense: ['Makanan & Minuman', 'Transportasi', 'Tagihan & Utilitas', 'Belanja', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya']
};

let categoryChartInstance = null;
let trendChartInstance = null;
let globalTransactions = [];
let globalBudgets = [];
let globalGoals = [];
let globalDebts = [];

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW reg failed:', err));
  });
}

function switchView(view) {
    const dashboardView = document.getElementById('view-dashboard');
    const analyticsView = document.getElementById('view-analytics');
    const budgetsView = document.getElementById('view-budgets');
    const goalsView = document.getElementById('view-goals');
    const debtsView = document.getElementById('view-debts');
    
    const navDashboard = document.getElementById('nav-dashboard');
    const navAnalytics = document.getElementById('nav-analytics');
    const navBudgets = document.getElementById('nav-budgets');
    const navGoals = document.getElementById('nav-goals');
    const navDebts = document.getElementById('nav-debts');
    
    // Mobile Nav
    const mobNavDashboard = document.getElementById('mob-nav-dashboard');
    const mobNavAnalytics = document.getElementById('mob-nav-analytics');
    const mobNavBudgets = document.getElementById('mob-nav-budgets');
    const mobNavGoals = document.getElementById('mob-nav-goals');
    
    // Update Title
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');

    if (view === 'dashboard') {
        dashboardView.classList.remove('d-none');
        analyticsView.classList.add('d-none');
        budgetsView.classList.add('d-none');
        if(goalsView) goalsView.classList.add('d-none');
        if(debtsView) debtsView.classList.add('d-none');
        
        if(navDashboard) navDashboard.classList.add('active');
        if(navAnalytics) navAnalytics.classList.remove('active');
        if(navBudgets) navBudgets.classList.remove('active');
        if(navGoals) navGoals.classList.remove('active');
        if(navDebts) navDebts.classList.remove('active');
        
        if(mobNavDashboard) mobNavDashboard.classList.add('active');
        if(mobNavAnalytics) mobNavAnalytics.classList.remove('active');
        if(mobNavBudgets) mobNavBudgets.classList.remove('active');
        
        title.innerText = 'Dashboard Keuangan';
        subtitle.innerText = 'Ringkasan kondisi finansial Anda.';
    } else if (view === 'analytics') {
        dashboardView.classList.add('d-none');
        analyticsView.classList.remove('d-none');
        budgetsView.classList.add('d-none');
        if(goalsView) goalsView.classList.add('d-none');
        if(debtsView) debtsView.classList.add('d-none');
        
        if(navDashboard) navDashboard.classList.remove('active');
        if(navAnalytics) navAnalytics.classList.add('active');
        if(navBudgets) navBudgets.classList.remove('active');
        if(navGoals) navGoals.classList.remove('active');
        if(navDebts) navDebts.classList.remove('active');
        
        if(mobNavDashboard) mobNavDashboard.classList.remove('active');
        if(mobNavAnalytics) mobNavAnalytics.classList.add('active');
        if(mobNavBudgets) mobNavBudgets.classList.remove('active');
        
        title.innerText = 'Analitik & Grafik';
        subtitle.innerText = 'Wawasan detail mengenai arus kas Anda.';
    } else if (view === 'budgets') {
        dashboardView.classList.add('d-none');
        analyticsView.classList.add('d-none');
        budgetsView.classList.remove('d-none');
        if(goalsView) goalsView.classList.add('d-none');
        if(debtsView) debtsView.classList.add('d-none');
        
        if(navDashboard) navDashboard.classList.remove('active');
        if(navAnalytics) navAnalytics.classList.remove('active');
        if(navBudgets) navBudgets.classList.add('active');
        if(navGoals) navGoals.classList.remove('active');
        if(navDebts) navDebts.classList.remove('active');
        
        if(mobNavDashboard) mobNavDashboard.classList.remove('active');
        if(mobNavAnalytics) mobNavAnalytics.classList.remove('active');
        if(mobNavBudgets) mobNavBudgets.classList.add('active');
        
        title.innerText = 'Anggaran Bulanan';
        subtitle.innerText = 'Kontrol pengeluaran Anda agar tetap hemat.';
    } else if (view === 'goals') {
        dashboardView.classList.add('d-none');
        analyticsView.classList.add('d-none');
        budgetsView.classList.add('d-none');
        if(goalsView) goalsView.classList.remove('d-none');
        if(debtsView) debtsView.classList.add('d-none');
        
        if(navDashboard) navDashboard.classList.remove('active');
        if(navAnalytics) navAnalytics.classList.remove('active');
        if(navBudgets) navBudgets.classList.remove('active');
        if(navGoals) navGoals.classList.add('active');
        if(navDebts) navDebts.classList.remove('active');
        
        if(mobNavDashboard) mobNavDashboard.classList.remove('active');
        if(mobNavAnalytics) mobNavAnalytics.classList.remove('active');
        if(mobNavBudgets) mobNavBudgets.classList.remove('active');
        if(mobNavGoals) mobNavGoals.classList.add('active');
        
        title.innerText = 'Tujuan & Tabungan';
        subtitle.innerText = 'Pantau progres finansial dan impian Anda.';
    } else if (view === 'debts') {
        dashboardView.classList.add('d-none');
        analyticsView.classList.add('d-none');
        budgetsView.classList.add('d-none');
        if(goalsView) goalsView.classList.add('d-none');
        if(debtsView) debtsView.classList.remove('d-none');
        
        if(navDashboard) navDashboard.classList.remove('active');
        if(navAnalytics) navAnalytics.classList.remove('active');
        if(navBudgets) navBudgets.classList.remove('active');
        if(navGoals) navGoals.classList.remove('active');
        if(navDebts) navDebts.classList.add('active');
        
        title.innerText = 'Hutang & Piutang';
        subtitle.innerText = 'Kelola catatan pinjam meminjam Anda.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    // Cek konfigurasi API
    if (SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        document.getElementById('api-alert').style.display = 'none';
        loadTransactions();
        loadBudgets();
        loadGoals();
        loadDebts();
    }

    // Set tanggal hari ini di input tanggal
    document.getElementById('date-input').valueAsDate = new Date();

    // Setup Form Kategori berdasarkan jenis
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const categorySelect = document.getElementById('category-select');

    function updateCategories() {
        const type = document.querySelector('input[name="type"]:checked').value;
        const catList = type === 'Pemasukan' ? categories.Income : categories.Expense;
        
        categorySelect.innerHTML = '';
        catList.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }

    typeRadios.forEach(radio => radio.addEventListener('change', updateCategories));
    updateCategories(); // inisiasi awal

    // Setup Submit Form
    const form = document.getElementById('transaction-form');
    if(form) form.addEventListener('submit', handleAddTransaction);

    const budgetForm = document.getElementById('budget-form');
    if(budgetForm) budgetForm.addEventListener('submit', handleSaveBudget);

    const goalForm = document.getElementById('goal-form');
    if(goalForm) goalForm.addEventListener('submit', handleSaveGoal);

    const debtForm = document.getElementById('debt-form');
    if(debtForm) debtForm.addEventListener('submit', handleSaveDebt);
});

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function loadTransactions() {
    const tbody = document.getElementById('transaction-list');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i> Memuat data...</td></tr>';

    fetch(SCRIPT_URL + '?action=getTransactions')
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                globalTransactions = data.data;
                populateMonthFilter();
                applyMonthFilter();
            } else {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${data.message}</td></tr>`;
            }
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Terjadi kesalahan saat memuat data.</td></tr>';
        });
}

function loadBudgets() {
    fetch(SCRIPT_URL + '?action=getBudgets')
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                globalBudgets = data.data;
                renderBudgets();
            }
        })
        .catch(err => console.error(err));
}

function loadGoals() {
    fetch(SCRIPT_URL + '?action=getGoals')
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                globalGoals = data.data;
                renderGoals();
            }
        })
        .catch(err => console.error(err));
}

function loadDebts() {
    fetch(SCRIPT_URL + '?action=getDebts')
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                globalDebts = data.data;
                renderDebts();
            }
        })
        .catch(err => console.error(err));
}

function populateMonthFilter() {
    const filter = document.getElementById('month-filter');
    const currentValue = filter.value;
    
    // Simpan option 'Semua Waktu'
    filter.innerHTML = '<option value="all">Semua Waktu</option>';
    
    const months = new Set();
    globalTransactions.forEach(trx => {
        const d = new Date(trx.date);
        const monthStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        months.add(monthStr);
    });
    
    const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));
    
    sortedMonths.forEach(m => {
        const [year, month] = m.split('-');
        const dateObj = new Date(year, parseInt(month) - 1, 1);
        const label = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        
        const option = document.createElement('option');
        option.value = m;
        option.textContent = label;
        filter.appendChild(option);
    });
    
    // Kembalikan ke nilai sebelumnya jika masih ada
    if (Array.from(filter.options).some(opt => opt.value === currentValue)) {
        filter.value = currentValue;
    }
}

function applyMonthFilter() {
    const selected = document.getElementById('month-filter').value;
    let filtered = globalTransactions;
    
    if (selected !== 'all') {
        filtered = globalTransactions.filter(trx => {
            const d = new Date(trx.date);
            const monthStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            return monthStr === selected;
        });
    }
    
    renderDashboard(filtered);
}

function renderDashboard(transactions) {
    const tbody = document.getElementById('transaction-list');
    tbody.innerHTML = '';

    let totalIncome = 0;
    let totalExpense = 0;
    let expenseByCategory = {};
    let trendData = {}; // Format: { 'YYYY-MM-DD': { income: 0, expense: 0 } }

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Belum ada transaksi.</td></tr>';
    }

    // Urutkan transaksi dari terlama ke terbaru untuk grafik tren
    const sortedForTrend = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedForTrend.forEach(trx => {
        const amount = parseFloat(trx.amount);
        const isIncome = trx.type === 'Pemasukan';
        
        // Buat key tanggal (YYYY-MM-DD)
        const dateKey = new Date(trx.date).toISOString().split('T')[0];
        if(!trendData[dateKey]) trendData[dateKey] = { income: 0, expense: 0 };

        if (isIncome) {
            trendData[dateKey].income += amount;
        } else {
            trendData[dateKey].expense += amount;
        }
    });

    transactions.forEach(trx => {
        const amount = parseFloat(trx.amount);
        const isIncome = trx.type === 'Pemasukan';

        if (isIncome) {
            totalIncome += amount;
        } else {
            totalExpense += amount;
        }

        // Render tabel
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="fw-semibold text-dark">${formatDate(trx.date)}</div>
            </td>
            <td>
                <span class="badge ${isIncome ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill mb-1 d-inline-block">
                    ${trx.category}
                </span>
                <div class="small text-muted"><i class="fas fa-wallet me-1"></i> ${trx.source || '-'}</div>
            </td>
            <td>${trx.notes}</td>
            <td class="text-end fw-bold ${isIncome ? 'text-success' : 'text-danger'}">
                ${isIncome ? '+' : '-'} ${formatRupiah(amount)}
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteTransaction('${trx.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const totalBalance = totalIncome - totalExpense;

    document.getElementById('total-balance').innerText = formatRupiah(totalBalance);
    document.getElementById('total-income').innerText = formatRupiah(totalIncome);
    document.getElementById('total-expense').innerText = formatRupiah(totalExpense);

    // Save currently filtered transactions for chart toggling
    window.currentFilteredTransactions = transactions;

    updateCategoryChart();
    renderTrendChart(trendData);
    if (typeof renderBudgets === 'function') renderBudgets();
}

function updateCategoryChart() {
    const type = document.getElementById('chart-type-select').value;
    let dataObj = {};
    
    const txList = window.currentFilteredTransactions || globalTransactions;
    
    txList.forEach(trx => {
        if (trx.type === type) {
            const amount = parseFloat(trx.amount);
            if (dataObj[trx.category]) {
                dataObj[trx.category] += amount;
            } else {
                dataObj[trx.category] = amount;
            }
        }
    });
    
    renderChart(dataObj);
}

function renderChart(dataObj) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const noDataEl = document.getElementById('no-chart-data');
    const chartEl = document.getElementById('categoryChart');

    const labels = Object.keys(dataObj);
    const dataPoints = Object.values(dataObj);

    if (labels.length === 0) {
        chartEl.style.display = 'none';
        noDataEl.classList.remove('d-none');
        return;
    }

    chartEl.style.display = 'block';
    noDataEl.classList.add('d-none');

    const backgroundColors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#d946ef', '#f43f5e'
    ];

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatRupiah(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function renderTrendChart(trendData) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const noDataEl = document.getElementById('no-trend-data');
    const chartEl = document.getElementById('trendChart');

    const labels = Object.keys(trendData).map(dateStr => formatDate(dateStr));
    const incomeData = Object.values(trendData).map(d => d.income);
    const expenseData = Object.values(trendData).map(d => d.expense);

    if (labels.length === 0) {
        chartEl.style.display = 'none';
        noDataEl.classList.remove('d-none');
        return;
    }

    chartEl.style.display = 'block';
    noDataEl.classList.add('d-none');

    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData,
                    borderColor: '#10b981', // Success Green
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    borderColor: '#ef4444', // Danger Red
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        font: { family: "'Inter', sans-serif" }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatRupiah(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) return 'Rp ' + (value / 1000000) + ' Jt';
                            if (value >= 1000) return 'Rp ' + (value / 1000) + ' Rb';
                            return 'Rp ' + value;
                        },
                        font: { family: "'Inter', sans-serif" }
                    },
                    grid: { borderDash: [5, 5] }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "'Inter', sans-serif" } }
                }
            }
        }
    });
}

function handleAddTransaction(e) {
    e.preventDefault();

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert("Ganti SCRIPT_URL dengan URL Web App Anda untuk menyimpan data.");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = new URLSearchParams();
    
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';

    fetch(SCRIPT_URL + '?action=addTransaction', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(resData => {
        if(resData.result === 'success') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
            modal.hide();
            form.reset();
            document.getElementById('date-input').valueAsDate = new Date();
            loadTransactions(); // Refresh data
        } else {
            alert("Error: " + resData.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan data.");
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    });
}

function deleteTransaction(id) {
    if(!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    fetch(SCRIPT_URL + '?action=deleteTransaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + id
    })
    .then(res => res.json())
    .then(data => {
        if(data.result === 'success') {
            loadTransactions();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => console.error(err));
}

function renderBudgets() {
    const budgetList = document.getElementById('budget-list');
    if(!budgetList) return;
    budgetList.innerHTML = '';
    
    if (globalBudgets.length === 0) {
        budgetList.innerHTML = '<div class="col-12 text-center py-4 text-muted">Belum ada anggaran yang diatur.</div>';
        return;
    }
    
    const txList = window.currentFilteredTransactions || globalTransactions;
    let expenseByCategory = {};
    txList.forEach(trx => {
        if (trx.type === 'Pengeluaran') {
            const amount = parseFloat(trx.amount);
            if(expenseByCategory[trx.category]) expenseByCategory[trx.category] += amount;
            else expenseByCategory[trx.category] = amount;
        }
    });

    globalBudgets.forEach(b => {
        const limit = parseFloat(b.amount);
        const spent = expenseByCategory[b.category] || 0;
        const percentage = Math.min((spent / limit) * 100, 100).toFixed(1);
        
        let colorClass = 'bg-success';
        if (percentage >= 100) colorClass = 'bg-danger';
        else if (percentage >= 80) colorClass = 'bg-warning';

        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="border rounded-3 p-3 shadow-sm bg-white">
                <div class="d-flex justify-content-between mb-2">
                    <span class="fw-semibold text-dark">${b.category}</span>
                    <span class="small ${percentage >= 100 ? 'text-danger fw-bold' : 'text-muted'}">${percentage}%</span>
                </div>
                <div class="progress mb-2" style="height: 10px; border-radius: 10px;">
                    <div class="progress-bar ${colorClass}" role="progressbar" style="width: ${percentage}%"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Terpakai: <strong class="text-dark">${formatRupiah(spent)}</strong></span>
                    <span>Batas: <strong class="text-dark">${formatRupiah(limit)}</strong></span>
                </div>
            </div>
        `;
        budgetList.appendChild(col);
    });
}

function handleSaveBudget(e) {
    e.preventDefault();

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert("Ganti SCRIPT_URL dengan URL Web App Anda untuk menyimpan data.");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = new URLSearchParams();
    
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';

    fetch(SCRIPT_URL + '?action=saveBudget', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(resData => {
        if(resData.result === 'success') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('setBudgetModal'));
            modal.hide();
            form.reset();
            loadBudgets(); // Refresh data
        } else {
            alert("Error: " + resData.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan data.");
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    });
}

function renderGoals() {
    const goalList = document.getElementById('goal-list');
    if(!goalList) return;
    goalList.innerHTML = '';
    
    if (globalGoals.length === 0) {
        goalList.innerHTML = '<div class="col-12 text-center py-4 text-muted">Belum ada tujuan yang diatur.</div>';
        return;
    }
    
    globalGoals.forEach(g => {
        const target = parseFloat(g.target);
        const current = parseFloat(g.current);
        const percentage = Math.min((current / target) * 100, 100).toFixed(1);
        
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="border rounded-3 p-3 shadow-sm bg-white" style="cursor: pointer;" onclick="editGoal('${g.id}')">
                <div class="d-flex justify-content-between mb-2">
                    <span class="fw-semibold text-dark">${g.name}</span>
                    <span class="small text-success fw-bold">${percentage}%</span>
                </div>
                <div class="progress mb-2" style="height: 10px; border-radius: 10px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Terkumpul: <strong class="text-dark">${formatRupiah(current)}</strong></span>
                    <span>Target: <strong class="text-dark">${formatRupiah(target)}</strong></span>
                </div>
                <div class="text-end mt-2">
                    <small class="text-primary"><i class="fas fa-edit me-1"></i>Edit</small>
                </div>
            </div>
        `;
        goalList.appendChild(col);
    });
}

function openGoalModal() {
    document.getElementById('goal-form').reset();
    document.getElementById('goal-id').value = '';
    document.getElementById('goalModalTitle').innerText = 'Tambah Tujuan Baru';
    new bootstrap.Modal(document.getElementById('setGoalModal')).show();
}

function editGoal(id) {
    const goal = globalGoals.find(g => g.id.toString() === id.toString());
    if (goal) {
        document.getElementById('goal-id').value = goal.id;
        document.getElementById('goal-name').value = goal.name;
        document.getElementById('goal-target').value = goal.target;
        document.getElementById('goal-current').value = goal.current;
        document.getElementById('goalModalTitle').innerText = 'Edit Tujuan Tabungan';
        new bootstrap.Modal(document.getElementById('setGoalModal')).show();
    }
}

function handleSaveGoal(e) {
    e.preventDefault();

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert("Ganti SCRIPT_URL dengan URL Web App Anda untuk menyimpan data.");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = new URLSearchParams();
    
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';

    fetch(SCRIPT_URL + '?action=saveGoal', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(resData => {
        if(resData.result === 'success') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('setGoalModal'));
            modal.hide();
            form.reset();
            loadGoals(); // Refresh data
        } else {
            alert("Error: " + resData.message);
        }
    })
    .catch(err => {
    })
    .catch(err => console.error(err));
}

function renderBudgets() {
    const budgetList = document.getElementById('budget-list');
    if(!budgetList) return;
    budgetList.innerHTML = '';
    
    if (globalBudgets.length === 0) {
        budgetList.innerHTML = '<div class="col-12 text-center py-4 text-muted">Belum ada anggaran yang diatur.</div>';
        return;
    }
    
    const txList = window.currentFilteredTransactions || globalTransactions;
    let expenseByCategory = {};
    txList.forEach(trx => {
        if (trx.type === 'Pengeluaran') {
            const amount = parseFloat(trx.amount);
            if(expenseByCategory[trx.category]) expenseByCategory[trx.category] += amount;
            else expenseByCategory[trx.category] = amount;
        }
    });

    globalBudgets.forEach(b => {
        const limit = parseFloat(b.amount);
        const spent = expenseByCategory[b.category] || 0;
        const percentage = Math.min((spent / limit) * 100, 100).toFixed(1);
        
        let colorClass = 'bg-success';
        if (percentage >= 100) colorClass = 'bg-danger';
        else if (percentage >= 80) colorClass = 'bg-warning';

        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="border rounded-3 p-3 shadow-sm bg-white">
                <div class="d-flex justify-content-between mb-2">
                    <span class="fw-semibold text-dark">${b.category}</span>
                    <span class="small ${percentage >= 100 ? 'text-danger fw-bold' : 'text-muted'}">${percentage}%</span>
                </div>
                <div class="progress mb-2" style="height: 10px; border-radius: 10px;">
                    <div class="progress-bar ${colorClass}" role="progressbar" style="width: ${percentage}%"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Terpakai: <strong class="text-dark">${formatRupiah(spent)}</strong></span>
                    <span>Batas: <strong class="text-dark">${formatRupiah(limit)}</strong></span>
                </div>
            </div>
        `;
        budgetList.appendChild(col);
    });
}

function handleSaveBudget(e) {
    e.preventDefault();

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert("Ganti SCRIPT_URL dengan URL Web App Anda untuk menyimpan data.");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = new URLSearchParams();
    
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';

    fetch(SCRIPT_URL + '?action=saveBudget', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(resData => {
        if(resData.result === 'success') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('setBudgetModal'));
            modal.hide();
            form.reset();
            loadBudgets(); // Refresh data
        } else {
            alert("Error: " + resData.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan data.");
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    });
}

function renderGoals() {
    const goalList = document.getElementById('goal-list');
    if(!goalList) return;
    goalList.innerHTML = '';
    
    if (globalGoals.length === 0) {
        goalList.innerHTML = '<div class="col-12 text-center py-4 text-muted">Belum ada tujuan yang diatur.</div>';
        return;
    }
    
    globalGoals.forEach(g => {
        const target = parseFloat(g.target);
        const current = parseFloat(g.current);
        const percentage = Math.min((current / target) * 100, 100).toFixed(1);
        
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="border rounded-3 p-3 shadow-sm bg-white" style="cursor: pointer;" onclick="editGoal('${g.id}')">
                <div class="d-flex justify-content-between mb-2">
                    <span class="fw-semibold text-dark">${g.name}</span>
                    <span class="small text-success fw-bold">${percentage}%</span>
                </div>
                <div class="progress mb-2" style="height: 10px; border-radius: 10px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Terkumpul: <strong class="text-dark">${formatRupiah(current)}</strong></span>
                    <span>Target: <strong class="text-dark">${formatRupiah(target)}</strong></span>
                </div>
                <div class="text-end mt-2">
                    <small class="text-primary"><i class="fas fa-edit me-1"></i>Edit</small>
                </div>
            </div>
        `;
        goalList.appendChild(col);
    });
}

function openGoalModal() {
    document.getElementById('goal-form').reset();
    document.getElementById('goal-id').value = '';
    document.getElementById('goalModalTitle').innerText = 'Tambah Tujuan Baru';
    new bootstrap.Modal(document.getElementById('setGoalModal')).show();
}

function editGoal(id) {
    const goal = globalGoals.find(g => g.id.toString() === id.toString());
    if (goal) {
        document.getElementById('goal-id').value = goal.id;
        document.getElementById('goal-name').value = goal.name;
        document.getElementById('goal-target').value = goal.target;
        document.getElementById('goal-current').value = goal.current;
        document.getElementById('goalModalTitle').innerText = 'Edit Tujuan Tabungan';
        new bootstrap.Modal(document.getElementById('setGoalModal')).show();
    }
}

function handleSaveGoal(e) {
    e.preventDefault();

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert("Ganti SCRIPT_URL dengan URL Web App Anda untuk menyimpan data.");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = new URLSearchParams();
    
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';

    fetch(SCRIPT_URL + '?action=saveGoal', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(resData => {
        if(resData.result === 'success') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('setGoalModal'));
            modal.hide();
            form.reset();
            loadGoals(); // Refresh data
        } else {
            alert("Error: " + resData.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan data.");
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    });
}

// ================= DARK MODE =================
function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        updateDarkModeIcons(true);
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const isDark = currentTheme === 'dark';
    
    if (isDark) {
        document.documentElement.removeAttribute('data-bs-theme');
        localStorage.setItem('darkMode', 'false');
        updateDarkModeIcons(false);
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
        updateDarkModeIcons(true);
    }
    
    // Update chart colors if exists
    if(trendChartInstance) trendChartInstance.update();
    if(categoryChartInstance) categoryChartInstance.update();
}

function updateDarkModeIcons(isDark) {
    const mobIcon = document.getElementById('mobile-dark-icon');
    const deskIcon = document.getElementById('desktop-dark-icon');
    const deskText = document.getElementById('desktop-dark-text');
    
    if(mobIcon) {
        mobIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    if(deskIcon) {
        deskIcon.className = isDark ? 'fas fa-sun me-2' : 'fas fa-moon me-2';
        if(deskText) deskText.innerText = isDark ? 'Mode Terang' : 'Mode Gelap';
    }
}

// ================= EXPORT CSV =================
function exportToCSV() {
    const txList = window.currentFilteredTransactions || globalTransactions;
    if (txList.length === 0) {
        alert("Tidak ada data untuk diekspor pada bulan ini.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Tanggal,Jenis,Kategori,Sumber,Jumlah,Catatan\n";

    txList.forEach(row => {
        let cleanNotes = (row.notes || "").replace(/,/g, " ");
        let rowData = [row.id, row.date, row.type, row.category, row.source, row.amount, cleanNotes];
        csvContent += rowData.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filter = document.getElementById('month-filter');
    const monthStr = filter ? filter.value : "all";
    link.setAttribute("download", `laporan_keuangan_${monthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ================= KALKULATOR =================
let calcExpression = "";
function calcAction(val) {
    const display = document.getElementById('calc-display');
    const history = document.getElementById('calc-history');
    
    if (val === 'C') {
        calcExpression = "";
        display.innerText = "0";
        history.innerText = "";
    } else if (val === 'DEL') {
        calcExpression = calcExpression.toString().slice(0, -1);
        display.innerText = calcExpression || "0";
    } else if (val === '=') {
        try {
            // Replace visual operators with math operators
            let mathExpr = calcExpression.replace(/×/g, '*').replace(/÷/g, '/');
            // Handle percentages (e.g. 100+10% -> 100+(100*10/100) or just simple eval)
            // For simple eval:
            let result = new Function('return ' + mathExpr)();
            if(!Number.isInteger(result)) result = result.toFixed(2);
            history.innerText = calcExpression + " =";
            calcExpression = result.toString();
            display.innerText = calcExpression;
        } catch (e) {
            display.innerText = "Error";
            calcExpression = "";
        }
    } else if (val === '()') {
        // Simple parenthesis logic (count opens and closes)
        const openCount = (calcExpression.match(/\(/g) || []).length;
        const closeCount = (calcExpression.match(/\)/g) || []).length;
        if (openCount > closeCount) calcExpression += ")";
        else calcExpression += "(";
        display.innerText = calcExpression;
    } else {
        if (calcExpression === "0" && !isNaN(val)) calcExpression = "";
        
        let displayVal = val;
        if(val === '*') displayVal = '×';
        if(val === '/') displayVal = '÷';
        
        calcExpression += displayVal;
        display.innerText = calcExpression;
    }
}

// ================= DEBTS =================
function renderDebts() {
    const debtList = document.getElementById('debt-list');
    if(!debtList) return;
    debtList.innerHTML = '';
    
    if (globalDebts.length === 0) {
        debtList.innerHTML = '<div class="col-12 text-center py-4 text-muted">Belum ada catatan hutang/piutang.</div>';
        return;
    }
    
    globalDebts.forEach(d => {
        const total = parseFloat(d.total);
        const paid = parseFloat(d.paid);
        const remaining = total - paid;
        const percentage = Math.min((paid / total) * 100, 100).toFixed(1);
        
        let typeBadge = d.type === 'Hutang' ? '<span class="badge bg-danger">Hutang</span>' : '<span class="badge bg-success">Piutang</span>';
        let statusBadge = d.status === 'Lunas' ? '<span class="badge bg-success"><i class="fas fa-check"></i> Lunas</span>' : '<span class="badge bg-warning text-dark">Belum Lunas</span>';
        
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="border rounded-3 p-3 shadow-sm bg-white" style="cursor: pointer;" onclick="editDebt('${d.id}')">
                <div class="d-flex justify-content-between mb-2 align-items-center">
                    <span class="fw-bold text-dark fs-5">${d.name} ${typeBadge}</span>
                    ${statusBadge}
                </div>
                <div class="progress mb-2" style="height: 10px; border-radius: 10px;">
                    <div class="progress-bar ${d.type === 'Hutang' ? 'bg-danger' : 'bg-success'}" role="progressbar" style="width: ${percentage}%"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                    <span>Dibayar: <strong class="text-dark">${formatRupiah(paid)}</strong></span>
                    <span>Sisa: <strong class="text-dark">${formatRupiah(remaining)}</strong></span>
                </div>
                <div class="d-flex justify-content-between small text-muted mt-1">
                    <span>Total: ${formatRupiah(total)}</span>
                    <span class="text-primary"><i class="fas fa-edit me-1"></i>Edit</span>
                </div>
            </div>
        `;
        debtList.appendChild(col);
    });
}

function openDebtModal() {
    document.getElementById('debt-form').reset();
    document.getElementById('debt-id').value = '';
    document.getElementById('debtModalTitle').innerText = 'Catat Hutang / Piutang Baru';
    new bootstrap.Modal(document.getElementById('setDebtModal')).show();
}

function editDebt(id) {
    const debt = globalDebts.find(d => d.id.toString() === id.toString());
    if (debt) {
        document.getElementById('debt-id').value = debt.id;
        document.getElementById('debt-type').value = debt.type;
        document.getElementById('debt-name').value = debt.name;
        document.getElementById('debt-total').value = debt.total;
        document.getElementById('debt-paid').value = debt.paid;
        document.getElementById('debt-status').value = debt.status;
        document.getElementById('debtModalTitle').innerText = 'Edit Hutang / Piutang';
        new bootstrap.Modal(document.getElementById('setDebtModal')).show();
    }
}

function handleSaveDebt(e) {
    e.preventDefault();

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert("Ganti SCRIPT_URL dengan URL Web App Anda untuk menyimpan data.");
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    const data = new URLSearchParams();
    
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';

    fetch(SCRIPT_URL + '?action=saveDebt', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(resData => {
        if(resData.result === 'success') {
            const modal = bootstrap.Modal.getInstance(document.getElementById('setDebtModal'));
            modal.hide();
            form.reset();
            loadDebts();
        } else {
            alert("Error: " + resData.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan data.");
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    });
}


// ================= DELETE FUNCTIONS =================
function deleteBudget(category) {
    if(!confirm("Apakah Anda yakin ingin menghapus anggaran ini?")) return;
    fetch(SCRIPT_URL + '?action=deleteBudget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'category=' + encodeURIComponent(category)
    })
    .then(res => res.json())
    .then(data => {
        if(data.result === 'success') loadBudgets();
        else alert("Error: " + data.message);
    }).catch(err => console.error(err));
}

function deleteGoal(id) {
    if(!confirm("Apakah Anda yakin ingin menghapus tujuan/tabungan ini?")) return;
    fetch(SCRIPT_URL + '?action=deleteGoal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + encodeURIComponent(id)
    })
    .then(res => res.json())
    .then(data => {
        if(data.result === 'success') loadGoals();
        else alert("Error: " + data.message);
    }).catch(err => console.error(err));
}

function deleteDebt(id) {
    if(!confirm("Apakah Anda yakin ingin menghapus catatan ini?")) return;
    fetch(SCRIPT_URL + '?action=deleteDebt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + encodeURIComponent(id)
    })
    .then(res => res.json())
    .then(data => {
        if(data.result === 'success') loadDebts();
        else alert("Error: " + data.message);
    }).catch(err => console.error(err));
}

// ================= PIN SYSTEM =================
let isSettingNewPin = false;
let globalSavedPin = "";

function initPin() {
    const pinScreen = document.getElementById('pin-screen');
    const pinMessage = document.getElementById('pin-message');
    const pinBtn = document.getElementById('pin-btn');

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        pinScreen.style.setProperty('display', 'none', 'important');
        return;
    }

    pinMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat sistem keamanan...';
    pinScreen.style.setProperty('display', 'flex', 'important');

    fetch(SCRIPT_URL + '?action=getPin')
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                globalSavedPin = data.pin;
                if (!globalSavedPin || globalSavedPin === "") {
                    // Mode Set PIN Baru
                    isSettingNewPin = true;
                    pinMessage.innerText = 'Buat PIN 4-6 digit untuk mengamankan aplikasi';
                    pinBtn.innerText = 'Simpan PIN';
                } else {
                    // Mode Verifikasi PIN
                    isSettingNewPin = false;
                    pinMessage.innerText = 'Masukkan PIN Anda';
                    pinBtn.innerText = 'Masuk';
                }
            } else {
                pinMessage.innerText = 'Gagal memuat sistem keamanan.';
            }
        })
        .catch(err => {
            console.error(err);
            pinMessage.innerText = 'Koneksi gagal. Coba muat ulang.';
        });
}

function verifyPin() {
    const pinInput = document.getElementById('pin-input');
    const pinValue = pinInput.value;
    const pinMessage = document.getElementById('pin-message');
    const pinBtn = document.getElementById('pin-btn');
    
    if (pinValue.length < 4) {
        pinMessage.innerText = 'PIN minimal 4 digit!';
        pinMessage.classList.add('text-danger');
        setTimeout(() => pinMessage.classList.remove('text-danger'), 1500);
        return;
    }

    if (isSettingNewPin) {
        const originalBtnText = pinBtn.innerText;
        pinBtn.disabled = true;
        pinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        
        fetch(SCRIPT_URL + '?action=setPin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'pin=' + encodeURIComponent(pinValue)
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                globalSavedPin = pinValue;
                unlockApp();
            } else {
                alert("Gagal menyimpan PIN: " + data.message);
            }
        })
        .finally(() => {
            pinBtn.disabled = false;
            pinBtn.innerText = originalBtnText;
        });
        
    } else {
        if (pinValue === globalSavedPin) {
            unlockApp();
        } else {
            pinInput.value = '';
            pinMessage.innerText = 'PIN Salah! Coba lagi.';
            pinMessage.classList.add('text-danger');
            pinInput.classList.add('is-invalid');
            
            setTimeout(() => {
                pinMessage.innerText = 'Masukkan PIN Anda';
                pinMessage.classList.remove('text-danger');
                pinInput.classList.remove('is-invalid');
            }, 2000);
        }
    }
}

function unlockApp() {
    const pinScreen = document.getElementById('pin-screen');
    pinScreen.style.setProperty('display', 'none', 'important');
    
    // Load data if haven't loaded yet
    if (globalTransactions.length === 0 && SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        loadTransactions();
        loadBudgets();
        loadGoals();
        loadDebts();
    }
}

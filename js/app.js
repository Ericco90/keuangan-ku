// Konfigurasi URL Web App Google Apps Script
// GANTI URL INI DENGAN URL WEB APP MILIK ANDA SETELAH DEPLOY backend.gs
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx29s3PIEw9OyhXnNK9-RqEB3PmVXA1Es6MisCg-jSeCNjAoq8PHd-mbS6--qoNgE8yaA/exec';

// Kategori default
const categories = {
    Income: ['Gaji', 'Bonus', 'Hasil Usaha', 'Pemberian', 'Lainnya'],
    Expense: ['Makanan & Minuman', 'Transportasi', 'Tagihan & Utilitas', 'Belanja', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya']
};

let expenseChartInstance = null;
let trendChartInstance = null;

function switchView(view) {
    const dashboardView = document.getElementById('view-dashboard');
    const analyticsView = document.getElementById('view-analytics');
    const navDashboard = document.getElementById('nav-dashboard');
    const navAnalytics = document.getElementById('nav-analytics');
    
    // Mobile Nav
    const mobNavDashboard = document.getElementById('mob-nav-dashboard');
    const mobNavAnalytics = document.getElementById('mob-nav-analytics');
    
    // Update Title
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');

    if (view === 'dashboard') {
        dashboardView.classList.remove('d-none');
        analyticsView.classList.add('d-none');
        if(navDashboard) navDashboard.classList.add('active');
        if(navAnalytics) navAnalytics.classList.remove('active');
        if(mobNavDashboard) mobNavDashboard.classList.add('active');
        if(mobNavAnalytics) mobNavAnalytics.classList.remove('active');
        
        title.innerText = 'Dashboard Keuangan';
        subtitle.innerText = 'Ringkasan kondisi finansial Anda.';
    } else {
        dashboardView.classList.add('d-none');
        analyticsView.classList.remove('d-none');
        if(navDashboard) navDashboard.classList.remove('active');
        if(navAnalytics) navAnalytics.classList.add('active');
        if(mobNavDashboard) mobNavDashboard.classList.remove('active');
        if(mobNavAnalytics) mobNavAnalytics.classList.add('active');
        
        title.innerText = 'Analitik & Grafik';
        subtitle.innerText = 'Wawasan detail mengenai arus kas Anda.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Cek konfigurasi API
    if (SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        document.getElementById('api-alert').style.display = 'none';
        loadTransactions();
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
    form.addEventListener('submit', handleAddTransaction);
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
                renderDashboard(data.data);
            } else {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${data.message}</td></tr>`;
            }
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Terjadi kesalahan saat memuat data.</td></tr>';
        });
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

        // Hitung total
        if (isIncome) {
            totalIncome += amount;
        } else {
            totalExpense += amount;
            // Kumpulkan data untuk chart kategori
            if (expenseByCategory[trx.category]) {
                expenseByCategory[trx.category] += amount;
            } else {
                expenseByCategory[trx.category] = amount;
            }
        }

        // Render tabel
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="fw-semibold text-dark">${formatDate(trx.date)}</div>
            </td>
            <td>
                <span class="badge ${isIncome ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill">
                    ${trx.category}
                </span>
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

    renderChart(expenseByCategory);
    renderTrendChart(trendData);
}

function renderChart(dataObj) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const noDataEl = document.getElementById('no-chart-data');
    const chartEl = document.getElementById('expenseChart');

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

    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    expenseChartInstance = new Chart(ctx, {
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

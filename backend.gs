// Backend API untuk Aplikasi Manajemen Keuangan Pribadi
// Deploy script ini sebagai Web App (Aplikasi Web) dengan akses "Siapa Saja" (Anyone)

const SCRIPT_PROP = PropertiesService.getScriptProperties();

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
  
  // Create sheet if it doesn't exist
  if (!doc.getSheetByName('transactions')) {
    const sheet = doc.insertSheet('transactions');
    // Header row
    sheet.appendRow(['id', 'date', 'type', 'amount', 'category', 'source', 'notes']);
    sheet.getRange("A1:G1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'getTransactions') {
      return getTransactions();
    } else {
      return ContentService.createTextOutput(JSON.stringify({result: "error", message: "Invalid action"})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'addTransaction') {
      return addTransaction(e.parameter);
    } else if (action === 'deleteTransaction') {
      return deleteTransaction(e.parameter.id);
    } else {
      return ContentService.createTextOutput(JSON.stringify({result: "error", message: "Invalid action"})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getTransactions() {
  const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  const sheet = doc.getSheetByName('transactions');
  const data = sheet.getDataRange().getValues();
  
  const result = [];
  // Start from index 1 to skip header
  for (let i = 1; i < data.length; i++) {
    result.push({
      id: data[i][0],
      date: data[i][1],
      type: data[i][2],
      amount: data[i][3],
      category: data[i][4],
      source: data[i][5],
      notes: data[i][6]
    });
  }
  
  // Sort descending by date (newest first)
  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return ContentService.createTextOutput(JSON.stringify({result: "success", data: result})).setMimeType(ContentService.MimeType.JSON);
}

function addTransaction(param) {
  const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  const sheet = doc.getSheetByName('transactions');
  
  // Generate unique ID
  const id = new Date().getTime().toString() + Math.floor(Math.random() * 1000);
  
  sheet.appendRow([
    id,
    param.date,
    param.type,
    param.amount,
    param.category,
    param.source || '-',
    param.notes
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({result: "success", message: "Transaksi Berhasil Disimpan"})).setMimeType(ContentService.MimeType.JSON);
}

function deleteTransaction(id) {
  const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  const sheet = doc.getSheetByName('transactions');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1); // +1 because array is 0-indexed, rows are 1-indexed
      return ContentService.createTextOutput(JSON.stringify({result: "success", message: "Transaksi Berhasil Dihapus"})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({result: "error", message: "Transaksi tidak ditemukan"})).setMimeType(ContentService.MimeType.JSON);
}

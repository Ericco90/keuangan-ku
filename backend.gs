// Backend API untuk Aplikasi Manajemen Keuangan Pribadi
// Deploy script ini sebagai Web App (Aplikasi Web) dengan akses "Siapa Saja" (Anyone)

const SCRIPT_PROP = PropertiesService.getScriptProperties();

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
  
  // Create sheets if they don't exist
  if (!doc.getSheetByName('transactions')) {
    const sheet = doc.insertSheet('transactions');
    sheet.appendRow(['id', 'date', 'type', 'amount', 'category', 'source', 'notes']);
    sheet.getRange("A1:G1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  
  if (!doc.getSheetByName('budgets')) {
    const sheet = doc.insertSheet('budgets');
    sheet.appendRow(['category', 'amount']);
    sheet.getRange("A1:B1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  
  if (!doc.getSheetByName('goals')) {
    const sheet = doc.insertSheet('goals');
    sheet.appendRow(['id', 'name', 'target', 'current']);
    sheet.getRange("A1:D1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    if (action === 'getTransactions') {
      return getTransactions();
    } else if (action === 'getBudgets') {
      return getBudgets();
    } else if (action === 'getGoals') {
      return getGoals();
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
    } else if (action === 'saveBudget') {
      return saveBudget(e.parameter);
    } else if (action === 'saveGoal') {
      return saveGoal(e.parameter);
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

function getBudgets() {
  const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  const sheet = doc.getSheetByName('budgets');
  
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({result: "success", data: []})).setMimeType(ContentService.MimeType.JSON);
  
  const data = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    result.push({
      category: data[i][0],
      amount: data[i][1]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({result: "success", data: result})).setMimeType(ContentService.MimeType.JSON);
}

function saveBudget(param) {
  const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  let sheet = doc.getSheetByName('budgets');
  
  if (!sheet) {
    sheet = doc.insertSheet('budgets');
    sheet.appendRow(['category', 'amount']);
  }
  
  const data = sheet.getDataRange().getValues();
  let found = false;
  
  // Update if exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === param.category) {
      sheet.getRange(i + 1, 2).setValue(param.amount);
      found = true;
      break;
    }
  }
  
  // Append if new
  if (!found) {
    sheet.appendRow([param.category, param.amount]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({result: "success", message: "Anggaran Berhasil Disimpan"})).setMimeType(ContentService.MimeType.JSON);
}

function getGoals() {
  const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  const sheet = doc.getSheetByName('goals');
  
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({result: "success", data: []})).setMimeType(ContentService.MimeType.JSON);
  
  const data = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    result.push({
      id: data[i][0],
      name: data[i][1],
      target: data[i][2],
      current: data[i][3]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({result: "success", data: result})).setMimeType(ContentService.MimeType.JSON);
}

function saveGoal(param) {
  const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  let sheet = doc.getSheetByName('goals');
  
  if (!sheet) {
    sheet = doc.insertSheet('goals');
    sheet.appendRow(['id', 'name', 'target', 'current']);
  }
  
  const data = sheet.getDataRange().getValues();
  let found = false;
  
  if (param.id) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === param.id.toString()) {
        sheet.getRange(i + 1, 2).setValue(param.name);
        sheet.getRange(i + 1, 3).setValue(param.target);
        sheet.getRange(i + 1, 4).setValue(param.current);
        found = true;
        break;
      }
    }
  }
  
  if (!found) {
    const newId = new Date().getTime().toString() + Math.floor(Math.random() * 1000);
    sheet.appendRow([newId, param.name, param.target, param.current]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({result: "success", message: "Tujuan Berhasil Disimpan"})).setMimeType(ContentService.MimeType.JSON);
}

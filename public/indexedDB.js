//browser support
indexedDB = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB;

if (!indexedDB) {
    const message = 'Warning: Your browser will not support offline mode',
    className = 'danger';

    showAlert(message, className);
    setTimeout(() => clearAlert(), 3000);
} 
    
const request = indexedDB.open('budgetIDB', 1);
let db;

request.onupgradeneeded = () => {
    db = request.result;
    db.createObjectStore('offlineStore', { autoIncrement: true });
};

request.onsuccess = () => {
    db = request.result;

    if (navigator.onLine) {
        accessDB();
    }

    // catch all bubbled DB errors.
    db.onerror = (e) => {
        const message = "Database error: " + e.target.errorCode,
        className = 'danger';

        showAlert(message, className);
        setTimeout(() => clearAlert(), 10000);
    }
};

request.onerror = () => {
    const message = 'Permission is required for access to your offline database.',
        className = 'danger';

    showAlert(message, className);
    setTimeout(() => clearAlert(), 10000);
};

function saveRecord(record) {
    const store = db.transaction(['offlineStore'], 'readwrite').objectStore('offlineStore');
    store.add(record);
 }

function accessDB() {
   const tx = db.transaction(['offlineStore'], 'readwrite'),
    store = tx.objectStore('offlineStore'),
    getIDB = store.getAll();

    getIDB.onsuccess = async () => {
       if(getIDB.result.length > 0) {
           await fetch('/api/transaction/bulk', {
               method: 'POST',
               body: JSON.stringify(getIDB.result),
               headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
              }
           })
           await tx.done;
           const store = db.transaction(['offlineStore'], 'readwrite').objectStore('offlineStore');
           store.clear();
       }
   }
}

// listen for offline mode and send message to the DOM. 
window.addEventListener('offline', () => {
    const message = "Budget Tracker is running in offline mode.. but don't worry.",
        className = 'warning';
  
      showAlert(message, className);
  });

// listen for online return
 window.addEventListener('online', () => {
     clearAlert();
     accessDB();
 });

 //show messages
 function showAlert(message, className){
    clearAlert();

    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.appendChild(document.createTextNode(message));
  
    const container = document.querySelector('.total');

    //insert alert
    container.parentNode.insertBefore(div, container.nextSibling);
}

//clear messages
function clearAlert() {
    const currentAlert = document.querySelector('.message');
    if(currentAlert){
        currentAlert.remove();
    }
}
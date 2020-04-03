let request = indexedDB.open('budgetIDB', 1),
    db,
    tx,
    store;

request.onupgradeneeded = function() {
    const db = request.result;
        db.createObjectStore('offlineStore', { autoIncrement: true });
};


request.onerror = function(e) {
    console.log('Database error: ' + e.target.errorCode);
  };


request.onsuccess = () => {
    db = request.result;

    if (navigator.onLine) {
        accessDB();
    }
};

function saveRecord(record) {
    const store = db.transaction(['offlineStore'], 'readwrite').objectStore('offlineStore');
    store.add(record);
 }

function accessDB() {
   tx = db.transaction(['offlineStore'], 'readwrite');
   store = tx.objectStore('offlineStore');

   const getIDB = store.getAll();

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
           const store = db.transaction(['offlineStore'], 'readwrite').objectStore('offlineStore');
           store.clear();
       }
   }
}

 window.addEventListener('online', accessDB);
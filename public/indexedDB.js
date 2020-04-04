const request = indexedDB.open('budgetIDB', 1);
let  db;

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

 window.addEventListener('online', accessDB);

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
function clearAlert(){
    const currentAlert = document.querySelector('.message');
    if(currentAlert){
        currentAlert.remove();
    }
}
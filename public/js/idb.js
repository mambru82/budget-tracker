let db;

const request = indexedDB.open('budget-tracker', 1)

request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;

    db.createObjectStore('new_entry', { autoIncrement: true });

}

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadEntry()
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode)
}

function saveRecord(record) {
    //open a new transaction with the databsae with read and write permission
    const transaction = db.transaction(['new_entry'], 'readwrite');

    // access the object store for new_entry
    const budgetTrackerObjectStore = transaction.objectStore('new_entry');

    //add record to your store with add method
    budgetTrackerObjectStore.add(record)
}

function uploadEntry() {
    //open a transaction on db
    const transaction = db.transaction(['new_entry'], 'readwrite');

    const budgetTrackerObjectStore = transaction.objectStore('new_entry');

    //get all recrods from store and set to a variable
    const getAll = budgetTrackerObjectStore.getAll();

    getAll.onsuccess = function() {

        if(getAll.result.length>0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse)
                }
                // open one more transaction
                const transaction = db.transaction(['new_entry'], 'readwrite');

                const budgetTrackerObjectStore = transaction.objectStore('new_entry');

                budgetTrackerObjectStore.clear();

                alert('All new entries have been submitted!');
            })
            .catch(err => {
                console.log(err)
            })
        }
    }
}

window.addEventListener('online', uploadEntry)
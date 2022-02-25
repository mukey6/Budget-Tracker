let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("new_entry", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  db = event.target.result;

  // check to see if app is online(navigator??)
  if (navigator.onLine) {
    addBudget();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_entry"], "readwrite");

  // access the object store
  const budgetObjectStore = transaction.objectStore("new_entry");

  // add record to your store with add method
  budgetObjectStore.add(record);
}

function addBudget() {
  // open a transaction on your db
  const transaction = db.transaction(["new_entry"], "readwrite");

  // access your object store
  const budgetObjectStore = transaction.objectStore("new_entry");

  // get all records from store and set to a variable
  const getAll = budgetObjectStore.getAll();

  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(["new_entry"], "readwrite");
          // access the new_pizza object store
          const budgetObjectStore = transaction.objectStore("new_entry");
          // clear all items in your store
          budgetObjectStore.clear();

          alert("All saved items has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", addBudget);

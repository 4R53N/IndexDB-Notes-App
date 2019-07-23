// Create needed constants
const list = document.querySelector('ul');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');

// Create an instance of a db object for us to store the open database in
let db;

window.onload = function() {
    // Open our database; it is created if it doesn't already exist
    // (see onupgradeneeded below)
    let request = window.indexedDB.open('notes_db', 1);

request.onerror = function(){
    console.log('Unexpected shit happened!');
};

request.onsuccess = function(){
    console.log('Tight!');
    
    db = request.result;

    displayData();
};

request.onupgradeneeded = function(e){
    let db = e.target.result;

    let objectStore = db.createObjectStore('notes_os',{keyPath: 'id', autoIncrement:true});

    objectStore.createIndex('title', 'title', {unique: false});
    objectStore.createIndex('body', 'body', {unique: false});

    console.log('Database setup complete');

};

form.onsubmit = addData;

function addData(e){
    e.preventDefault();

    let newItem = { title: titleInput.value, body: bodyInput.value };

    // open a read/write db transaction, ready for adding the data
    let transaction = db.transaction(['notes_os'], 'readwrite');

    // call an object store that's already been added to the database
     let objectStore = transaction.objectStore('notes_os');

     var request = objectStore.add(newItem);

     
     request.onsuccess - function() {
        titleInput.value = '';
        bodyInput.value = '';
     } 

     transaction.oncomplete = function(){
        console.log('All good with transaction');
        displayData();
     }

     transaction.onerror = function(){
         console.log('Antoher shit!');
     }
}

function displayData(){
    while(list.firstChild){
        list.removeChild(list.firstChild);
    }

    let objectStore = db.transaction('notes_os').objectStore('notes_os');
    objectStore.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if(cursor){
            let listItem = document.createElement('li');
            let h3 = document.createElement('h3');
            let para = document.createElement('p');

            listItem.appendChild(h3);
            listItem.appendChild(para);
            list.appendChild(listItem);

            h3.textContent = cursor.value.title;
            para.textContent = cursor.value.body;

            listItem.setAttribute('data-note-id', cursor.value.id);

            let deleteBtn = document.createElement('button');
            listItem.appendChild(deleteBtn);
            deleteBtn.textContent = "Delete";

            deleteBtn.onclick = deleteItem;

            cursor.continue();
        }
        else{
            if(!list.firstChild){
                let listItem = document.createElement('li');
                listItem.textContent = 'No notes';
                list.appendChild(listItem);
            }

            console.log('All displayed dawg');
        }
    }
}

function deleteItem(e){
    let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));

    let transaction = db.transaction('notes_os', 'readwrite');
    let objectStore = transaction.objectStore('notes_os');
    let request = objectStore.delete(noteId);

    transaction.oncomplete = function(){
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    };
    console.log('Note with id ' + noteId + ' is deleted');

    if(!list.firstChild){
        let listItem = document.createElement('li');
        listItem.textContent = 'No notes';
        list.appendChild(listItem);
    }
}

};


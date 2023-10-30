const books = [];
const RENDER_EVENT = "render-book";
const BOOK_ID = "ItemId";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

window.addEventListener("DOMContentLoaded", () => {
  const addBookForm = document.getElementById("add-book-form");
  addBookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  maxYear();
});

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
  const unFinished = document.getElementById("unfinished");
  unFinished.innerHTML = "";
  const finished = document.getElementById("finished");
  finished.innerHTML = "";
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      unFinished.append(bookElement);
    } else {
      finished.append(bookElement);
    }
  }
});

document.getElementById("search").addEventListener("submit", function (event) {
  event.preventDefault();
  const searchBook = document
    .getElementById("search-title")
    .value.toLowerCase();
  const bookList = document.querySelectorAll(".card-title");
  for (buku of bookList) {
    if (buku.innerText.toLowerCase().includes(searchBook)) {
      buku.parentElement.style.display = "block";
    } else {
      buku.parentElement.style.display = "none";
    }
  }
});

function addBook() {
  const title = document.getElementById("title");
  const author = document.getElementById("author");
  const year = document.getElementById("published-year");
  const isComplete = document.querySelector("#isComplete");
  const firstNumberOfYear = year.value.split('')[0];
  if (title.value != "" && author.value != "" && year.value != "") {
    if (firstNumberOfYear != 0) {
      const bookObject = generateBookObject(
        title.value,
        author.value,
        year.value,
        isComplete.checked
      );

      books.push(bookObject);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      console.log("books added");

      Swal.fire({
				title: 'Success!',
				text: 'Book added to the shelf!',
				icon: 'success',
				confirmButtonText: 'OK',
				buttonsStyling: false,
				customClass: {
					confirmButton: 'btn finished-btn swal-btn',
				},
			});
    }
    else{
      Swal.fire({
				title: 'Invalid Input',
				text: 'Published year first number cannot be 0',
				icon: 'warning',
				confirmButtonText: 'OK',
				buttonsStyling: false,
				customClass: {
					confirmButton: 'btn finished-btn swal-btn',
				},
			});
    }
  }else{
    Swal.fire({
			title: 'Empty Field',
			text: 'Please fill out the form',
			icon: 'warning',
			confirmButtonText: 'OK',
			buttonsStyling: false,
			customClass: {
				confirmButton: 'btn finished-btn swal-btn',
			},
		});
  }
}

const maxYear = () => {
	const publishedInput = document.getElementById('published-year');
	const date = new Date();
	const year = date.getFullYear();

	publishedInput.setAttribute('min', 0);
	publishedInput.setAttribute('max', year);
};

function generateBookObject(title, author, year, isComplete) {
  return {
    id: +new Date(),
    title: title,
    author: author,
    year: year,
    isComplete: isComplete,
  };
}

function makeBook(bookObject) {
  const container = document.createElement("div");
  container.classList.add("card", "book-detail", "mt-4");
  container.innerHTML = `<h4 class="card-title">${bookObject.title}</h4>
                        <div class="author">Author      : ${bookObject.author}</div>
                        <div class="year">Tahun Terbit  : ${bookObject.year}</div>`;
  const btnContainer = document.createElement("div");
  btnContainer.classList.add(
    "btn-container",
    "action",
    "d-flex",
    "gap-3",
    "justify-content-end"
  );
  if (!bookObject.isComplete) {
    btnContainer.append(
      unfinishedButton(bookObject.id),
      removeButton(bookObject.id)
    );
  } else {
    btnContainer.append(
      finishedButton(bookObject.id),
      removeButton(bookObject.id)
    );
  }
  container.append(btnContainer);
  return container;
}

function unfinishedButton(bookID) {
  const button = document.createElement("button");
  button.classList.add("btn", "finish-btn", "btn-primary");

  button.innerText = `Selesai Dibaca`;

  button.addEventListener("click", function () {
    moveToFinished(bookID);
  });

  return button;
}

function finishedButton(bookID) {
  const button = document.createElement("button");
  button.classList.add("btn", "unfinish-btn", "btn-primary");

  button.innerText = `Belum Dibaca`;

  button.addEventListener("click", function () {
    moveToUnfinished(bookID);
  });

  return button;
}

function removeButton(bookID) {
  const button = document.createElement("button");
  button.classList.add("btn", "delete-btn","btn-danger");

  button.innerText = `Hapus Buku`;

  button.addEventListener("click", function () {
    removeBook(bookID);
  });

  return button;
}

function moveToFinished(bookID) {
  const bookTarget = findBook(bookID);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  console.log(bookTarget.isComplete);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveToUnfinished(bookID) {
  const bookTarget = findBook(bookID);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookID) {
  const bookTarget = findBookIndex(bookID);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  console.log("book removed");
}

function findBook(bookID) {
  for (const bookItem of books) {
    if (bookItem.id === bookID) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookID) {
  for (const index in books) {
    if (books[index].id === bookID) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

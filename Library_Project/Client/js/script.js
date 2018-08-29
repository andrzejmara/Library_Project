$(function () {
    //////////////////////////// CONFIGURE API HERE   
    const apiURL = "http://localhost:55693/api/";

    /////////////////////////////////////////////////////////////////////
    /////////////////  BOOOOOKS  ///////////////////////////
    //handling of the form
    getAllBooks();
    var formButton = $("#succ");
    formButton.on("click", function (event) {
        event.preventDefault();

        let bookTitle = $(".formTitle").val();
        let bookAuthor = $(".formAuthor").val();
        if (typeof bookTitle === 'undefined' || bookTitle == '') {
            alertify.alert('Błąd', 'Nie podałaś/eś Tytułu!', function () { alertify.error(';('); });
            return null;
        }
        if (typeof bookAuthor === 'undefined' || bookAuthor == '') {
            alertify.alert('Błąd', 'Nie podałaś/eś Autora!', function () { alertify.error(';('); });
            return null;
        }
        var formBook = {
            Title: bookTitle,
            Author: bookAuthor
        }
        if (formButton.text() == "Edytuj") {
            editBook(formButton.attr("thisBook"), formBook);
        } else {
            addBook(formBook);
        }
    });
    //Handling of the Edit Button
    $("#booksTable").on("click", "button.editBook", function (e) {
        var id = $(this).closest("tr").attr("data-book-id");
        var title = $(this).closest("tr").children().eq(0).text();
        var author = $(this).closest("tr").children().eq(1).text();
        $(".formTitle").attr("placeholder", title);
        $(".formAuthor").attr("placeholder", author);
        formButton.attr('class', 'btn btn-primary btn-sm');
        formButton.attr('thisBook', id);
        formButton.text("Edytuj");
        var goBackButton = $(`<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>`);
        goBackButton.on('click', function () { resetForm() });
        if (formButton.siblings().length < 3) {
            formButton.after(goBackButton);
        }
    });
    // Handling of the Delete Button
    $("#booksTable").on("click", "button.deleteBook", function (e) {
        console.log("DELETE ", this);
        var id = $(this).closest("tr").attr("data-book-id");
        alertify.confirm('Usuwanie', 'Na pewno chcesz usunąć tę książke?', function () { deleteBook(id) }, function () { });
    })
    //HANDLING OF THE LEND BUTTON
    $("#booksTable").on("click", "button.lendBook", function (e) {
        console.log("LEND typu POST ", this);
        var bookID = $(this).closest("tr").attr("data-book-id");
        alertify.alert('Wybierz czytelnika', `<table class="table table-hover table-sm" id=chooseTable>
        <thead>
            <tr>
                <th>Imię i Nazwisko</th>
                <th>Opcje</th>
            </tr>
        </thead>
        <tbody> 
        </tbody>
    </table>`, function () { $("#chooseTable > tbody").empty() });
        getAllReadersForChoosing();
        $("#chooseTable").on("click", "button.selectBook", function (e) {
            var readerID = $(this).closest("tr").attr("chosenOneBook");
            chooseBook(readerID, bookID);
        });
    });
    //END Handling of LEND BUTTON FOR BOOKS 
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////        READERS TABLE      /////////////////////////////////
    getAllReaders();
    var readerSubmit = $("#readerSubmit");
    //Validation and handling of the form
    readerSubmit.on("click", function (event) {
        event.preventDefault();
        let readerName = $(".readerFormName").val();
        let readerAge = $(".readerFormAge").val();
        if (typeof readerName === 'undefined' || readerName == '') {
            alertify.alert('Błąd', 'Nie podałaś/eś Imienia i Nazwiska!', function () { alertify.error(';('); });
            return null;
        }
        if (typeof readerAge === 'undefined' || readerAge == '') {
            alertify.alert('Błąd', 'Nie podałaś/eś Wieku!', function () { alertify.error(';('); });
            return null;
        }
        var newReader = {
            Name: readerName,
            Age: readerAge
        }
        if (readerSubmit.text() == "Edytuj") {
            editReader(readerSubmit.attr("thisReader"), newReader);
        } else {
            addReader(newReader);
        }
    });
    $("#readersTable").on("click", "button.editReader", function (e) {
        var id = $(this).closest("tr").attr("readerID");
        var name = $(this).closest("tr").children().eq(0).text();
        var age = $(this).closest("tr").children().eq(1).text();
        $(".readerName").attr("placeholder", name);
        $(".readerAge").attr("placeholder", age);
        readerSubmit.attr('class', 'btn btn-primary btn-sm');
        readerSubmit.attr('thisReader', id);
        readerSubmit.text("Edytuj");
        var readerGoBackButton = $(`<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>`);
        readerGoBackButton.on('click', function () { resetReaderForm() });
        if (readerSubmit.siblings().length < 3) {
            readerSubmit.after(readerGoBackButton);
        }
    });
    $("#readersTable").on("click", "button.deleteReader", function (e) {
        console.log("DELETE ", this);
        var id = $(this).closest("tr").attr("readerID");
        alertify.confirm('Usuwanie', 'Na pewno chcesz usunąć tego użytkownika?', function () { deleteReader(id) }, function () { });
    })
    //Handling of the Lend Button  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    $("#readersTable").on("click", "button.lendBook", function (e) {
        var readerID = $(this).closest("tr").attr("readerID");
        alertify.alert('Wybierz książkę', `<table class="table table-hover table-sm" id=chooseTable>
        <thead>
            <tr>
                <th>Tytuł</th>
                <th>Autor</th>
                <th>Opcje</th>
            </tr>
        </thead>
        <tbody>
           
        </tbody>
    </table>`, function () { $("#chooseTable > tbody").empty() });
        getAllBooksForChoosing();
        $("#chooseTable").on("click", "button.selectBook", function (e) {
            var bookID = $(this).closest("tr").attr("chosenOneBook");
            chooseBook(readerID, bookID);
        });
    })

    function chooseBook(readerID, bookID) {
        var lendObject = {
            BookID: bookID,
            ReaderID: readerID,
            LendDate: getDateNow()
        }
        lendBook(lendObject);
    }
    // End of lend button

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////// LENDING ////////////////////////////////////////////////////////////
    getAllLending();
    function getAllBooksForChoosing() {
        $.ajax({
            url: apiURL + "books/"
        }).done(function (response) {
            chooseBookList(response);
        }).fail(function (error) {
            alertify.error('Błąd podczas pobierania książek');
        })
    }
    function chooseBookList(books) {
        var alertTable = $("body > div.alertify.ajs-movable.ajs-closable.ajs-pinnable.ajs-pulse > div.ajs-modal > div > div.ajs-body > div").find("tbody");
        for (var i = 0; i < books.length; i++) {
            var newRow = $("<tr chosenOneBook=" + books[i].ID + "></tr>");
            var titleCol = $("<td>").text(books[i].Title);
            titleCol.appendTo(newRow)
            var authorCol = $("<td>").text(books[i].Author);
            var chooseButton = $(`<td><div class="button-group">
                  <button class="btn btn-success btn-sm selectBook">Wybierz</button>
              </div>
          </td>`);
            authorCol.appendTo(newRow);
            chooseButton.appendTo(newRow);
            newRow.appendTo(alertTable)
        }
    }
    function getAllReadersForChoosing() {
        $.ajax({
            url: apiURL + "readers/"
        }).done(function (response) {
            chooseReaderList(response);
        }).fail(function (error) {
            alertify.error('Błąd podczas pobierania czytelników');
        })
    }
    function chooseReaderList(readers) {
        var alertTable = $("body > div.alertify.ajs-movable.ajs-closable.ajs-pinnable.ajs-pulse > div.ajs-modal > div > div.ajs-body > div").find("tbody");
        for (var i = 0; i < readers.length; i++) {
            var newRow = $("<tr chosenOneBook=" + readers[i].ID + "></tr>");
            var nameCol = $("<td>").text(readers[i].Name);
            nameCol.appendTo(newRow);
            var chooseButton = $(`<td><div class="button-group">
                  <button class="btn btn-success btn-sm selectBook">Wybierz</button>
              </div>
          </td>`);
            chooseButton.appendTo(newRow);
            newRow.appendTo(alertTable)
        }
    }
    function deleteLending(deleteLending) {
        $.ajax({
            url: apiURL + "lend/" + deleteLending,
            type: "DELETE"
        }).done(function (resp) {
            renderLending(deleteLending, 'delete');
            alertify.success('Oddano książke');
        }).fail(function (err) {
        })
    }


    ////////////////////////////// AJAX GETTERS
    function getAllBooks() {
        $.ajax({
            url: apiURL + "books/"
        }).done(function (response) {
            renderAllBooks(response);
        }).fail(function (error) {
            alertify.error('Błąd podczas pobierania książek');
        })
    }

    function getBook(id, whatFor) {
        $.ajax({
            url: apiURL + "books/" + id
        }).done(function (response) {
            renderBook(id, whatFor, response);
        }).fail(function (error) {
            alertify.error('Błąd podczas pobierania książki');
        })
    }

    function getAllReaders() {
        $.ajax({
            url: apiURL + "readers/"
        }).done(function (resp) {
            renderAllReaders(resp);
        }).fail(function (err) {
            alertify.error('Błąd podczas pobierania użytkowników');
        })
    };

    function getReader(id, whatFor) {
        $.ajax({
            url: apiURL + "readers/" + id
        }).done(function (response) {
            renderReader(id, whatFor, response);
        }).fail(function (error) {
            alertify.error('Błąd podczas pobierania użytkownika');
        })
    }
    function getAllLending() {
        $.ajax({
            url: apiURL + "lend/"
        }).done(function (resp) {
            renderAllLending(resp);
        }).fail(function (err) {
            alertify.error('Błąd podczas pobierania wypożyczeń');
        })
    };

    ///////////////////////// RENDERERS
    /// books renderers
    function renderAllBooks(books) {
        var booksTable = $("#booksTable").find("tbody");
        booksTable.html("");
        for (var i = 0; i < books.length; i++) {
            var newRow = $("<tr data-book-id=" + books[i].ID + "></tr>");
            var titleCol = $("<td>").text(books[i].Title);
            titleCol.appendTo(newRow)
            var authorCol = $("<td>").text(books[i].Author);
            authorCol.appendTo(newRow)
            var buttons = $(`<td><div class="button-group">
                  <button class="btn btn-primary btn-sm editBook">Edytuj</button>
                  <button class="btn btn-danger btn-sm deleteBook">Usuń</button>
                  <button class="btn btn-info btn-sm lendBook">Wypożycz</button>
              </div>
          </td>`);
            buttons.appendTo(newRow);

            newRow.appendTo(booksTable)
        }
    }
    function renderBook(id, whatFor, book) {
        if (whatFor == 'edit') {
            let bookEntry = $("[data-book-id =" + id + "]");
            bookEntry.children().eq(0).replaceWith("<td>" + book.Title + "</td>");
            bookEntry.children().eq(1).replaceWith("<td>" + book.Author + "</td>");
        } else if (whatFor == 'delete') {
            let bookEntry = $("[data-book-id =" + id + "]");
            bookEntry.remove();
        } else if (whatFor == 'add') {
            var booksTable = $("#booksTable").find("tbody");
            var newRow = $("<tr data-book-id=" + book.ID + "></tr>");
            var titleCol = $("<td>").text(book.Title);
            titleCol.appendTo(newRow)
            var authorCol = $("<td>").text(book.Author);
            authorCol.appendTo(newRow);
            var buttons = $(`<td><div class="button-group">
            <button class="btn btn-primary btn-sm editBook">Edytuj</button>
            <button class="btn btn-danger btn-sm deleteBook">Usuń</button>
            <button class="btn btn-info btn-sm lendBook">Wypożycz</button>
        </div>
    </td>`);
            buttons.appendTo(newRow);
            newRow.appendTo(booksTable);

        }
    }
    ////readers renderers
    function renderAllReaders(readers) {
        var readersTable = $("#readersTable").find("tbody");
        readersTable.html("");
        for (var i = 0; i < readers.length; i++) {
            var newRow = $("<tr readerID=" + readers[i].ID + "></tr>");
            var nameCol = $("<td>").text(readers[i].Name);
            nameCol.appendTo(newRow)
            var ageCol = $("<td>").text(readers[i].Age);
            ageCol.appendTo(newRow)
            var buttons = $(`<td><div class="button-group">
                  <button class="btn btn-primary btn-sm editReader">Edytuj</button>
                  <button class="btn btn-danger btn-sm deleteReader">Usuń</button>
                  <button class="btn btn-info btn-sm lendBook">Wypożycz</button>
              </div>
          </td>`);
            buttons.appendTo(newRow);

            newRow.appendTo(readersTable)
        }
    }
    function renderReader(id, whatFor, reader) {
        if (whatFor == 'edit') {
            let readerEntry = $("[readerID =" + id + "]");
            readerEntry.children().eq(0).replaceWith("<td>" + reader.Name + "</td>");
            readerEntry.children().eq(1).replaceWith("<td>" + reader.Age + "</td>");
        } else if (whatFor == 'delete') {
            let readerEntry = $("[readerID =" + id + "]");
            readerEntry.remove();
        } else if (whatFor == 'add') {
            var readersTable = $("#readersTable").find("tbody");
            var newRow = $("<tr readerID=" + reader.ID + "></tr>");
            var nameCol = $("<td>").text(reader.Name);
            nameCol.appendTo(newRow)
            var ageCol = $("<td>").text(reader.Age);
            ageCol.appendTo(newRow);
            var buttons = $(`<td><div class="button-group">
            <button class="btn btn-primary btn-sm editReader">Edytuj</button>
            <button class="btn btn-danger btn-sm deleteReader">Usuń</button>
            <button class="btn btn-info btn-sm lendBook">Wypożycz</button>
        </div>
    </td>`);
            buttons.appendTo(newRow);
            newRow.appendTo(readersTable);

        }
    }



    ////////////////////////////// AJAX UTILITIES
    function deleteBook(bookToDelete) {
        $.ajax({
            url: apiURL + "books/" + bookToDelete,
            type: "DELETE"
        }).done(function (resp) {
            renderBook(bookToDelete, 'delete');
            alertify.success('Usunięto');
        }).fail(function (err) {

        })
    }
    function editBook(bookToModify, modifiedBook) {
        //funkcja do wysyłania pod adres Api
        $.ajax({
            url: apiURL + "books/" + bookToModify,
            type: "Put",
            data: modifiedBook
        }).done(function (resp) {
            getBook(bookToModify, 'edit');
            alertify.success('Edytowano');
            resetForm();
        }).fail(function (err) {
            alertify.error('Błąd podczas edytowania');
        })
    }
    function addBook(bookToAdd) {
        $.ajax({
            url: apiURL + "books/",
            type: "Post",
            data: bookToAdd
        }).done(function (resp) {
            renderBook(resp.ID, 'add', bookToAdd);
            alertify.success('Dodano');
            resetForm();
        }).fail(function (err) {
            alertify.error('Błąd podczas dodawania!');
        })
    }
    //////DO ZROBIENIA
    function lendBook(lendObject) {
        $.ajax({
            url: apiURL + "lend/",
            type: "Post",
            data: lendObject
        }).done(function (resp) {
            renderLending(resp.ID, 'add');
            alertify.success('Wypożyczono');
        }).fail(function (err) {
          
        })
    }
    ////!!!WAŻNE
    ///////////////////////READERS AJAX 
    function editReader(readerToModify, modifiedReader) {
        //funkcja do wysyłania pod adres Api
        $.ajax({
            url: apiURL + "readers/" + readerToModify,
            type: "Put",
            data: modifiedReader
        }).done(function (resp) {
            getReader(readerToModify, 'edit');
            alertify.success('Edytowano');
            resetReaderForm();
        }).fail(function (err) {
            alertify.error('Błąd podczas edytowania');
        })
    }
    function addReader(readerToAdd) {
        $.ajax({
            url: apiURL + "readers/",
            type: "Post",
            data: readerToAdd
        }).done(function (resp) {
            renderReader(resp.ID, 'add', readerToAdd);
            alertify.success('Dodano');
            resetReaderForm();
        }).fail(function (err) {
            alertify.error('Błąd podczas dodawania!');
        })
    }
    function deleteReader(readerToDelete) {
        $.ajax({
            url: apiURL + "readers/" + readerToDelete,
            type: "DELETE"
        }).done(function (resp) {
            renderReader(readerToDelete, 'delete');
            alertify.success('Usunięto');
        }).fail(function (err) {

        })
    }
    ////////////////// UTILITIES
    function resetForm() {
        formButton.siblings().eq(2).remove();
        formButton.html('<i class="fa fa-plus"></i> Dodaj')
        formButton.attr('class', 'btn btn-success btn-sm');
        $('#bookForm').trigger("reset");

    }
    function resetReaderForm() {
        readerSubmit.siblings().eq(2).remove();
        readerSubmit.html('<i class="fa fa-plus"></i> Dodaj')
        readerSubmit.attr('class', 'btn btn-success btn-sm');
        $('#bookForm').trigger("reset");

    }

    function getDateNow() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var today = dd + '/' + mm + '/' + yyyy;
        return today;
    }


    /////////////////////////////////////////////////////////////////////
    /////////////////  LENDING HANDLING  ///////////////////////////

    function renderAllLending(lending) {
        var lendingTable = $("#lendingTable").find("tbody");
        lendingTable.html("");
        for (var i = 0; i < lending.length; i++) {
            var newRow = $("<tr lendingID=" + lending[i].ID + "></tr>");
            var bookCol = $("<td>").text(lending[i].Title);
            var readerCol = $("<td>").text(lending[i].Name);
            var lendDate = $("<td>").text(lending[i].LendDate);
            bookCol.appendTo(newRow)
            readerCol.appendTo(newRow)
            lendDate.appendTo(newRow)
            var buttons = $(`<td><div class="button-group">
                  <button class="btn btn-warning btn-sm deleteReader">Oddaj</button>
              </div>
          </td>`);
            buttons.appendTo(newRow);
            newRow.appendTo(lendingTable);
        }
        lendingTable.on("click", "button.deleteReader", function (e) {
            var lendingID = $(this).closest("tr").attr("lendingID");
            console.log("lol")
            deleteLending(lendingID);
        });
    }
    function renderLending(id, whatFor) {
        if (whatFor == 'delete') {
            let lendingEntry = $("[lendingID =" + id + "]");
            lendingEntry.remove();
        }
    }
})



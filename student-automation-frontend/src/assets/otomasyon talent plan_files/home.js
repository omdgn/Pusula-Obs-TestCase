/*
 |======================================================*
    notes handling info
    === start everything from this => initNoteWithEditor()
    === load single note from db and localstorage => loadNoteFromDatabaseForEdit()
    === update single note in db and localstorage => updateNoteInDb()
    === delete note from db => deleteNote()
    === deal with Shared notes => checkIsCurrentNoteShared()
    === process start from => DomContentLoaded
    other information is in instructions file
 |======================================================*
*/

// var currentNoteID = '';
var isnoteDeleted = false;
var isCurrentNoteShared = false;
var isFormatingOn = false;
var currentEditorType = 0;
let typingTimer23;
var langPopup = false;
var isSharedNote = false;
var currentNoteID = "";
var dbNotesRequestAgain = false;
var checkLeftDataToSave = false;
var loadMoreTitlesList = [];
var loadedTitlesCount = 20;
var isIncognitoMode = false;
var noteLoaded = false;
var sidebarTitleLoaderHtml = `<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;
var sidebarTitlesCount = "";
var currentNoteLoadedFrom = "";
var currentRunningNoteID = null;
var isCurrentPopupShown = false;
var beaconUpdate = 0;
var lastUpdatedTitle = "";
var lastAjaxRequest = null;
let newNoteFlag = true;

detectIncognito().then((result) => {
    isIncognitoMode = result.isPrivate;
});

/* notes conditions */
const NOTESLIMITINFO = {
    titleAutoFileSize: 20, // characters
    localStorageTotalNotesLimit: 4700000, // in bytes = 4.5MB
    noteStartStoreInLS: 800000, // 800 kb
};

if (localStorage.getItem("isNotesUpdateApplied") != null) {
    localStorage.removeItem("isNotesUpdateApplied");
}

if (localStorage.getItem("userNotesDataRecord") != null) {
    localStorage.removeItem("userNotesDataRecord");
}

if (localStorage.getItem("user_id") == null && userID == 0) {
    localStorage.setItem("user_id", uniqueID());
}

var urlParams = new URLSearchParams(window.location.search);
// if (urlParams.size == 0) {
//     localStorage.removeItem("noteID");
// }

// userID = userID != 0 ? userID : localStorage.getItem("user_id");
// var hideContentPopup = localStorage.getItem("hideContentPopup");
// if (hideContentPopup == false || hideContentPopup == null) {
//     $("#contentSec, .popup-overlay").removeClass("d-none");
// }

/*
|======================================================*
|        home page content popup hide and show
|======================================================*
*/
$(document).on("keydown", function (e) {
    if (e.key === 'Escape' && $("#contentSec").css('display') != 'none') {
        var expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 50); // 50 years from now
        var expires = expirationDate.toUTCString();
        document.cookie = "content_popup=true; expires=" + expires + "; path=/";
        $("#contentSec").hide();
        $(".popup-overlay").hide();
        $(".dontshowpopup h2").click();
    }
});
// TODO:: this for default formatting toggleFormating
$(document).ready(function () {
    $("input[name='toggleFormating']").click();
});



$(".popup-overlay").on("click", function () {
    var expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 50); // 50 years from now
    var expires = expirationDate.toUTCString();
    document.cookie = "content_popup=true; expires=" + expires + "; path=/";
    $("#contentSec").hide();
    $(".popup-overlay").hide();
});

$(".dontshowpopup h2").on("click", function () {
    if (!$("#contentSec").hasClass("d-none")) {
    }
});

/*
|======================================================*
|          handle localstorage notes class
|======================================================*
*/

/* when note open from side bar  */
/* is it from localstorage or oldsource */
/* it has defined according to localstorage titles */
var getCurrentNoteLoadedFrom = (id) => {
    if (localStorage.getItem("notesTitleList") != null) {
        var result = JSON.parse(
            localStorage.getItem("notesTitleList")
        ).titles.filter((e) => e.loaded_from == 0 && e.unique_id == id);
        var loadedFrom = 0;
        if (result.length > 0) {
            result = result[0];
            loadedFrom = result.loaded_from;
        } else {
            loadedFrom = 1;
        }
        return loadedFrom;
    }
};

/*
|======================================================*
|           init notes load system on dom load
|======================================================*
*/
document.addEventListener("DOMContentLoaded", () => {
    class LocalStorageNotes {
        constructor() {
            if (
                localStorage.getItem("userNotesList") != null &&
                localStorage.getItem("userNotesList") != "{}"
            ) {
                this.notesData = JSON.parse(
                    localStorage.getItem("userNotesList")
                );
            } else {
                this.notesData = {};
            }
        }

        addLsNote(key, note) {
            this.notesData[key] = note;
            updateLSNotes(this.notesData);
        }

        resetSuggestions() {
            this.notesData = {};
        }

        removeNoteIfExist(key) {
            delete this.notesData[key];
            updateLSNotes(this.notesData);
        }

        getLsNote(key) {
            return this.notesData[key];
        }

        notesSize() {
            var dataToCount = this.notesData;
            try {
                if (dataToCount) {
                    if (dataToCount[getNoteID()]) {
                        delete dataToCount[getNoteID()].content;
                    }
                    return JSON.stringify(dataToCount).length;
                }
            } catch (error) {
                console.log(error);
                return 0;
            }
        }
    }

    function updateLSNotes(notes) {
        try {
            return localStorage.setItem("userNotesList", JSON.stringify(notes));
        } catch (error) {
            if (error.message.includes("exceeded the quota")) {
                alert("Browser storage quota reached");
            }
        }
    }

    initNoteWithEditor();

    /*
    |======================================================*
    |       initialize notes system
    |======================================================*
    */
    /* step 1, page load */
    /* init everthing, note if has id in url, sidebar titles...  */
    async function initNoteWithEditor() {
        handleTitlesOnLoad();
        handleFeedbackPopupOnLoad();

        var isQuillContent = true;
        var initialDoc;
        try {
            /* store user notes to local storeage from backend */
            if (
                localStorage.getItem("isLSApplied") == null ||
                (localStorage.getItem("isLSApplied") == 1 &&
                    isUserLoggedIn == 1)
                // isThisToolPremium == 0
            ) {
                await applyNotesUpdate();
            }

            /* check if user has notes to expire */
            var currentNote = await loadNoteFromDatabaseForEdit();
            if (typeof currentNote == "string") {
                var noteContent = JSON.parse(currentNote);
            } else {
                var noteContent = currentNote;
            }

            currentRunningNoteID = noteContent;
            currentNoteSize = noteContent?.contentSize || 0;
            currentNoteLoadedFrom = noteContent.loadedFrom;

            if (noteContent && Object.keys(noteContent).length > 0) {
                currentNoteSize = noteContent.contentSize;
                isQuillContent =
                    noteContent.content.includes(`{"ops":[{"insert"`) ||
                    noteContent.content.includes(`{"ops":[{"attributes":`);
                $("#doc__title").val(noteContent.title);
                if (noteContent.formatting == 0) {
                    initAceEditor(
                        noteContent.content,
                        isQuillContent,
                        handleTextChange
                    );
                    countWordsAndCharacters(noteContent.content);
                    currentEditorType = 0;
                } else {
                    currentEditorType = 1;
                    initProseMirrorEditor(
                        noteContent.content,
                        isQuillContent,
                        handleTextChange
                    );
                }
            } else {
                currentEditorType = 0;
                initAceEditor(null, false, handleTextChange);
            }
        } catch (error) {
            currentNoteSize = 0;
            initAceEditor(null, false, handleTextChange);
            console.error(error);
        }
        countWordsAndCharacters();
    }

    /* step 2 */
    /* new update which will handle notes save type */
    async function applyNotesUpdate() {
        return new Promise(async (resolve, reject) => {
            if (userCookie == "") {
                var res = {};
                res.size = 0;
                res.data = [];
            } else {
                var res = await getUserNotesData();
            }

            const LIMITEDSIZE = NOTESLIMITINFO.localStorageTotalNotesLimit;
            const USERNOTESSIZE = res.size;

            /* user has reached max notes limit */
            if (USERNOTESSIZE > LIMITEDSIZE) {
                localStorage.setItem("isLSApplied", 2);
            }

            /* if user is Fresh Guest */
            if (userCookie == "" && !isUserLoggedIn) {
                localStorage.setItem("isLSApplied", 1); // but it need to be fix in future
            }

            if (userCookie == "" && isUserLoggedIn) {
                localStorage.setItem("isLSApplied", 3);
            }

            if (
                userCookie != "" &&
                USERNOTESSIZE < LIMITEDSIZE &&
                isUserLoggedIn == "1"
            ) {
                /* if user is old guest and once data is already loaded after login again check */
                localStorage.setItem("isLSApplied", 3);
            }

            /* old gues user */
            if (
                userCookie != "" &&
                USERNOTESSIZE < LIMITEDSIZE &&
                isUserLoggedIn == ""
            ) {
                localStorage.setItem("isLSApplied", 1);
            }

            /* user already exist */

            if (res.size > 0 && res.data.length == 0) {
                $(".ep__notes__limit__popup").removeClass("d-none");
            }

            try {
                var notesUpdateType = localStorage.getItem("isLSApplied");
                if (notesUpdateType == 1 || notesUpdateType == 3) {
                    var oldNotes =
                        localStorage.getItem("userNotesData") ?? null;
                    var userNotesList = res.data;
                    if (oldNotes) {
                        oldNotes = JSON.parse(oldNotes);
                    }

                    var userNotesAsGuest = {};
                    if (notesUpdateType == 3 && isUserLoggedIn == "1") {
                        userNotesAsGuest = JSON.parse(
                            localStorage.getItem("userNotesList")
                        );
                        handleTitlesOnLoad(true);
                    }

                    // console.log('userNotesList', userNotesList, 'oldNotes', oldNotes,'userNotesAsGuest' ,userNotesAsGuest);

                    if (oldNotes == null) {
                        oldNotes = {};
                    }

                    var notes = {
                        ...userNotesList,
                        ...oldNotes,
                        ...userNotesAsGuest,
                    };

                    localStorage.removeItem("userNotesData");

                    updateLSNotes(notes);
                    // console.log("notes", notes);
                }
            } catch (error) {}
            resolve(true);
        });
    }

    /* step 3 */
    /* it will get user notes data from backend */
    function getUserNotesData() {
        return new Promise(function (resolve, reject) {
            var localExceededNotesSize =
                localStorage.getItem("userNotesData")?.length ?? 0;
            $(".fetching__notes__popup").removeClass("d-none");
            $.ajax({
                type: "post",
                url: notesUrl.getUserNotesSizeInfo,
                data: {
                    userID: userID,
                    localExceededNotesSize: localExceededNotesSize,
                    isPremium: isThisToolPremium,
                    _token: $('meta[name="_token"]').attr("content"),
                },
                success: function (response) {
                    $(".fetching__notes__popup").addClass("d-none");
                    // userNotesSize = response;
                    resolve(response);
                },
                error: function (error) {
                    reject(error);
                },
            });
        });
    }

    /* get single note from backend or handle user notes from localstorage it also get notes from localstorage */
    function loadNoteFromDatabaseForEdit(updatedContent = null) {
        if (lastAjaxRequest !== null) {
            lastAjaxRequest.abort();
        }

        return new Promise(async (resolve, reject) => {
            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.size !== 0) {
                let editID = urlParams.get("edit-id");
                let shareID = urlParams.get("share-id");
                if (!shareID) {
                    setNoteID(editID);
                }
                try {
                    $(".ep__laoder__wrapper").removeClass("d-none");
                    if (getCurrentNoteLoadedFrom(editID) == 0) {
                        var noteFromOldSource = await loadNoteDataFromOldSource(
                            editID
                        );
                        if (Object.values(noteFromOldSource).length > 1) {
                            noteFromOldSource.loaded_from = 0;
                            resolve(noteFromOldSource);
                        }
                        $(".ep__laoder__wrapper").addClass("d-none");
                        return;
                    }

                    if (localStorage.getItem("isLSApplied") != 2) {
                        try {
                            var localStorageNotes = new LocalStorageNotes();
                            var getNoteFromLocalStorage =
                                await localStorageNotes.getLsNote(editID);
                            var userNoteFromLs =
                                Object.values(getNoteFromLocalStorage)
                                    ?.length ?? 0;

                            // var notesData = JSON.parse(localStorage.getItem('userNotesList'));
                            if (userNoteFromLs > 1) {
                                $(".ep__laoder__wrapper").addClass("d-none");
                                resolve(getNoteFromLocalStorage);
                                return;
                            }
                        } catch (error) {
                            if (
                                error.message.includes(
                                    "Cannot convert undefined or null to object"
                                )
                            ) {
                                localStorage.removeItem("noteID");
                                let url = new URL(window.location);
                                url.searchParams.delete("edit-id");
                                $(".ep__notes__wrapper h3 span").text(
                                    "Error"
                                );
                                $(".ep__notes__wrapper p").text(
                                    "Note was not saved properly. Moving on to a new note..."
                                );
                                $(".ep__notes__wrapper").removeClass("d-none");
                                $(".createNewFile").click();
                                window.history.replaceState(
                                    {},
                                    document.title,
                                    url.toString()
                                );
                            }
                            console.log("error: " + error);
                        }
                        $(".ep__laoder__wrapper").addClass("d-none");
                        console.log("your note not found");
                        return;
                    }

                    lastAjaxRequest = $.ajax({
                        type: "post",
                        url: notesUrl.getUserNotes,
                        data: {
                            userID: userID,
                            uniqueID: editID || shareID,
                            sharedNote: shareID ? 1 : 0,
                            _token: $('meta[name="_token"]').attr("content"),
                        },
                        success: function (response) {
                            isSharedNote = shareID ? true : false;
                            response = JSON.stringify(response);
                            resolve(response);
                            $(".ep__laoder__wrapper").addClass("d-none");
                        },
                        error: function (xhr, status, error) {
                            reject(error);
                            if (xhr.status === 429) {
                                alert("Two Many Request. Please Slow It Down");
                            }
                            $(".ep__laoder__wrapper").addClass("d-none");
                        },
                    });
                } catch (error) {
                    reject(error);
                    $(".ep__laoder__wrapper").addClass("d-none");
                }
            } else {
                try {
                    editID = getNoteID();
                    if (getNoteID() != null) {
                        var localStorageNotes = new LocalStorageNotes();
                        var getNoteFromLocalStorage =
                            await localStorageNotes.getLsNote(editID);
                        var userNoteFromLs =
                            Object.values(getNoteFromLocalStorage)?.length ?? 0;

                        // var notesData = JSON.parse(localStorage.getItem('userNotesList'));
                        if (userNoteFromLs > 1) {
                            $(".ep__laoder__wrapper").addClass("d-none");
                            setUrlEditid(editID);
                            resolve(getNoteFromLocalStorage);
                            return;
                        }
                    }
                } catch (error) {
                    if (
                        error.message.includes(
                            "Cannot convert undefined or null to object"
                        )
                    ) {
                        localStorage.removeItem("noteID");
                        let url = new URL(window.location);                        
                        $(".ep__notes__wrapper h3 span").text(
                            "Error!"
                        );
                        $(".ep__notes__wrapper p").text(
                            "Note was not saved properly. Moving on to a new note..."
                        );
                        $(".ep__notes__wrapper").removeClass("d-none");
                        url.searchParams.delete("edit-id");
                        $(".createNewFile").click();
                        window.history.replaceState(
                            {},
                            document.title,
                            url.toString()
                        );
                    }
                    console.log("error: " + error);
                }
                // removeNoteID();
                resolve(false);
                $(".ep__laoder__wrapper").addClass("d-none");
            }
        });
    }

    /* handle titles on load from localstrage if not exist check in backend */
    function handleTitlesOnLoad(directUpdate = false) {
        var notesTitles = readLSTitles() ?? [];

        if (!directUpdate) {
            if (
                notesTitles.length != 0 &&
                // notesTitles.info.user_id == userID &&
                "version" in notesTitles.info &&
                notesTitles.info.version == TITLES_VERSION
            ) {
                updateSidebarTitleList(
                    notesTitles.titles.length > 20 ? true : false
                );
                return;
            }
        }

        /* if user cookie not stored than empty save */
        if (userCookie == "") {
            updateLSTitles({
                info: {
                    titles: null,
                    user_id: userID,
                    version: TITLES_VERSION,
                    userCookie: userCookie,
                },
                titles: [],
            });
            return;
        }

        $.ajax({
            type: "POST",
            url: notesTitlesUrl,
            data: {
                userID,
                _token: $("meta[name='_token']").attr("content"),
            },
            success: function (response) {
                if (response.length == 0) {
                    updateLSTitles({
                        info: {
                            titles: null,
                            user_id: userID,
                            version: TITLES_VERSION,
                            userCookie: userCookie,
                        },
                        titles: [],
                    });
                    return;
                }

                var localTitlesList = [];
                if (localStorage.getItem("notesTitleList") != null) {
                    var titlesList = JSON.parse(
                        localStorage.getItem("notesTitleList")
                    );
                    localTitlesList = titlesList.titles;
                }

                var titlesChunk = [...localTitlesList, ...response];
                var filteredTitles = [];
                if (titlesChunk.length > 0) {
                    filteredTitles = filterDuplicatesByField(
                        titlesChunk,
                        "unique_id"
                    );
                }

                updateLSTitles({
                    info: {
                        titles: "loaded",
                        user_id: userID,
                        version: TITLES_VERSION,
                    },
                    titles: filteredTitles,
                });

                updateSidebarTitleList(response.length > 20 ? true : false);
            },
        });
        return;
    }

    /* load note from backend if its from oldsource */
    function loadNoteDataFromOldSource(id) {
        return new Promise(async (resolve, reject) => {
            var user_id =
                JSON.parse(localStorage.getItem("notesTitleList"))?.info
                    ?.user_id ?? 0;
            if (user_id == 0) {
                alert("Your note not found");
                return reject("error");
            }
            $.ajax({
                type: "post",
                url: notesUrl.getUserNotes,
                data: {
                    userID: user_id,
                    uniqueID: id,
                    loadFrom: "oldSource",
                    _token: $('meta[name="_token"]').attr("content"),
                },
                success: function (response) {
                    resolve(response);
                },
                error: function (xhr, status, error) {
                    console.log("old sources data not loaded");
                },
            });
        });
    }

    /* open recent notes from sidebar */
    $(document).on("click", ".recent__docs__list > div", function (e) {
        if (e.target.classList[0] == "delete__note__sidebar") return;
        let openNoteID = $(this).data("id");
        if (getNoteID() == openNoteID) return;
        var paramNameToReplace = "edit-id";
        var newValue = openNoteID;
        var modifiedUrl = replaceUrlParam(paramNameToReplace, newValue);
        initNoteWithEditor();
        countWordsAndCharacters();
        setTimeout(function () {
            countWordsAndCharacters();
        }, 1000)
    });

    /* create new note */
    $(".createNewFile").on("click", function () {
        
        $("#ttwords").text(0);
        $("#ttcharac").text(0);
        $("#ttsentences").text(0);
        
        currentNoteSize = 0;
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.size != 0) {
            currentNoteSize = 0;
            localStorage.removeItem("currentNote");
            localStorage.removeItem("noteID");
            $(".ql-title").val("");
            replaceUrlParam("edit-id", "2", true);
            initNoteWithEditor();
        } else if(newNoteFlag) {
            newNoteFlag  = false;
            $(".ep__notes__wrapper h3 span").text(
                "Current Note not saved"
            );
            $(".ep__notes__wrapper p").text(
                "Please save your current note by writing something down before creating a new note"
            );
            $(".ep__notes__wrapper").removeClass("d-none");
            setTimeout(function() {
                $(".ep__notes__wrapper").addClass("d-none");
                newNoteFlag  = true;
            }, 2000)
        }
    });

    /*
    |======================================================*
    |           delete note system
    |======================================================*
    */
    /* delete note event */
    $("#delete__note__button").on("click", async function () {
        var id = $(this).data("id");
        $(".prepare__for__delete").append(sidebarTitleLoaderHtml);
        $(".delete__popup__wrapper").removeClass("show");
        if (id != null) {
            await deleteNote(id);
        }

        if (localStorage.getItem("isLSApplied") != 2) {
            var localStorageNotes = new LocalStorageNotes();
            localStorageNotes.removeNoteIfExist(id);
        }

        var titlesList = readLSTitles(true) ?? [];
        titlesList = titlesList.filter((title) => {
            if (title.unique_id != id) return title;
        });
        updateLSTitles(titlesList, true);
        if (id == getNoteID()) {
            const newURL = `${window.location.origin}`;
            window.history.replaceState(null, "", newURL);
            localStorage.removeItem("currentNote");
            localStorage.removeItem("noteID");
            $("#doc__title").val("");
            if (currentEditorType == 1) {
                initAceEditor(null, false, handleTextChange);
            } else {
                $("#textarea__editor").val("");
            }
        }
        $(".prepare__for__delete").remove();
    });

    /* delete note from backend */
    function deleteNote(uniqueID) {
        return new Promise(async (resolve, reject) => {
            try {
                let response = $.ajax({
                    type: "post",
                    url: notesUrl.deleteNote,
                    data: {
                        uniqueID: uniqueID,
                        _token: $('meta[name="_token"]').attr("content"),
                    },
                });
                resolve(response);
            } catch (error) {
                reject();
            }
        });
    }

    /*
    |======================================================*
    |  notes title changes listener event, note changes listener event
    |======================================================*
    */
    /* title changes event listener */
    $(".ql-title").on("input", function () {
        var title = $(".ql-title").val();
        if(title.length) {
            currentDocumentNameUntitled = false;
        }
        title = title.replaceAll("<", "_LESS_SIGN_");
        title = title.replaceAll(">", "_GREATER_SIGN_");
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.size !== 0 && urlParams.get("edit-id") != null) {
            isFormatingOn
                ? autoTitleAdd(title, editorSection.state.doc)
                : autoTitleAdd($("#textarea__editor").val());
            handleUpdateLSNoteTitles(
                title || sidebarTitlesCount || "Untitled Document",
                1
            );
            setTimeout(() => {
                if (isFormatingOn) {
                    handleTextChange(editorSection.state.doc, "json");
                } else {
                    handleTextChange($("#textarea__editor").val(), "text");
                }
            }, 3000);
        } else {
            handleUpdateLSNoteTitles(
                title || sidebarTitlesCount || "Untitled Document",
                1
            );
        }
    });

    /* notes changes event listener */
    window.handleTextChange = (content, type) => {
        var title = $(".ql-title").val();
        var text =
            type == "json" ? editorSection.state.doc.textContent : content;

        countWordsAndCharacters(text);

        autoTitleAdd(title, text);

        // handleUpdateLSNoteTitles(title || sidebarTitlesCount || 'Untitled Document', 1);
        handleUpdateLSNoteTitles(
            title || sidebarTitlesCount || "Untitled Document",
            1
        );

        clearTimeout(typingTimer23);
        if (localStorage.getItem("isLSApplied") == 2) {
            typingTimer23 = setTimeout(function () {
                if (getNoteID() == null) {
                    createNewNote(uniqueID());
                }
                updateNoteInDb(content, type);
            }, 3000);
        } else {
            typingTimer23 = setTimeout(() => {
                if (getNoteID() == null) {
                    createNewNote(uniqueID());
                }
                updateNoteInDb(content, type);
            }, 1000);
        }
    }

    /*
    |======================================================*
    |     update note in backend or in localstrage
    |======================================================*
    */
    function updateNoteInDb(content, type) {
        let contentLength =
            typeof content == "object"
                ? JSON.stringify(content).length
                : content.length;
        if (
            contentLength > NOTESLIMITINFO.noteStartStoreInLS &&
            localStorage.getItem("isLSApplied") == 2
        ) {
            alert(
                "Apologies, we are unable to store this data as it exceeds the maximum limit allowed."
            );
            return;
        }

        if (isIncognitoMode) {
            $(".savingLoader")
                .addClass("show")
                .text(
                    "You are currently in private mode, and your notes will not be saved."
                );
            return;
        }

        if (dbNotesRequestAgain) {
            checkLeftDataToSave = true;
            return;
        }

        var notesAnalytics = localStorage.getItem("notesAnalytics");
        notesAnalytics = JSON.parse(notesAnalytics);
        try {
            if (notesAnalytics[null]) {
                var currentNoteStats = notesAnalytics[null];
                notesAnalytics[getNoteID()] = currentNoteStats;
                delete notesAnalytics[null];
                localStorage.setItem(
                    "notesAnalytics",
                    JSON.stringify(notesAnalytics)
                );
            }
        } catch (e) {}

        dbNotesRequestAgain = true;

        var title = $(".ql-title").val();
        title = title || sidebarTitlesCount || "Untitled Document";
        if (type == "json") {
            content = JSON.stringify(content);
        }

        var fomatingBehaviour = $(
            "input[name='toggleFormating']:checked"
        ).val();
        var formatting = fomatingBehaviour == "on" ? 1 : 0;
        setUrlEditid(getNoteID());
        var title = $(".ql-title").val();
        handleUpdateLSNoteTitles(
            title || sidebarTitlesCount || "Untitled Document",
            1,
            contentLength
        );

        if (localStorage.getItem("isLSApplied") != 2) {
            title = title || sidebarTitlesCount || "Untitled Document";
            var currentRunningNoteIdData = JSON.stringify(currentRunningNoteID);
            let noteID = getNoteID();
            storeNoteOnLocalStorage(
                title,
                content,
                formatting,
                currentNoteLoadedFrom
            );
            $(".savingLoader").removeClass("show");
            return;
        }

        const localStorageNotes = new LocalStorageNotes();
        localStorageNotes.removeNoteIfExist(getNoteID());

        currentNoteUpdatedSize = content.length;
        currentNoteSize = currentNoteUpdatedSize;

        $.ajax({
            type: "post",
            url: notesUrl.updateSingleNoteUrl,
            data: {
                userID: userID,
                uniqueID: getNoteID(),
                title: title || sidebarTitlesCount || "Untitled Document",
                content: content,
                formate: formatting,
                currentRunningNoteID: currentRunningNoteID,
                loadedFrom: currentNoteLoadedFrom,
                _token: $('meta[name="_token"]').attr("content"),
            },
            success: function (response) {
                currentRunningNoteID.loadedFrom = response.loadedFrom;
                $(".savingLoader").removeClass("show");
                dbNotesRequestAgain = false;
                if (checkLeftDataToSave) {
                    checkLeftDataToSave = false;
                    $(".savingLoader").addClass("show");
                    if (isFormatingOn) {
                        var justHtml = editorSection.state.toJson();
                    } else {
                        var justHtml = $("#textarea__editor").val();
                    }
                    var title = $(".ql-title").val();
                    updateNoteInDb(title, justHtml);
                    $(".savingLoader").removeClass("show");
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 429) {
                    alert("Two Many Request. Please Slow It Down");
                }
                dbNotesRequestAgain = false;
                $(".savingLoader").removeClass("show");
            },
        });
    }

    function storeNoteOnLocalStorage(
        title,
        content,
        formatting,
        currentNoteLoadedFrom
    ) {
        var note = {};
        var note = {
            unique_id: getNoteID(),
            title: title || "Untitled Document",
            content: content,
            formatting: formatting,
            id: 0,
            loadedFrom: currentNoteLoadedFrom,
            contentSize: content.length,
            created_at: currentDate(),
            updated_at: currentDate(),
        };
        const localStorageNotes = new LocalStorageNotes();
        notesSize = localStorageNotes.notesSize() + content.length;
        $(".savingLoader").removeClass("show");
        if (notesSize < NOTESLIMITINFO.localStorageTotalNotesLimit) {
            dbNotesRequestAgain = false;
            localStorageNotes.addLsNote(getNoteID(), note);
        } else {
            googleAnalyticsCount();
            dbNotesRequestAgain = false;
            if (!isCurrentPopupShown) {
                isCurrentPopupShown = true;
                $(".ep__notes__wrapper h3 span").text(
                    "The maximum note size has been reached."
                );
                $(".ep__notes__wrapper p").text(
                    "Your notes has reached its limit, indicating it will now save no more notes. Responsibility for further storage falls outside our scope."
                );
                $(".ep__notes__wrapper").removeClass("d-none");
            }
        }
        return true;
    }

    function googleAnalyticsCount() {
        var quotaID = localStorage.getItem("quotaUniqueID");
        if (quotaID == null) {
            quotaID = uniqueID();
            localStorage.setItem("quotaUniqueID", quotaID);
        }
        $.ajax({
            type: "POST",
            url: notesUrl.quoteReachedCount,
            data: {
                _token: $('meta[name="_token"]').attr("content"),
                quotaID: quotaID,
            },
            success: function () {},
        });
    }

    /*
    |======================================================*
    |           formatting on switch to prose
    |======================================================*
    */
    $(".toggle__formating input").on("change", function () {
        var fomatingBehaviour = $(
            "input[name='toggleFormating']:checked"
        ).val();
        if (fomatingBehaviour) {
            var text = $("#textarea__editor").val();
            var selector = "#editorTextarea";
            isFormatingOn = true;
            $(selector).html("");

            var elements = text.split("\n");
            var content = elements
                .map((element) => `<p>${element}</p>`)
                .join("");
            initProseMirrorEditor(content, false, handleTextChange);
        } else {
            isFormatingOn = false;
            $(".formated__popup__wrapper").addClass("show");
            $(".toggle__formating input").prop("checked", true);
        }
    });

    $(".switch__formatting__off").on("click", function () {
        $(".toggle__formating input").prop("checked", false);

        try {
            content = exportContentToHTML(editorSection.state);
            initAceEditor(content, false, handleTextChange);
            isFormatingOn = false;
        } catch(e) {
            console.error(e)
        }
        finally {
            $(".formated__popup__wrapper").removeClass("show");
        }
        return;
    });
});

/* it will show ffeedback after 15 seconds under some conditions */
/* if user submit it will not show again until its version not changed */
/* if not submit it will show after every week */
function handleFeedbackPopupOnLoad() {
    const lsFeedbackVariable = localStorage.getItem("feedbackSubmited");
    let shownAlready = readCookie("feedbackLastTimeSubmitedOn") != "true";

    try {
        if ((lsFeedbackVariable != FEEDBACK_SHOWN_VERSION) || (shownAlready)) {
            var userNotesCount =
                JSON.parse(localStorage.getItem("notesTitleList"))?.titles
                    ?.length ?? 0;
            if (userNotesCount > 2) {
                setTimeout(() => {
                    $("#edtpd_feedback_modal_wrapper").css("display", "flex");
                }, 15000);
            }
        }
        var expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 999);
        var expires = expirationDate.toUTCString();
        document.cookie =
            "feedbackLastTimeSubmitedOn=true; expires=" +
            expires +
            "; path=/";
        localStorage.setItem(
            "feedbackSubmited",
            FEEDBACK_SHOWN_VERSION
        );
    } catch (error) {
        console.log(error);
    }
}

/*
|======================================================*
|           read or update localstrage notes
|======================================================*
*/
function readLSNotes(name) {
    if (localStorage.getItem(name) == "notfound") {
        return [];
    }
    return JSON.parse(localStorage.getItem(name));
}

/*
|======================================================*
|           handle sidebar notes titles
|======================================================*
*/

/* it will fire when ever title change on update */
function handleUpdateLSNoteTitles(title = null, show = 0, contentSize = 0) {
    let currentNoteID = getNoteID();
    let notesTitleList = readLSTitles(true) ?? [];
    let updatedNoteTitles = [];

    var isNewNote = true;
    notesTitleList.map(function (note) {
        if (note.unique_id == currentNoteID || note.unique_id == null) {
            isNewNote = false;
        }
    });

    if (isNewNote) {
        let newNoteTitle = {
            title: title || sidebarTitlesCount || "Untitled Document",
            unique_id: currentNoteID,
        };
        updatedNoteTitles = notesTitleList;
        updatedNoteTitles.unshift(newNoteTitle);
    } else {
        notesTitleList.forEach((noteTitle) => {
            if (
                noteTitle.unique_id == currentNoteID ||
                noteTitle.unique_id == null
            ) {
                noteTitle.title = title;
                if (noteTitle.unique_id == null) {
                    noteTitle.unique_id = currentNoteID;
                }
                noteTitle.loaded_from = 1;
                noteTitle.contentSize = contentSize;

                updatedNoteTitles.unshift(noteTitle);
            } else {
                updatedNoteTitles.push(noteTitle);
            }
        });
    }

    updateLSTitles(updatedNoteTitles, true);
    updateSidebarTitleList(false, show);
}

/* it fiter duplicate titles if exist */
function filterDuplicatesByField(arr, field) {
    const uniqueValues = new Set(); // Set to store unique values
    const result = [];

    for (const obj of arr) {
        const value = obj[field];
        if (!uniqueValues.has(value)) {
            uniqueValues.add(value);
            result.push(obj);
        }
    }

    return result;
}

/* it will update sidebar titles list when title update */
function updateSidebarTitleList(loadMoreTitles = false, show = 0) {
    let titleInfo = readLSTitles() ?? [];

    let titleList = titleInfo.titles ?? [];

    if (show == 0) {
        if (titleInfo.titles == null) return;
        titleList = titleList.filter((e) => e.unique_id != null);
        titleInfo.titles = titleList;
        updateLSTitles(titleInfo);
    }

    if (titleList.length == 0) return;
    var noteTitleHtmlList = ``;

    var currentNoteID = getNoteID();

    if (show == 0) {
        if (getNoteID() == null) {
            try {
                var titlesListData = readLSTitles() ?? [];
                titlesListData = titlesListData.titles;
                if (titlesListData.length > 0) {
                    var docTitles = titlesListData.filter((e) => {
                        return e.title.includes("Untitled Document");
                    });
                    var titleCountList = [];
                    docTitles.filter((e) => {
                        if (e.title.includes("(")) {
                            title = e.title;
                            title = title.replace("Untitled Document", "");
                            title = title.replace(" (", "");
                            title = title.replace(")", "");
                            titleCountList.push(parseInt(title));
                        }
                    });
                    if (titleCountList.length > 0) {
                        titleCountList = titleCountList.sort(function (a, b) {
                            return b - a;
                        });
                        var noteCount = titleCountList[0] + 1;
                    }
                }
            } catch (error) {
                var noteCount = titleInfo.titles.length + 1 || 1;
            }

            if (noteCount < (titleInfo.titles.length + 1 || 1) || !noteCount) {
                noteCount = titleInfo.titles.length + 1 || 1;
            }
            var newTitle = `Untitled Document (${noteCount})`;
            sidebarTitlesCount = newTitle;
            noteTitleHtmlList += `<div data-id="${null}" class="active"><p>Untitled Document (${noteCount})</p>
            <img class="delete__note__sidebar" src="${
                window.location.origin
            }/web_assets/frontend/images/new-icon/delete-icon.svg" alt="" />
        </div>`;
        }
    }
    // noteTitleHtmlList = `<div></div>`;

    titleList.forEach((noteTitle) => {
        var title = noteTitle.title;
        title = title.replaceAll("<", "< ");
        title = title.replaceAll(">", " >");
        title = title.replaceAll("_LESS_SIGN_", "< ");
        title = title.replaceAll("_GREATER_SIGN_", " >");

        noteTitleHtmlList += `<div data-id="${noteTitle.unique_id}" class="${
            currentNoteID == noteTitle.unique_id ? "active" : ""
        }"><p>${title || "Untitled Document"}</p>
        <img class="delete__note__sidebar" src="${
            window.location.origin
        }/web_assets/frontend/images/new-icon/delete-icon.svg" alt="" />
        </div>`;
    });

    var loadMorer = ``;
    if (loadMoreTitles && loadedTitlesCount < loadMoreTitlesList.length) {
        loadMorer = `<button data-count="20" id='load__more__btn'><img src="${window.location.origin}/web_assets/frontend/images/new-icon/load-more-title-icon.svg" alt="" /> <span>Load More</span></button>`;
    }
    $(".recent__docs__list").html(noteTitleHtmlList + loadMorer);
}

/* read localstrage titles */
function readLSTitles(titles = false) {
    if (localStorage.getItem("notesTitleList")) {
        var result = JSON.parse(localStorage.getItem("notesTitleList"));
        return titles ? result.titles : result;
    } else {
        return [];
    }
}

function setLSTitles(titlesList) {
    return localStorage.setItem("notesTitleList", titlesList);
}

/* when page load without any edit-id */
/* it will add untitled document (no) */

var currentDocumentNameUntitled = false;

function autoTitleAdd(title, text) {
    if (title.includes("Untitled Document") || title == "") {
        currentDocumentNameUntitled = true;
    }

    if (currentDocumentNameUntitled) {
        $(".ql-title").val(splitTextAndCheck(text)[0]);
    }

    if (currentDocumentNameUntitled) {
        if (!splitTextAndCheck(text)[1]) {
            currentDocumentNameUntitled = false;
        }
    }
}

/* check title max size length */
function splitTextAndCheck(text) {
    let chunks = [];
    let chunksSize = NOTESLIMITINFO.titleAutoFileSize;
    for (let i = 0; i < text.length; i += chunksSize) {
        chunks.push(text.slice(i, i + chunksSize));
    }
    return [chunks[0], text.length <= chunksSize];
}

/* load more titles on button click max range 20 at start  */
/* every time add next 20 */
$(document).on("click", "#load__more__btn", function (e) {
    var titleLoaded = loadedTitlesCount + 20;
    loadedTitlesCount = titleLoaded;
    //console.log(titleLoaded, loadMoreTitlesList.length);
    if (titleLoaded > loadMoreTitlesList.length) {
        $(this).addClass("d-none");
    }
    updateLSTitles(loadMoreTitlesList.slice(0, titleLoaded));
    updateSidebarTitleList(true);
});

/* update title in localstorage */
function updateLSTitles(titles, updateTitlesOnly = false) {
    if (updateTitlesOnly) {
        let titlesList = readLSTitles() ?? [];
        titlesList.titles = titles;
        localStorage.setItem("notesTitleList", JSON.stringify(titlesList));
        return;
    }
    localStorage.setItem("notesTitleList", JSON.stringify(titles));
}

/*
|======================================================*
|           @ handle sidebar notes titles @
|======================================================*
*/

/* replace url edit-id when open new or old note */
function replaceUrlParam(paramName, newValue, reset = false) {
    var currentUrl = window.location.href;
    var urlParts = currentUrl.split("?");
    var hasParams = urlParts.length > 1;

    if (!hasParams && !reset) {
        // If there are no parameters and reset is false, just append the new parameter
        var newUrl = urlParts[0] + "?" + paramName + "=" + newValue;
        window.history.replaceState({}, "", newUrl);
        return newUrl;
    }

    if (hasParams) {
        var params = urlParts[1];
        var paramArray = params.split("&");
        for (var i = 0; i < paramArray.length; i++) {
            var param = paramArray[i].split("=");
            if (param[0] === paramName) {
                param[1] = newValue;
                paramArray[i] = param.join("=");
                params = paramArray.join("&");
                var newUrl = urlParts[0] + "?" + params;

                if (reset) {
                    // Replace the entire URL if reset is true
                    window.history.replaceState({}, "", urlParts[0]);
                } else {
                    // Otherwise, replace only the query parameters
                    window.history.replaceState({}, "", newUrl);
                }

                return newUrl;
            }
        }
    }

    // If the parameter was not found, and reset is false, append it to the existing parameters
    var separator = hasParams ? "&" : "?";
    var newUrl = currentUrl + separator + paramName + "=" + newValue;
    window.history.replaceState({}, "", newUrl);
    return newUrl;
}

/*
|======================================================*
|           formatting reated stuff
|======================================================*
*/
$(".continue__formatting").on("click", function () {
    $(".formated__popup__wrapper").removeClass("show");
});

$(".close__icon").on("click", function () {
    $(".ep__notes__wrapper").addClass("d-none");
});

function handleformattingCheck(formatting) {
    if (formatting == 1) {
        $(".toggle__formating input").prop("checked", true);
        $(".ql-toolbar").show();
        isFormatingOn = true;
    } else {
        $(".toggle__formating input").prop("checked", false);
        $(".ql-toolbar").hide();
        isFormatingOn = false;
    }
}

/*
|======================================================*
|               modify cookies
|======================================================*
*/
// Cookies
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";

    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

/*
|======================================================*
|           notes id setting
|======================================================*
*/
function setNoteID(id) {
    localStorage.setItem("noteID", id);
}

function getNoteID() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.size != 0) {
        setNoteID(urlParams.get("edit-id"));
        return urlParams.get("edit-id");
    }
    return localStorage.getItem("noteID");
}

function removeNoteID() {
    localStorage.removeItem("noteID");
}

function uniqueID() {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    const timestamp = new Date().getTime();
    const hexString = timestamp.toString(16);
    const randomString = hexString.slice(-8);
    return result + randomString;
}

function currentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear(); // Full year (e.g., 2023)
    const month = currentDate.getMonth(); // Month index (0-11)
    const day = currentDate.getDate(); // Day of the month (1-31)
    const hours = currentDate.getHours(); // Hours (0-23)
    const minutes = currentDate.getMinutes(); // Minutes (0-59)
    const seconds = currentDate.getSeconds(); // Seconds (0-59)
    return `${year}-${month + 1}-${day} ${hours}:${minutes}:${seconds}`;
}

/*
|======================================================*
|           create new notes
|======================================================*
*/
function createNewNote(uniqueID) {
    if (isIncognitoMode) return;
    setNoteID(uniqueID);
    setUrlEditid(uniqueID);
    return true;
}

const setUrlEditid = (uniqueID) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("edit-id", uniqueID);
    const newURL = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, "", newURL);
};

function countWordsAndLines(text) {
    // Counting words
    const words = text.split(/\s+/).filter((word) => word !== ""); // Splitting by spaces and filtering out empty strings
    const wordCount = words.length;

    // Counting lines
    const lines = text.split("\n").filter((line) => line.trim() !== ""); // Splitting by newline characters and filtering out empty lines
    const lineCount = lines.length;

    $("#ttwords").text("words");
    $("#ttcharac").text();
}

function countWordsAndCharacters(content) {
    var text = content;
    if (text.trim() == "") {
        $("#ttwords").text(0);
        $("#ttcharac").text(0);
        $("#ttsentences").text(0);
        return;
    }

    const words = text.split(/\s+/).filter((word) => word !== "");
    const charCount = text.length;
    const sentences = text
        .split(/[.!?]/)
        .filter((sentence) => sentence.trim() !== "");
    const sentenceCount = sentences.length;

    $("#ttwords").text(words.length);
    $("#ttcharac").text(charCount);
    $("#ttsentences").text(sentenceCount);
}

$(document).ready(function () {
    var pastedWordCount = 0;
    var previousWordCount = 0; // To track the word count before the latest change
    var lastNoteID = "";
    var pasteType = 0;

    function setPreviousAnalysis() {
        if (lastNoteID != "" && lastNoteID != getNoteID()) {
            pastedWordCount = 0;
            previousWordCount = 0;
        }
        lastNoteID = getNoteID();

        var notesAnalytics = localStorage.getItem("notesAnalytics");
        if (notesAnalytics != null) {
            notesAnalytics = JSON.parse(notesAnalytics);
            var currentNoteAnalytics =
                notesAnalytics[getNoteID()] || notesAnalytics[null];
            if (currentNoteAnalytics) {
                pastedWordCount = +currentNoteAnalytics.pasted_words;
                previousWordCount = +currentNoteAnalytics.previousWordCount; // To track the word count before the latest change
            }
        }
    }

    /* handle pasted content */
    const handlePasteEvent = (event) => {
        setPreviousAnalysis();
        var pastedData = (event.originalEvent || event).clipboardData.getData(
            "text"
        );
        let wordsArray = pastedData.trim().split(/\s+/);
        pastedWordCount += wordsArray.length; // Add to pasted words count
        setTimeout(() => {
            updateWordCounts();
        }, 0);
    };

    /* handle input content */
    const handleInputEvent = () => {
        setTimeout(() => {
            setPreviousAnalysis();
            updateWordCounts();
        });
    };

    function getWordCount() {
        let wordsArray = $(document)
            .find("#textarea__editor")
            .val()
            .trim()
            .split(/\s+/);
        return wordsArray.length;
    }

    /* count pasted content percentage  */
    function updateWordCounts() {
        let totalWordCount = getWordCount();

        if (totalWordCount < pastedWordCount && totalWordCount !== 0) {
            totalWordCount = Math.max(totalWordCount, pastedWordCount);
            pasteType = 1;
        } else {
            pasteType = 0;
        }

        var pastePercentage =
            pastedWordCount > 0 && totalWordCount > 0
                ? ((pastedWordCount / totalWordCount) * 100).toFixed(2)
                : 0;

        // localStorage.setItem("notesAnalytics");
        if (localStorage.getItem("notesAnalytics") == null) {
            var notesAnalytics = {};
            notesAnalytics[getNoteID()] = {
                pasted_words: pastedWordCount,
                total_words: getWordCount(),
                pasted_percent: pastePercentage,
                previousWordCount: previousWordCount,
                pasteType: pasteType,
            };
            localStorage.setItem(
                "notesAnalytics",
                JSON.stringify(notesAnalytics)
            );
        } else {
            var notesAnalytics = localStorage.getItem("notesAnalytics");
            notesAnalytics = JSON.parse(notesAnalytics);
            notesAnalytics[getNoteID()] = {
                pasted_words: pastedWordCount,
                total_words: getWordCount(),
                pasted_percent: pastePercentage,
                previousWordCount: previousWordCount,
                pasteType: pasteType,
            };

            localStorage.setItem(
                "notesAnalytics",
                JSON.stringify(notesAnalytics)
            );
        }
    }

    setPreviousAnalysis();
    $(document).on("paste", "#textarea__editor", handlePasteEvent);
    $(document).on("input", "#textarea__editor", handleInputEvent);
});

document.addEventListener('keydown', function (event) {
    // Check if 'N' key is pressed with Ctrl (Windows/Linux) or Cmd (Mac)
    if ((event.metaKey || event.ctrlKey || event.altKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault(); // Prevent the browser's default action
        event.stopPropagation(); // Stop the event from propagating further
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.size != 0) {
            newNoteFlag = false;
        } else {
            newNoteFlag = true;
        }
        $(".createNewFile").click();
    }
});
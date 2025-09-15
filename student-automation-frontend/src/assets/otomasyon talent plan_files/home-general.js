/*
|======================================================*
|           search popup notes action
|======================================================*
*/


function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}


/* filter ntoes */

$("#filter__notes").on('input', function () {
    if ($(this).val() == '') {
        $(".recent__card").removeClass('d-none');
        return;
    }

    var userSearch = $(this).val().toLowerCase();
    $(".recent__card").addClass('d-none');
    var userSearchNotes = [];

    userNotesData.filter(e => {
        var title = (e.title).toLowerCase();
        (title).includes(userSearch) && userSearchNotes.push(e.unique_id);
    });
    $(".recent__card").each((i, e) => {
        userSearchNotes.includes($(e).data('id')) && $(e).removeClass('d-none');
    });
});


/* sorting notes */
$("#sort__notes").on('click', function () {
    $(".user__notes__sort").toggleClass('d-none');
});


/* sidebar work */
$(".editor__sidebar__toggle").on('click', function () {
    $("#docs__sidebar").toggleClass('toggleClose');
    $("#lineNumber").toggleClass('toggleClose');
    $(".ql-title-wrap").toggleClass('toggleClose');
    if ($("#editorTextarea").hasClass('aceEditorTextarea')) {
        $("#editorTextarea").toggleClass('shrink__ace__editor');
    } else {
        $("#editorTextarea").toggleClass('shrink__editor');
    }
    $(".ql-editor").toggleClass('toggleClose');
});


/*
|======================================================*
|           general page setting
|======================================================*
*/

$(".close__wellcome__popup").on('click', function () {
    var expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 50); // 50 years from now
    var expires = expirationDate.toUTCString();
    document.cookie = "content_popup=true; expires=" + expires + "; path=/";
    $("#contentSec").hide();
    $(".popup-overlay").hide();
});

/* content popup */
$(".content__popup__default").on('click', function () {
    var popupBehaviour = $("input[name='contentpopuptype']:checked").val();
    if (popupBehaviour == 'skip') return;
    localStorage.setItem('hideContentPopup', true);
});

$(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $("#contentSec").css('display') != 'none') {
        $("#contentSec").hide();
        $(".popup-overlay").hide();
        $(".dontshowpopup h2").click();
    }
});


$('.popup-overlay').on('click', function () {
    $("#contentSec").hide();
    $(".popup-overlay").hide();
});


$(document).on("click", function (event) {
    if (
        !$(event.target).closest("home__lang__options").length &&
        !$(event.target).is(".home__lang__options") && !$(event.target).is('.home__lang__div > *')
    ) {
        if ($(".home__lang__options").hasClass('active') && langPopup) {
            $(".home__lang__options").removeClass('active');
        }
    }
});
$(".home__lang__div").on('click', () => {
    $(".home__lang__options").toggleClass('active')
    langPopup = true;
});



$(".close__docs__popup").on('click', function () {
    $(".user__notes__wrapper").toggleClass('show-popup');
});

$('#shareDoc').on('click', function () {
    $(".popup__wrapper").toggleClass('show');
});

$(".close__shareDoc").on('click', function () {
    $(".popup__wrapper").toggleClass('show');
});


/*
|======================================================*
|               notes view setting
|======================================================*
*/
$("#notes__card__view").on('click', function () {
    $(".recent__documents").removeClass('list__view');
    $(this).addClass('active');
    $("#notes__list__view").removeClass('active');
});

$("#notes__list__view").on('click', function () {
    $(".recent__documents").addClass('list__view');
    $(this).addClass('active');
    $("#notes__card__view").removeClass('active');

});




/*
|======================================================*
|           note header actions
|======================================================*
*/
// window.onload = function () {
//     if (!getCookie("content_popup")) {
//         $("#contentSec, .popup-overlay").removeClass("display_none");
//     }
// };

$("#downloadFile").on('click', function () {
    let editorContent;
    if (isFormatingOn) {
        editorContent = exportContentToHTML(editorSection.state);
    } else {
        editorContent = $("#textarea__editor").val();
    }

    if (editorContent.trim() === '') {
        $(".ep__notes__wrapper h3 span").text("Empty File!");
        $(".ep__notes__wrapper p").text("Oops! It looks like there's nothing to download. Please enter some content first.");
        $(".ep__notes__wrapper").removeClass("d-none");
        return;
    }

    let fileName = 'file.txt';

    let tempElem = document.createElement("a");
    let blob = new Blob([editorContent], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    tempElem.href = url;
    tempElem.download = fileName;
    document.body.appendChild(tempElem);
    tempElem.click();

    // Cleanup the URL object
    URL.revokeObjectURL(url);
    document.body.removeChild(tempElem);
});


$("#copyContent").on('click', function () {
    const editorContent = quillJs.root.innerText;
    navigator.clipboard.writeText(editorContent);
});

// $("#txtFile").on("change", function () {
//     $("#contentSec").hide();
//     $(".popup-overlay").hide();
//     var input = $(this);
//     let uploadedFile = input[0].files[0];

//     if (uploadedFile) {
//         var fileExtension = ["docx", "pdf", "doc", 'txt'];
//         var fileName = uploadedFile.name;
//         var extension = fileName.split('.').pop().toLowerCase();

//         if (extension === 'txt') {
//             var FR = new FileReader();
//             FR.readAsText(uploadedFile);
//             FR.onload = function (data) {
//                 if (isFormatingOn) {
//                 } else {
//                     aceEditor.setValue(aceEditor.getValue() +'\n\r' + data.target.result);
//                 }
//             };
//         } else if (fileExtension.includes(extension)) {
//             // Send an AJAX request to the Laravel route for non-txt files
//             var formData = new FormData();
//             formData.append("file", uploadedFile);


//             $.ajax({
//                 type: "POST",
//                 url: "/convert-to-text",
//                 enctype: "multipart/form-data",
//                 processData: false,
//                 contentType: false,
//                 data: formData,
//                 headers: {
//                     "X-CSRF-TOKEN": $("meta[name='_token']").attr("content"),
//                 },
//                 success: function (response) {
//                     console.log(response, 'isFormatingOnisFormatingOn')
//                     if (isFormatingOn) {

//                     } else {
//                         aceEditor.setValue(aceEditor.getValue() + '\n\r' + data.target.result);
//                     }
//                     // quillJs.setContents({
//                     //     ops: [{
//                     //         insert: response
//                     //     }],
//                     // });
//                 },
//                 error: function (xhr, status, error) {
//                     // Handle errors if necessary
//                     console.error(xhr.responseText);
//                 },
//             });
//         } else {
//             alert("Unsupported file format. Please select a docx, doc, pdf, or txt file.");
//         }
//     }
// });

$("#txtFile").on("change", function () {
    $("#contentSec").hide();
    $(".popup-overlay").hide();

    var input = $(this);
    var input = input[0].files[0];
    // var captcharesponse = grecaptcha.getResponse(0);
    // console.log(input);
    if (input == undefined) {
        return;
    }
    function textUploadFunc(resp = '') {
        if (resp == "error5@@##01") {
            showAlertBox(
                "File Error!",
                ".txt, .docx, .pdf files are supported only. Try Again!"
            );
        } else {
            resp = resp.replaceAll(/\\n/g, '\n\n').replaceAll(/\\r/g, '').replaceAll("   ", ' ').replaceAll('  ', ' ');
            resp = resp.replaceAll('\\', '');

            if (isFormatingOn) {
                handleTextChange(resp, "text");
                initProseMirrorEditor(resp, false, handleTextChange);
            } else {
                $("#textarea__editor").val($("#textarea__editor").val() + '\n\r' + resp);
                handleTextChange(resp, "text");
            }
        }
        document.getElementById("txtFile").value = "";
    }
    getTextFromFile(input).then(text => {
        if (text.trim() != '') {
            textUploadFunc(text);
            return;
        }
        var formData = new FormData();
        formData.append("myFile", input);
        formData.append("_token", $('meta[name="_token"]').attr("content"));
        formData.append("getFileContent", true);
        // formData.append('captcha', captcharesponse);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var resp = this.responseText;
                textUploadFunc(resp);
            }
        };
        xhttp.open("POST", base_url + "getTxtFrmFile");
        xhttp.send(formData);
    });
});



/*
|======================================================*
|       delete popup
|======================================================*
*/

$("#close__delete__popup, .cancel__delete").on('click', function () {
    $(".delete__popup__wrapper").removeClass('show');
    $(".recent__docs__list > div").removeClass('prepare__for__delete');
});

$(document).on('click', '.delete__note__sidebar', function () {
    let parentElement = $(this).parent();
    parentElement.addClass('prepare__for__delete')
    let docID = parentElement.data('id');
    docTitle = $(parentElement).find('p').text();
    $('.delete__info p').text(docTitle);
    $("#delete__note__button").data('id', docID);
    $(".delete__popup__wrapper").addClass('show');
});


/*
|======================================================*
|         toggle full screen 
|======================================================*
*/

var elem = document.documentElement;

function openFullscreen() {
    try {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        // alert("Fullscreen is enabled");
    } catch (e) { }
}

function closeFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            /* IE11 */
            document.msExitFullscreen();
        }
        // alert("Fullscreen is disabled)
    } catch (e) { }
}
$("#fullscreen, #fullscreen_mobile").on("click", function () {
    if (document.fullscreenElement) {
        closeFullscreen();
        $(".header").removeClass('d-none');
        $(".editpad_text").removeClass('fullScreen');
        $("#textform").removeClass('fullScreen');
        $(this).closest(".tooltipTest").text("Full Screen");
        $(this).children("img.normalScreen").hide();
        $(this).children("img.fullScreen").show();

    } else {
        openFullscreen();
        $(".editpad_text").addClass('fullScreen');
        $("#textform").addClass('fullScreen');
        $(".header").addClass('d-none');
        $(this).closest(".tooltipTest").text("Exit Fullscreen");
        $(this).children("img.normalScreen").show();
        $(this).children("img.fullScreen").hide();
        $(this).removeClass("active");
    }
});

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        // Entered full screen
        openFullscreen();
        $(".editpad_text").addClass('fullScreen');
        $("#textform").addClass('fullScreen');
        $(".header").addClass('d-none');
        $(this).closest(".tooltipTest").text("Exit Fullscreen");
        $(this).children("img.normalScreen").show();
        $(this).children("img.fullScreen").hide();
        $(this).removeClass("active");
    } else {
        // Exited full screen
        closeFullscreen();
        $(".header").removeClass('d-none');
        $(".editpad_text").removeClass('fullScreen');
        $("#textform").removeClass('fullScreen');
        $(this).closest(".tooltipTest").text("Full Screen");
        $(this).children("img.normalScreen").hide();
        $(this).children("img.fullScreen").show();
    }
});

$(".view__content").on("click", function () {
    $("#contentSec, .popup-overlay").removeClass("display_none d-none").show();
});
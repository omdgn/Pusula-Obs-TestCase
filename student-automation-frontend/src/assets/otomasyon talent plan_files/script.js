var addBlockerStatus = false;

// try {
//     // $(document).ready(function () {
//         function setDynamicHeight() {
//             var toolHeight =
//                 $(".tool__wrapper__design").height() +
//                 $(".tool__wrapper__design").offset().top -
//                 43 +
//                 20;

//             $(".bg__wrapper__abs").css("height", toolHeight + "px");
//         }

//         setDynamicHeight();
//         $(window).resize(function () {
//             setDynamicHeight();
//         });
//     // });
// } catch (error) {}

// Dark Mode Implementation using cookies on server side
function darkmode() {
    const isDarkMode = $('body').attr('data-theme') === 'dark';
    const newMode = isDarkMode ? 'light' : 'dark';
    $('body').attr('data-theme', newMode);

    $.ajax({
        url: '/toggle-dark-mode',
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
        },
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ dark_mode: newMode }),
        success: function (data) {
            console.log('Mode Switched:', data.dark_mode);
        },
        error: function (xhr, status, error) {
            console.error('Error toggling dark mode:', error);
        }
    });
}

function saveLimitLog(popup, details = '') {
    $.ajax({
        url: saveLimitLogRoute, // Replace with the actual route URL
        type: 'POST',
        data: {
            tool_id: loadedToolID,                // Replace with actual tool ID
            popup: popup,   // Replace with actual value or null
            details: details,   // Replace with actual value or null
            e_track_key: getETrackKey()      // Replace with actual tracking key
        },
        headers: {
            'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content'), // Required for Laravel
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', error);
        }
    });
}

// if (localStorage.getItem("darkmode")) {
//     localStorage.removeItem("darkmode");
// }

function convertToBoldTags(text) {
    // Split the input text into lines
    const lines = text.split("<br>");
    const convertedLines = lines.map(line => {
        // Convert double asterisks (**) to <b> tags
        line = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        // Convert markdown headings (#) to <b> tags
        if (/^#+\s*(.+)$/.test(line)) {
            line = line.replace(/^#+\s*(.+)$/, '<b>$1</b>');
        }

        return line;
    });

    // Combine the lines into a single string with preserved newlines
    return convertedLines.join("<br>");
}

/**
 * Converts a Markdown-formatted string to HTML.
 * @param {string} md The Markdown input.
 * @returns {string} The resulting HTML.
 */
function markdownToHtml(md) {
    // Escape HTML special chars
    let html = md
        .replace(/&/g, "&amp;")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code spans: `code`
    html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");

    // Bold: **text** or __text__
    html = html.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

    // Italic: *text* or _text_
    html = html.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

    // Headings: # H1 through ###### H6
    html = html.replace(
        /^######\s*(.+)$/gm,
        "<h6>$1</h6>"
    ).replace(
        /^#####\s*(.+)$/gm,
        "<h5>$1</h5>"
    ).replace(
        /^####\s*(.+)$/gm,
        "<h4>$1</h4>"
    ).replace(
        /^###\s*(.+)$/gm,
        "<h3>$1</h3>"
    ).replace(
        /^##\s*(.+)$/gm,
        "<h2>$1</h2>"
    ).replace(
        /^#\s*(.+)$/gm,
        "<h1>$1</h1>"
    );

    // Links: [text](url)
    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2">$1</a>'
    );

    // Unordered lists: lines starting with - or *
    // First, wrap consecutive list items in <ul>…</ul>
    html = html.replace(
        /(^|\n)((?:\s*[-*]\s+.+\n?)+)/g,
        (_, prefix, listBlock) => {
            const items = listBlock
                .trim()
                .split(/\n/)
                .map(line => {
                    const content = line.replace(/^\s*[-*]\s+/, "");
                    return `<li>${content}</li>`;
                })
                .join("");
            return `${prefix}<ul>${items}</ul>\n`;
        }
    );

    // Paragraphs: wrap lines not already in a block tag
    html = html
        .split(/\n{2,}/)               // split on blank lines
        .map(block => {
            // skip if it's already a tag (h1–h6, ul, pre, blockquote, etc.)
            if (/^<(h[1-6]|ul|ol|li|pre|blockquote|code|img|p|a)\b/.test(block.trim())) {
                return block;
            }
            // else wrap in <p>
            const line = block.trim();
            return line ? `<p>${line}</p>` : "";
        })
        .join("\n\n");

    return html;
}

$(document).ready(function () {
    // if ($('body').hasClass('darkmode')) {
    //     $('body').removeClass('darkmode');
    // }

    var $div1 = $("#lineNumber");
    var $div2 = $("#editorTextarea .ql-editor");

    function parallelScroll($div1, $div2) {
        $div1.scroll(function () {
            $(".ql-editor").scrollTop($div1.scrollTop());
        });

        $(".ql-editor").scroll(function () {
            $div1.scrollTop($(".ql-editor").scrollTop());
        });
    }

    setTimeout(() => {
        parallelScroll($div1, $div2);
    }, 3000);

    $('.newsletter-form').on('submit', function (e) {
        e.preventDefault();
        newsletterUpdate();
    });

    $('.newsletter-btn').on('click', function (e) {
        e.preventDefault();
        newsletterUpdate();
    });

    function newsletterUpdate() {
        $('.newsletter-form .reponse, .newsletter-form .reponse-error').text('');
        let email = $('#newsletterEmail').val().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.length < 4 || !emailRegex.test(email)) {
            $('.newsletter-form .reponse-error').text('Please Enter a valid email').fadeIn();
            setTimeout(function () {
                $('.newsletter-form .reponse-error').fadeOut();
            }, 3000);
            return;
        }
        $.ajax({
            url: $('.newsletter-form').attr('action'),
            data: {
                email: email,
                _token: $('.newsletter-form input[name="_token"]').val(),
            },
            method: $('.newsletter-form').attr('method'),
            success: function (response) {
                $('.newsletter-form .reponse').text(response.message).fadeIn();
                setTimeout(function () {
                    $('.newsletter-form .reponse').fadeOut();
                    $('#newsletterEmail').val('');
                }, 3000);
            },
            error: function (xhr, status, error) {
                if (xhr.responseJSON?.message) {
                    $('.newsletter-form .reponse-error').text(xhr.responseJSON?.message).fadeIn();
                } else {
                    $('.newsletter-form .reponse-error').text(error ?? 'There was issue in subscribing newsletter!').fadeIn();
                }
                setTimeout(function () {
                    $('.newsletter-form .reponse-error').fadeOut();
                }, 3000);
            }
        });
    }

    $(document).on('mouseleave', ".initial[data-tooltip]", function () {
        $(this).removeClass('initial');
    });

    $(document).on('click', function (e) {
        $('.initial[data-tooltip]').each(function () {
            var $tooltip = $(this);

            // Check if this element and its ancestors are visible
            if ($tooltip.parents().filter(function () {
                return ($(this).css('display') === 'none' || $(this).css('visibility') === 'hidden');
            }).length === 0) {
                // If click is outside this tooltip element
                if (!$(e.target).closest($tooltip).length) {
                    $tooltip.removeClass('initial');
                }
            }
        });
    });
});

function toggleM() {
    var x = document.getElementById("topnavbar");
    if (window.getComputedStyle(x).display == "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

!(function (a) {
    function e(a, b) {
        var c = new Image(),
            d = a.getAttribute("data-src");
        (c.onload = function () {
            a.parent ? a.parent.replaceChild(c, a) : (a.src = d),
                b ? b() : null;
        }),
            (c.src = d);
    }

    function f(b) {
        var c = b.getBoundingClientRect();
        return (
            c.top >= 0 &&
            c.left >= 0 &&
            c.top <= (a.innerHeight || document.documentElement.clientHeight)
        );
    }

    for (
        var b = function (a, b) {
            if (document.querySelectorAll) b = document.querySelectorAll(a);
            else {
                var c = document,
                    d = c.styleSheets[0] || c.createStyleSheet();
                d.addRule(a, "f:b");
                for (var e = c.all, f = 0, g = [], h = e.length; f < h; f++)
                    e[f].currentStyle.f && g.push(e[f]);
                d.removeRule(0), (b = g);
            }
            return b;
        },
        c = function (b, c) {
            a.addEventListener
                ? this.addEventListener(b, c, !1)
                : a.attachEvent
                    ? this.attachEvent("on" + b, c)
                    : (this["on" + b] = c);
        },
        g = new Array(),
        h = b("img.lazy"),
        i = function () {
            for (var a = 0; a < g.length; a++)
                f(g[a]) &&
                    e(g[a], function () {
                        g.splice(a, a);
                    });
        },
        j = 0;
        j < h.length;
        j++
    )
        g.push(h[j]);
    i(), c("scroll", i);
})(this);

var modal = document.getElementById("edtpd_feedback_modal_wrapper");
var innerContent = document.querySelector(
    "#edtpd_feedback_modal_wrapper .modal-content"
);
var btn = document.getElementById("edtpd_feedback_moddel_trigger_btn");
var btn_mob = document.getElementById(
    "edtpd_feedback_moddel_trigger_btn_mobile"
);

$(".feedback__emoji span").on("click", function () {
    $(".feedback__emoji span").removeClass("active");
    $(this).addClass("active");
    $(".feedback__step__2").removeClass("d-none");
});

var formWrapper = document.querySelector(".feedback-form");
var span = document.getElementsByClassName("edtpd-feedback-close")[0];
var element = document.getElementById("form__feedback");
if (btn !== null) {
    btn.onclick = function () {
        modal.style.display = "flex";
    };
}

if (btn_mob !== null) {
    btn_mob.onclick = function () {
        modal.style.display = "block";
    };
}

try {
    if (span !== null) {
        span.onclick = function () {
            modal.style.display = "none";
        };
    }
} catch {
}

// validate email
function validateEmail(email) {
    const re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Sanitize any input - convert to plain text
const sanitizeInput = (input) => {
    // Convert URLs to plain text and replace slashes with underscores
    var urlPattern = /https?:\/\/[^\s]+/g;
    var convertedInput = input.replace(urlPattern, function (url) {
        // Remove http:// or https://
        var strippedUrl = url.replace(/https?:\/\//, "");
        // Replace slashes with underscores
        return strippedUrl.replace(/[\/.]/g, "_");
    });

    // Escape HTML entities
    var safeInput = convertedInput
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return safeInput;
};

window.onclick = function (event) {
    if (event.target == modal) {
        innerContent.classList.add("shaker-element");
        window.setTimeout(function () {
            innerContent.classList.remove("shaker-element");
        }, 400);
    }
};

function setCookie(name, value, hours) {
    var date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    var expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name, def = null) {
    var cookieName = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i].trim();
        if (cookie.indexOf(cookieName) == 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return def;
}

// send and Save Feedback
function editpad_feedback() {
    // -- inputs
    var _email_el = document.querySelector("#edtpd_feedback_email_input").value;
    var _message_el = document.querySelector("#edtpd_feedback_suggestion_input").value;
    var _tool_id_el = tool_id;
    try {
        _tool_id_el = (_tool_id_el == 0) ? (loadedToolID == 0 ? prevToolID : loadedToolID) : _tool_id_el;
    } catch (error) {
        _tool_id_el = 0;
    }
    var _token_el = document.querySelector('meta[name="_token"]').getAttribute("content");
    var _rating_el = $(".feedback__emoji").children().index($(".feedback__emoji span.active")) + 1;

    //-- validation
    function toggleMsg(msg) {
        $("#feedback__error").addClass("show").text(msg);
        setTimeout(() => {
            $("#feedback__error").removeClass("show").text("");
        }, 3000);
    }

    if (_email_el && !validateEmail(_email_el)) {
        toggleMsg("Email is not correct...");
        return;
    }

    if (_message_el.length > 700) {
        toggleMsg("Please enter short feedback...");
        return;
    }

    $("#feedback_send_btn").text("Submitting feedback...");
    _email_el = _email_el ? _email_el : "empty";

    // if (_message_el.length < 4) {
    //     toggleMsg("Feedback is too short...");
    //     return;
    // }
    try {
        _message_el = `${_message_el}`;
    } catch (e) {
    }
    $.ajax({
        url: base_url + "emd/feedback-send",
        data: {
            email: _email_el,
            name: _email_el,
            message: _message_el,
            rating: _rating_el,
            tool_id: _tool_id_el,
            page: window.location.href,
            _token: _token_el,
            e_track_key: getETrackKey(),
        },
        method: "POST",
        success: function (response) {
            setCookie(`feedback_submitted_tool_id_${_tool_id_el}`, true, 24);
            localStorage.setItem(`feedback_rating_tool_id_${_tool_id_el}`, _rating_el);
            localStorage.setItem("isFeedbackSubmitted", 1);
            document.getElementById("edtpd_feedback_email_input").value = "";
            document.getElementById("edtpd_feedback_suggestion_input").value = "";
            $(".feedback__step__1").addClass("d-none");
            $(".feedback__step__2").addClass("d-none");
            $(".feedback__step__3").removeClass("d-none");
        },
        error: function (xhr, status, error) {
            if (xhr.responseJSON.message == "The message must be at least 3 characters.") {
                toggleMsg("Message is too short...");
                return;
            } else 
            if (xhr.responseJSON.message == "Too Many Attempts.") {
                toggleMsg("Too Many Attempts...");
                return;
            }
            toggleMsg("Error! Feedback not sent...");
        },
        complete: function () {
            $("#feedback_send_btn").text("Submit Feedback");
        }
    });
}

$(".feedback__thanks button").on("click", function () {
    $(".feedback__step__1").removeClass("d-none");
    $(".feedback__step__2").addClass("d-none");
    $(".feedback__step__3").addClass("d-none");
    $(".feedback__emoji span").removeClass("active");
    $("#edtpd_feedback_modal_wrapper").css("display", "none");
    $(".feedback__thanks_heading").text("Thank You");
    $(".feedback_thanks_msg").html("Your submission has been received. <br>We will be in touch and contact you soon!");
});

function isScriptAlreadyIncluded(src) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++)
        if (scripts[i].getAttribute("src") == src) return true;
    return false;
}

function premium_login_set() {
    let hours = 8760; // 1 year in hours
    setCookie("premium_login", 1, hours);
}

function premium_login_unset() {
    let hours = 1;
    setCookie("premium_login", 0, hours);
}

function saveTokn(token, state) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    };
    xhttp.open("POST", base_url + "save_push_token", true);
    var urrl = curent_url;
    var submit = true;

    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(
        "_token=" +
        $('meta[name="_token"]').attr("content") +
        "&submit=" +
        submit +
        "&token=" +
        token +
        "&state=" +
        state +
        "&reg_page=" +
        urrl
    );
}

function cookieAccepted() {
    document.getElementById("consent").style.display = "none";
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    date = new Date(year + 3, month, day);

    date.setTime(date.getTime() + 316224000);
    var expString = "; expires=" + date.toGMTString();
    document.cookie = "cookieAccepted=1" + expString + " path=/;";
}

function toggleM() {
    var x = document.getElementById("topnavbar");
    if (window.getComputedStyle(x).display == "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function copyTextToClipboard(f) {
    // b = document.querySelector(this);
    e = f.innerText;

    var o = document.createElement("textarea");
    (o.style.position = "fixed"),
        (o.style.top = 0),
        (o.style.left = 0),
        (o.style.width = "2em"),
        (o.style.height = "2em"),
        (o.style.padding = 0),
        (o.style.border = "none"),
        (o.style.outline = "none"),
        (o.style.boxShadow = "none"),
        (o.style.background = "transparent"),
        (o.value = e),
        document.body.appendChild(o),
        o.focus(),
        o.select();
    try {
        var t = document.execCommand("copy") ? "successful" : "unsuccessful";
        edpdGlobalShowCopiedAlert(f);
    } catch (e) {
        console.log("Oops, unable to copy");
    } /*setTimeout(function(){copyButton.innerHTML='Copy to clipboard'}.bind(this),1000);*/
    document.body.removeChild(o);
}

function edpdGlobalShowCopiedAlert(e) {
    e.setAttribute("data-title", "Copied");
    setInterval(() => {
        e.setAttribute("data-title", "Click to copy");
    }, 1000);
}

var width = screen.width;
if (width < 1560) {
    if (document.getElementById("adngin-sidebar_4-0") !== null) {
        document.getElementById(
            "adngin-sidebar_4-0"
        ).parentNode.parentNode.style.display = "none";
    }
}
window.onload = function () {
    var width = screen.width;
    if (width < 500) {
        document
            .getElementById("search_query")
            .setAttribute("placeholder", "Enter Search Here");
    } else {
        document
            .getElementById("search_query")
            .setAttribute("placeholder", "Enter Search Term To Find Tool");
    }
};
const detect = document.querySelector("#detect");
const wrapper = document.querySelector("#alert_box_awdws");
if ($("#continue").length) {
    const button = wrapper.querySelector("#continue");
}

window.addEventListener(
    "error",
    function (event) {
        if (event.target && event.target.tagName === "SCRIPT") {
            var blockedUrl = event.target.src || event.target.href;
            if (blockedUrl.includes("snigel")) {
                addBlockerStatus = true;
            }
        }
    },
    true
);

function addBlocker() {
    return addBlockerStatus;
}

function checkAdsBlocker() {
    if (blockerStatus == 0) {
        return false;
    }
    if (addBlocker() == true && emd_is_user_premium == 0) {
        $("#alert_box_awdws").css("display", "block");
        return true;
    }
    return false;
}

$("#background-login-word,#close_login_popup-word").on(
    "click",
    function (event) {
        $(".alert-error-model-word").hide();
    }
);

function showAlertBox(heading, text) {
    $(".alrt-label").text(heading);
    $(".alrt-text").html(text);
    $(".alert-error-model").show();
}

function showLimitBox(heading, text, buttons = true) {
    $(".alrt-label-word").text(heading);
    $(".alrt-text-word").html(text);
    $(".alert-error-model-word").show();
    if (buttons) {
        $(".alert-error-model-word .alert_box_awdws_btns").show();
    } else {
        $(".alert-error-model-word .alert_box_awdws_btns").hide();
    }
}

function updateTextStatistics(text = '', charCountId = 'charCount', sentenceCountId = 'senCount', wordCountId = 'wordCount') {
    // Calculate the number of characters
    const charCount = text.length;

    // Calculate the number of sentences (based on common sentence-ending punctuation)
    const sentenceCount = text.split(/[.!?]+\s*/).filter(sentence => sentence.trim() !== "").length;

    // Calculate the number of words (splitting by whitespace and filtering out empty entries)
    const wordCount = text.split(/\s+/).filter(word => word.trim() !== "").length;

    // Update the respective HTML elements with the calculated values
    document.getElementById(charCountId).textContent = charCount;
    document.getElementById(sentenceCountId).textContent = sentenceCount;
    document.getElementById(wordCountId).textContent = wordCount;
}

function wordCount(text) {
    try {
        text = text.trim();
        if (text === '') {
            return 0;
        }
        const plainText =
            text
                ?.replace(/<br\s*\/?>/gi, " ")
                .replace(/&nbsp;/gi, " ")
                .replace(/<\/?[^>]+(>|$)/g, " ")
                .replace(/[^\p{L}\p{N}\s'-]+/gu, "")
                .replace(/\s+/g, " ")
                .trim() ?? "";

        return plainText ? plainText.split(/\s+/).length : 0;
    } catch (e) { console.error(e) }
}

$(document).mouseup(function (e) {
    var container = $(".capDiv");
    if (
        (!container.is(e.target) && container.has(e.target).length === 0) ||
        e.target.classList.value.indexOf("ppsbox-close") != -1
    ) {
        $(".captcha-model").hide();
    }
});
var randomNumber = Math.floor(Math.random() * 100);

if (randomNumber <= 4) {
    (function (c, l, a, r, i, t, y) {
        c[a] =
            c[a] ||
            function () {
                (c[a].q = c[a].q || []).push(arguments);
            };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", "gfcpprs9t4");
}

function stopB(e) {
    if (!e) e = window.event;
    e.cancelBubble = true;
}

const usingLockedModes = (modes) => {
    if (isThisToolPremium) return false;
    // Iterate through each locked mode
    for (let mode in modes) {
        if (modes.hasOwnProperty(mode)) {
            let modeValues = modes[mode];
            let modeValue = $(mode).val();

            // Check if the value is in the corresponding array
            if (modeValues.includes(modeValue)) {
                console.error(
                    `${mode} has value ${modeValue} which is not compatible with current plan!`
                );
                return true;
            }
        }
    }
    return false;
};

const checkBlock = (mode, premiums) => {
    let flag = !isThisToolPremium && premiums.includes(parseInt(mode));
    if (flag) {
        $(`.modes[mode-data="${mode}"]`).addClass("blocked");
    }
    return flag;
};

$(".sample__button").each(function () {
    let targetInput = $(this).data("target");

    $(targetInput).on("input change", function () {
        if ($(this).val() === "" && $(this).text() === "") {
            // Show only the button associated with this input
            $(
                `.sample__button[data-target='${targetInput}'], .paste__button[data-target='${targetInput}']`
            ).removeClass("d-none");
        } else {
            // Hide only the button associated with this input
            $(
                `.sample__button[data-target='${targetInput}'], .paste__button[data-target='${targetInput}']`
            ).addClass("d-none");
        }
    });
});

$(".paste__button").on("click", function (event) {
    let targetInput = $(this).data("target");
    navigator.clipboard.readText().then((text) => {
        if (text != "") {
            $(targetInput).trigger("change").trigger("keyup").trigger("input");
            $(
                `.sample__button[data-target='${targetInput}'], .upload__button, .paste__button[data-target='${targetInput}']`
            ).addClass("d-none");
            if ($(targetInput).is("div")) {
                $(targetInput).html(text.replaceAll('\n', '<br>'));
            } else {
                $(targetInput).val(text);
            }
            try {
                $(targetInput)
                    .trigger("change")
                    .trigger("keyup")
                    .trigger("input");
            } catch (e) {
            }
        }
    });
});

$(".sample__button").on("click", function (event) {
    let targetInput = $(this).data("target");
    if (sampleText != "") {
        $(
            `.sample__button[data-target='${targetInput}'], .upload__button, .paste__button[data-target='${targetInput}']`
        ).addClass("d-none");
        if ($(targetInput).is("div")) {
            $(targetInput).text(sampleText);
        } else {
            $(targetInput).val(sampleText);
        }
        try {
            $(targetInput).trigger("change").trigger("keyup").trigger("input");
        } catch (e) {
        }
    }
});

$(document).on("click", ".sent__copy__btn", function () {
    CopyToClipboardElement($(this).data("target"));
    $(this).attr("data-tooltip", "Copied");
    setTimeout(() => {
        $(this).attr("data-tooltip", "Copy");
    }, 1500);
});

$(document).on("click", ".rephrase-upgrade", function (e) {
    e.preventDefault();
    $(".premium__plans__popup").removeClass("d-none");
});

$(document).ready(function () {
    // Function to check and hide buttons
    function checkAdjacentFields() {
        // Iterate through each button group
        $('.paste__button, .sample__button, .upload__button').each(function () {
            // Check for adjacent input or textarea that is not empty
            const adjacentField = $(this).siblings('input, textarea').filter(function () {
                return $(this).val().trim() !== '';
            });

            // Hide buttons if adjacent input or textarea is not empty
            if (adjacentField.length > 0) {
                $(this).hide();
            } else {
                $(this).css('display', 'flex');
            }
        });
    }

    // Initial check on page load
    setTimeout(function () {
        checkAdjacentFields();
    }), 500;

    // Event listener for input fields inside .register or .login forms
    $('.register input, .login input').on('keydown', function (e) {
        // Check if the Enter key is pressed (key code 13)
        if (e.key === 'Enter' || e.keyCode === 13) {
            // Prevent the default Enter key action
            e.preventDefault();

            // Check if the input is inside the .login form
            if ($(this).closest('.login').length > 0) {
                // Trigger the loginAccount function
                loginAccount($(this).closest('form')[0]);
            }
            // Check if the input is inside the .register form
            else if ($(this).closest('.register').length > 0) {
                // Trigger the createAccount function and return its result
                return createAccount();
            }
        }
    });

    $(document).on('click', function (e) {
        const $target = $(e.target); // The actual clicked element

        if ($target.hasClass('selected-language') || $target.closest('.selected-language').length > 0) {
            $(".language-dropdown").toggleClass('active');
        } else {
            $(".language-dropdown").removeClass('active');
        }
    });

    $('.lang-drop-li').on('click', function (e) {
        $(".selected-language > span").text($(this).text());
    });

    $(".footer-menu-links .chat__button").on('click', function (e) {
        e.preventDefault();
    });

    $(".getStarted__button, .getStarted__btn").on('click', premium_login_set);
    $(".getStarted__free__button").on('click', premium_login_unset);

    if (typeof typingEffectToggle !== 'undefined' && typingEffectToggle) {
        $('.typing-placeholder').each(function () {
            const $el = $(this);
            const initialPlaceholder = $el.attr('placeholder') || '';
            const sampleData = $el.data('sample') || '';
            const separator = $el.data('separator') || '|';
            const samples = sampleData.split(separator).map(s => s.trim()).filter(s => s);
            const typingSpeed = 60;
            const eraseSpeed = 10;
            const delayBetweenSamples = 1000;

            let currentPlaceholder = '';
            let lastSample = null;

            // Typing effect for the initial placeholder
            function typePlaceholder(index = 0) {
                if (index < initialPlaceholder.length) {
                    currentPlaceholder += initialPlaceholder.charAt(index);
                    $el.attr('placeholder', currentPlaceholder);
                    setTimeout(() => typePlaceholder(index + 1), typingSpeed);
                } else {
                    setTimeout(startSampleLoop, 1000);
                }
            }

            // Get a new random sample that is not the same as the last one
            function getNewSample() {
                if (samples.length <= 1) return samples[0];
                let newSample;
                do {
                    newSample = samples[Math.floor(Math.random() * samples.length)];
                } while (newSample === lastSample);
                lastSample = newSample;
                return newSample;
            }

            // Typing sample text with erase effect
            function startSampleLoop() {
                if (samples.length === 0) return;

                const sample = getNewSample();
                let index = 0;

                function typeSample() {
                    if (index <= sample.length) {
                        $el.attr('placeholder', sample.slice(0, index));
                        index++;
                        setTimeout(typeSample, typingSpeed);
                    } else {
                        setTimeout(() => eraseSample(sample.length), delayBetweenSamples);
                    }
                }

                function eraseSample(length) {
                    if (length >= 0) {
                        $el.attr('placeholder', sample.slice(0, length));
                        setTimeout(() => eraseSample(length - 1), eraseSpeed);
                    } else {
                        setTimeout(startSampleLoop, 500);
                    }
                }

                typeSample();
            }

            // Clear and begin typing effect
            $el.attr('placeholder', '');
            typePlaceholder();
        });
    }
});

// Listen for keydown events on the document
document.addEventListener('keydown', function (event) {
    if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyF') || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        // Prevent default behavior (if needed, like opening browser search)
        event.preventDefault();
        // Call the function
        openSearchBar();
    }
});

// If we are inside any input and hot Ctrl + Enter it will send the tool request
document.addEventListener('keydown', function (e) {
    // Check if Ctrl + Enter is pressed
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        // Check if the active element is an input, textarea, or contenteditable div
        const activeElement = document.activeElement;
        if (
            (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                (activeElement.isContentEditable)
            ) &&
            (
                activeElement.id !== 'search_query'
            )
        ) {
            // Prevent the default action
            e.preventDefault();

            // Click the .main-btn
            const mainButton = document.querySelector('.main-btn');
            if (mainButton) {
                mainButton.click();
            }

            // Click the .main-btn
            const essayButton = document.querySelector('.write__essay');
            if (essayButton) {
                essayButton.click();
            }
        }
    }
});

document.addEventListener('keydown', function (e) {
    // Check if the ESC key is pressed
    if (e.key === 'Escape') {
        // Check visibility of .alert-error-model-word or .alert-error-model
        const wordModel = document.querySelector('.alert-error-model-word');
        const errorModel = document.querySelector('.alert-error-model');
        const premiumPopup = document.querySelector('.premium__plans__popup');
        const feedBackPopup = document.querySelector('#edtpd_feedback_modal_wrapper');
        const deleteNotePopup = document.querySelector('.delete__popup__wrapper');
        const formatedPopup = document.querySelector('.formated__popup__wrapper');

        if ((wordModel && $(wordModel).is(':visible')) ||
            (errorModel && $(errorModel).is(':visible'))) {
            // Hide the visible elements
            if (wordModel && $(wordModel).is(':visible')) {
                $(wordModel).hide();
            }
            if (errorModel && $(errorModel).is(':visible')) {
                $(errorModel).hide();
            }

            // Optionally, prevent default behavior
            e.preventDefault();
        }

        if (premiumPopup && $(premiumPopup).is(':visible')) {
            $(premiumPopup).addClass('d-none');
            // Optionally, prevent default behavior
            e.preventDefault();
        }

        if (feedBackPopup && $(feedBackPopup).is(':visible')) {
            $(feedBackPopup).hide();
            // Optionally, prevent default behavior
            e.preventDefault();
        }

        if (deleteNotePopup && $(deleteNotePopup).is(':visible')) {
            $("#close__delete__popup").click();
        }

        if (formatedPopup && $(formatedPopup).is(':visible')) {
            $(".continue__formatting").click();
        }
    }
});

function CopyToClipboardInput(containerid) {
    var textToCopy = document.getElementById(containerid).value; // Get only the text content
    CopyToClipboardText(textToCopy);
}

function CopyToClipboardElement(containerid) {
    var textToCopy = document.getElementById(containerid).innerText; // Get only the text content
    CopyToClipboardText(textToCopy);
}

function CopyToClipboardText(textToCopy) {
    navigator.clipboard.writeText(textToCopy) // Use the Clipboard API to copy the text
        .then(() => {
            try {
                // Set the "Copied" tooltip
                var element = document.getElementById("lower");
                element.setAttribute("data-title", "Copied");

                // Revert tooltip after 1 second
                setTimeout(() => {
                    element.setAttribute("data-title", "Click to copy");
                }, 1000);
            } catch (e) {
            }
        })
        .catch(err => {
            console.error("Could not copy text: ", err);
        });
}


// Dropdown handlers
const handleDropdownToggleComponent = (targetClass, toggleClass, activeClass) => {
    $(document).on("click", event => {
        const targetElement = $(event.target);
        if (!targetElement.hasClass(targetClass) &&
            targetElement.closest(`.${toggleClass}`).length === 0) {
            $(`.${targetClass}`).slideUp(200);
            $(`.${toggleClass}`).removeClass("active");
        }
    });
};

// Initialize dropdowns
handleDropdownToggleComponent("ep-dropdown", "ep-dropdown_active");

$(document).ready(function () {
    function autoBlurTooltip() {
        if (/Mobi|Android/i.test(navigator.userAgent)) { // Check if it's a mobile device
            setTimeout(function () {
                $('.tooltip').trigger('blur'); // Trigger blur event
                $('.tooltip').removeClass('active'); // Optionally remove active class
            }, 1500);
        }
    }

    $('.tooltip').on('focus', function () {
        autoBlurTooltip(); // Call function when tooltip is focused
    });
});

// Essay type and level selection
$(".ep-dropdown_active").click(function () {
    let hideCurrent = false;
    if (!$(this).siblings(".ep-dropdown").is(':visible')) {
        hideCurrent = true;
    }
    $(".ep-dropdown").not($(this).siblings(".ep-dropdown")).slideUp(200);
    $(this).siblings(".ep-dropdown").slideDown(200);
    $(".ep-dropdown_active").removeClass("active");
    if (hideCurrent) {
        $(this).siblings(".ep-dropdown").slideDown(200);
    } else {
        $(this).siblings(".ep-dropdown").slideUp(200);
    }
});
$(".ep-dropdown button").click(function () {
    $(this).parent().siblings(".ep-dropdown_active")
        .find('p').text($(this).text());
    $(this).siblings(".ep-dropdown").slideToggle(200);
    $(".ep-dropdown_active").removeClass("active");
});

function downloadResultText(selector, input = true, resultText = "") {
    let editorContent;
    if(selector){
        if (input) {
        editorContent = $(selector).val();
    } else {
        try {
            let raw = $(selector).html();
            raw = raw.replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n\n')
                .replace(/<\/div>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            editorContent = raw;
        } catch (e) {
            editorContent = $(selector).text().trim();
        }
    }
    }

    if(resultText) editorContent = resultText;
    let fileName = `editpad-${Date.now()}.txt`;

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
}

function decodeHtmlEntities(str) {
    // Create a temporary DOM element
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
}

function userInputLog(input, output = null, mode = 'N/A', selectedLanguage = toolLang, userInputKey = null, req_key = null, input_count = null) {
    try {
        $.ajax({
            type: "POST",
            url: userInputRoute,
            data: {
                _token: $('meta[name="_token"]').attr("content"),
                input,
                output_log: output,
                tool_lang: toolLang,
                parent_id: loadedToolID,
                tool_slug: loadedToolSlug,
                output_lang: selectedLanguage,
                mode: mode,
                isThisToolPremium: isThisToolPremium,
                e_track_key: getETrackKey(),
                user_input_key: userInputKey,
                req_key: req_key,
                input_count
            },
            error: function (error) {
                console.log(error);
            },
        });
    } catch (e) {
    }
}

(function ($) {
    $.fn.shake = function (options) {
        // Default settings
        var settings = $.extend({
            shakes: 4, // Number of shakes
            distance: 10, // Shake distance in pixels
            duration: 100 // Duration of each shake in milliseconds
        }, options);

        this.each(function () {
            var $element = $(this);
            var originalPosition = $element.css('position');
            if (originalPosition != 'fixed' && originalPosition != 'absolute') {
                $element.css('position', 'relative');
            }

            var originalLeft = parseFloat($element.css('left') || 0);

            for (var i = 0; i < settings.shakes; i++) {
                $element.animate({ left: originalLeft - settings.distance }, settings.duration / settings.shakes)
                    .animate({ left: originalLeft + settings.distance }, settings.duration / settings.shakes);
            }
            $element.animate({ left: originalLeft }, settings.duration / settings.shakes);
        });

        return this; // Enable chaining
    };
}(jQuery));

// Function to set a value in session storage
function setSessionValue(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

// Function to get a value from session storage
function getSessionValue(key) {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

// Function to clear all session storage data
function clearSessionStorage() {
    sessionStorage.clear();
}

async function detectLanguage(text) {
    const trimmedText = text.trim().split(/\s+/).slice(0, 50).join(' ');

    try {
        // Attempt to detect language via server-side
        const response = await fetch('/detect-language', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
            },
            body: JSON.stringify({ text: trimmedText })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.language && typeof result.language === 'string') {
                return result.language; // expected ISO 639-1 format from server
            }
        }

        // If server returns invalid response, fall through to fallback
        console.warn("Invalid response from server. Falling back to client detection.");
    } catch (error) {
        console.warn("AJAX detection failed. Falling back to client detection.", error);
    }

    // Fallback: use franc-min and langs
    const [{ franc }, langs] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/franc-min@6.1.0/+esm"),
        import("https://cdn.jsdelivr.net/npm/langs@2.0.0/+esm")
    ]);

    const iso3 = franc(trimmedText);
    const lang = langs.where("3", iso3);
    return lang ? lang["1"] : "und"; // Return ISO 639-1 or 'und'
}

function moveSpecialCharsOutOfBTags(html, moveBrTags = false) {
    // Regular expression to match <b> tags with text and special characters
    let bTagRegex;

    if (moveBrTags) {
        // This regex aims to capture the word characters inside <b>
        // and then everything else (including spaces, punctuation, and <br> tags)
        // until the closing </b> tag.
        bTagRegex = /<b>(\w+)([\s\S]*?)<\/b>/g;
    } else {
        // Original behavior: only non-word characters are moved out
        bTagRegex = /<b>(\w+)([^\w]*)<\/b>/g;
    }

    // Replace function to move special characters outside <b> tags
    return html.replace(bTagRegex, (match, textPart, specialChars) => {
        // Only bold the text part and place special characters outside
        // For the moveBrTags case, we might need to be careful with spaces if they are part of the text.
        // The original regex for `moveBrTags` had `\s` which includes spaces, tabs, newlines, etc.
        // It's generally safer to just trim `textPart` if `\s` is part of it.
        const trimmedTextPart = textPart.trim();
        return `<b>${trimmedTextPart}</b>${specialChars}`;
    });
}

// JavaScript Function
function copyFormattedContent(divId) {
    const element = document.getElementById(divId);

    if (!element) return;

    // Create a temporary container with the same HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = element.innerHTML;

    // Hide the temp container
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    // Create a range and select the content
    const range = document.createRange();
    range.selectNodeContents(tempDiv);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        // Execute the copy command
        const success = document.execCommand("copy");
        if (success) {
            console.log("Formatted content copied to clipboard.");
        } else {
            console.error("Copy command failed.");
        }
    } catch (err) {
        console.error("Unable to copy.", err);
    }

    // Clean up
    selection.removeAllRanges();
    document.body.removeChild(tempDiv);
}
function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

/*
|======================================================*
|            handling prose mirror editor
|======================================================*
*/
function removeHtmlAndPreserveLineBreaks(htmlContent) {
    // Replace <br> tags and block-level tags with a line break placeholder
    var withPlaceholders = htmlContent.replace(/<br\s*[\/]?>/gi, '__LINE_BREAK__')
        .replace(/<\/?(p|div|h[1-6]|ul|ol|li|blockquote)[^>]*>/gi, '__LINE_BREAK__');

    // Create a jQuery object and set its HTML to the modified string
    var $temp = $("<div>").html(withPlaceholders);

    // Extract the text, which removes all HTML tags
    var text = $temp.text();

    // Replace the placeholders with actual line breaks
    return text.replace(/__LINE_BREAK__/g, "\n").trim();
}


    $(window).on('keydown', function(e){
        if ($(document.activeElement).hasClass('ql-title') && e.key === 'Tab') {
            e.preventDefault();
            if($("#editorTextarea").hasClass('proseEditorTextarea')){
                editorSection.dom.focus();
            }else{
                $('#textarea__editor').focus();
            }
        }
    });


function exportContentToHTML(editorState) {
    const serializer = DOMSerializer.fromSchema(editorState.schema);
    const content = editorState.doc;
    const htmlString = serializer.serializeFragment(content.content);
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(htmlString);
    // var contentData = tempDiv.innerHTML.replaceAll('<br>', '@@@');
    var textContent = removeHtmlAndPreserveLineBreaks(tempDiv.innerHTML);


    // var contentData = tempDiv.innerHTML.replaceAll('<p></p>', '@@@');




    // var textContent = tempDiv.textContent
    // textContent = textContent.replaceAll('@@@', '\n');




    // textContent = textContent.replaceAll('<p></p>', '\n');
    return textContent;
}

class MenuView {
    constructor(items, editorView) {
        this.items = items;
        this.editorView = editorView;

        this.dom = document.createElement("div");
        this.dom.className = "custom__menubar ql-toolbar";
        items.forEach(({
            dom
        }) => this.dom.appendChild(dom));
        this.update();

        this.dom.addEventListener("mousedown", e => {
            e.preventDefault();
            editorView.focus();
            items.forEach(({
                command,
                dom
            }) => {
                if (dom.contains(e.target))
                    command(editorView.state, editorView.dispatch, editorView);
            });
        });
    }

    update() {
        this.items.forEach(({
            command,
            dom
        }) => {
            let active = command(this.editorView.state, null, this.editorView);
            dom.style.display = active ? "" : "none";
        });
    }

    destroy() {
        this.dom.remove();
    }
}


function menuPlugin(items) {
    return new prosePlugin({
        view(editorView) {
            let menuView = new MenuView(items, editorView);
            editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
            return menuView;
        }
    });
}


// Helper function to create menu icons
function icon(text, name) {
    let span = document.createElement("span");
    span.className = "menuicon " + name;
    span.title = name;
    span.textContent = text;
    return span;
}



// Create an icon for a heading at the given level
function heading(level) {
    return {
        command: setBlockType(mySchema.nodes.heading, {
            level
        }),
        dom: icon("H" + level, "heading")
    };
}

function createCustomIcon(command, customClass, imageSrc) {
    const iconElement = document.createElement('img');
    iconElement.src = document.location.origin + '/web_assets/frontend/images/prose-mirror-icons/' + imageSrc + '.svg?v1.2';
    iconElement.alt = command; // Set alt text as the command name for accessibility
    iconElement.classList.add(customClass);

    iconElement.addEventListener('click', () => {
        // Handle the click event, execute the command, etc.
        // For simplicity, you can trigger the command directly
        const currentState = editorSection.state;
        const dispatch = editorSection.dispatch;
        try {
            const commandFunction = menu.find(({
                dom
            }) => {
                return dom === iconElement;
            }).command;
            if (commandFunction) {
                commandFunction(currentState, dispatch);
            }
        } catch (error) {
            console.log(error)
        }

    });

    return iconElement;
}



// =========================================
// main function to init prose mirror editor
// ========================================

var addProseScript = false;

function initProseMirrorEditor(content, isQuillContent, handleTextChange) {

    if (!addProseScript) {
        var proseEditorStyle = document.createElement('link');
        proseEditorStyle.href = 'web_assets/frontend/css/prosemirror.css?v1.5';
        document.head.appendChild(proseEditorStyle);


        var proseEditorScript = document.createElement('script');
        proseEditorScript.src = 'build/assets/app-9f513143.js';
        document.head.appendChild(proseEditorScript);
        proseEditorScript.onload = function () {
            startProseMirroEditor(content, isQuillContent, handleTextChange);
        }
    } else {
        startProseMirroEditor(content, isQuillContent, handleTextChange);
    }
}


function startProseMirroEditor(content, isQuillContent, handleTextChange) {
    currentEditorType = 1;
    $("body").removeClass('ace__editor__init');
    $("#editorTextarea").html('');
    isFormatingOn = true;
    $(".toggle__formating input").prop('checked', true);
    const mySchema = new Schema({
        nodes: addListNodes(basicSchema.spec.nodes, "paragraph block*", "block", 'block+'),
        marks: basicSchema.spec.marks
    });

    // console.log();
    window.mySchema = mySchema;
    if (isQuillContent) {
        deltaOps = JSON.parse(content).ops;
        var cfg = {};
        var converter = new QuillDeltaToHtmlConverter(deltaOps, cfg);

        var html = converter.convert();

        // Get the initial HTML content from a placeholder element
        let initialHtml = html;
        document.querySelector("#content").innerHTML = initialHtml;

        initialDoc = DOMParser.fromSchema(mySchema).parse(document.querySelector("#content"))
    } else {
        if (content.includes(`{"type":"doc",`)) {
            deltaOps = JSON.parse(content)
            initialDoc = mySchema.nodeFromJSON(deltaOps);
        } else {
            deltaOps = content;
            deltaOps = deltaOps.replaceAll('\n', '<br>');
            document.querySelector("#content").innerHTML = deltaOps;
            initialDoc = DOMParser.fromSchema(mySchema).parse(document.querySelector("#content"))
        }
    }

    let menu = menuPlugin([{
            command: toggleMark(mySchema.marks.strong),
            dom: createCustomIcon("b", "bold-icon", 'bold-icon')
        },
        {
            command: toggleMark(mySchema.marks.em),
            dom: createCustomIcon("i", "italic-icon", 'italic-icon')
        },
        {
            command: setBlockType(mySchema.nodes.paragraph),
            dom: createCustomIcon("p", "paragraph-icon", 'paragraph-icon')
        },
        heading(1), heading(2), heading(3), heading(4), heading(5), heading(6),
        {
            command: wrapIn(mySchema.nodes.bullet_list),
            dom: createCustomIcon("bullet_list", "bullet-list-icon", 'list-bullet-icon'),
        },
        {
            command: wrapIn(mySchema.nodes.ordered_list),
            dom: createCustomIcon("number_list", "list-number-icon", 'list-number-icon'),
        },
        {
            command: undo,
            dom: createCustomIcon('Undo', 'undo', 'undo-icon')
        },
        {
            command: redo,
            dom: createCustomIcon('Redo', 'redo', 'redo-icon')
        },

    ]);

    window.menu = menu;
    // Assuming you have a div with id "editorTextarea" in your HTML
    $("#editorTextarea").addClass('proseEditorTextarea').removeClass('aceEditorTextarea');
    var pluginsList = [keymap(buildKeymap(mySchema)), menu];
    var setupPlugin = exampleSetup({
        schema: mySchema
    });
    var pluginsList = [...pluginsList, ...setupPlugin];
    window.pluginsList = pluginsList;

    var isNoteEditable = isSharedNote ? false : true;

    window.editorSection = new EditorView(document.querySelector("#editorTextarea"), {
        state: EditorState.create({
            doc: initialDoc,
            plugins: pluginsList
        }),
        editable: (state) => isNoteEditable,

        dispatchTransaction(transaction) {
            const newState = editorSection.state.apply(transaction);
            editorSection.updateState(newState);
            const doc = editorSection.state.doc;
            const json = doc.toJSON();
            if (!isSharedNote) {
                handleTextChange(doc.toJSON(), 'json');
                runDisableObserver();
            }
        },
    });


    $(".custom__menubar").prepend(`<span class="heading__face">Headings <img src="${document.location.origin}/web_assets/frontend/images/prose-mirror-icons/dropdown-icon.svg" /><span>`);
    $(".heading__face").on('click', function () {
        //    $(".custom__headings").toggleClass('active');
    });


    $(".heading__face").on('click', function () {
        $('.custom__menubar .heading').toggleClass('active');
    });

    $(document).on('click', ".heading", function () {
        $(".heading").removeClass('active');
    })

    $(document).on('click', function (e) {
        if (!$(e.target).hasClass('heading__face')) {
            $(".heading").removeClass('active');
        }
    });

}



function runDisableObserver() {
    const targetElement = $(".custom__menubar span, .custom__menubar img");
    targetElement.each((i, e) => {
        try {
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (e.style.display === 'none') {
                            e.classList.add('less-opacity');
                        } else {
                            e.classList.remove('less-opacity');
                        }
                    }
                }
            });
            // Configure and start the observer
            const observerConfig = {
                attributes: true,
                attributeFilter: ['style']
            };
            observer.observe(e, observerConfig);
        } catch (error) {
            console.log(error, 'errorerrorerrorerror');
        }
    });

}

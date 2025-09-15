function initAceEditor(content = null, isQuillContent = false, handleTextChange) {
    if (isQuillContent) {
        deltaOps = JSON.parse(content).ops;
        var cfg = {};
        var converter = new QuillDeltaToHtmlConverter(deltaOps, cfg);

        content = converter.convert();
        content = removeHtmlAndPreserveLineBreaks(content);
    }

    isFormatingOn = false;
    $("body").addClass('ace__editor__init');
    $(".toggle__formating input").prop('checked', false);
    $("#editorTextarea").html('<textarea id="textarea__editor"></textarea>');
    $("#editorTextarea").removeClass('proseEditorTextarea');
    document.querySelector('#textarea__editor').textContent = content;
    $('#textarea__editor').focus();
    $(document).on('input', '#textarea__editor', function () {
        handleTextChange($(this).val(), 'text');
    });
}

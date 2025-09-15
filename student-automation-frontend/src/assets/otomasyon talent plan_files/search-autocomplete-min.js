function boldString(fullString, searchString) {
    // Find the index of the search string within the full string
    var index = fullString.toUpperCase().indexOf(searchString.toUpperCase());
    if (index >= 0) {
        // If the search string is found, insert bold HTML markup around it
        var boldedText = fullString.substring(0, index) + '<b>' +
            fullString.substring(index, index + searchString.length) + '</b>' +
            fullString.substring(index + searchString.length);
        return "<pre>" + boldedText + "</pre>";
    } else {
        // If the search string is not found, return the original string
        return fullString;
    }
}

function openSearchBar() {
    document.querySelector("#search-bar-global").style.display = "block";
    document.getElementById("search_query").focus();
}

function closeSearchBar(el) {
    document.addEventListener('click', function (event) {
        const targetElement = $(event.target);
        if (targetElement.hasClass("search_parent") || targetElement.hasClass("close-search")) {
            document.querySelector("#search-bar-global").style.display = "none";
            document.getElementById("search_query").value = "";
        }
    })
}

function autocomplete(o, i, toolLang, otherLangSameTool) {
    var l;

    function c(e) {
        for (var t = document.getElementsByClassName("autocomplete-items"), n = 0; n < t.length; n++) e != t[n] && e != o && t[n].parentNode.removeChild(t[n])
    }

    o.addEventListener("input", function (e) {
        if (toolLang == 'en') {
            baseUrlLaunch = '/tool/';
        } else {
            baseUrlLaunch = `/tool/${toolLang}/`;
        }
        var inputValue = this.value;
        clearAutocomplete(); // Function to clear previous autocomplete suggestions
        if (!inputValue) return false;
        var autocompleteList = document.createElement("DIV");
        autocompleteList.setAttribute("id", this.id + "autocomplete-list");
        autocompleteList.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(autocompleteList);

        for (var n = 0; n < i.length; n++) {
            var searchTerm = i[n][1];
            var searchIndex = searchTerm.toUpperCase().indexOf(inputValue.toUpperCase());
            searchIndex = Math.max(0, searchIndex);
            if (searchTerm.substr(searchIndex, inputValue.length).toUpperCase() == inputValue.toUpperCase()) {
                var autocompleteItem = document.createElement("a");
                autocompleteItem.innerHTML += boldString(searchTerm, inputValue);

                baseUrlLaunch = i[n][2] != 'en' ? `/tool/${i[n][2]}/${i[n][0]}` : `/tool/${i[n][0]}`;
                if (i[n][0] == 'home') {
                    baseUrlLaunch = i[n][2] != 'en' ? "/" + i[n][2] : '';
                }

                autocompleteItem.setAttribute('href', window.location.origin + baseUrlLaunch);
                autocompleteList.appendChild(autocompleteItem);
            }
        }
        // if (otherLangSameTool.length > 1) {
        //     var currentToolOtherLanguages = ``;

        //     otherLangSameTool.forEach(n => {
        //         var langSlug = n[2] != 'en' ? n[2] + '/' + n[0] : n[0];
        //         var toolOtherLang = `<a href="${window.location.origin}/tool/${langSlug}" onClick="${() => openSearchTool()}">${boldString(n[1], inputValue)}</a>`;
        //         toolOtherLang.innerHTML += "<input type='hidden' value='" + n[0] + "'>";
        //         currentToolOtherLanguages += toolOtherLang;
        //     });
        //     $(autocompleteList).html($(autocompleteList).html() + `<br><div class="search__bar__other__lan">${currentToolOtherLanguages}</div>`)
        // }

        if (autocompleteList.innerHTML.length <= 0) {
            autocompleteList.innerHTML = '<span style="display:block;width:100%;text-align:center;"><strong>Nothing Found</strong></span>';
        }
    });

    document.addEventListener("click", function (e) {
        clearAutocomplete(e.target); // Function to clear autocomplete if clicked outside
    });

    function clearAutocomplete(excludeElement) {
        var autocompleteLists = document.querySelectorAll(".autocomplete-items");
        autocompleteLists.forEach(function (list) {
            if (excludeElement && list.contains(excludeElement)) return;
            list.parentNode.removeChild(list);
        });
    }
}


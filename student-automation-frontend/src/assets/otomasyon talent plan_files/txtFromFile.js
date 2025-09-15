const loadedScripts = new Set(); // Track loaded script URLs or IDs

const loadScriptsDynamically = (scripts) => {
    if (!scripts || scripts.length === 0) return;

    scripts.forEach(scriptInfo => {
        // Check if the script has already been loaded
        if (loadedScripts.has(scriptInfo.src)) return;

        const script = document.createElement('script');
        script.src = scriptInfo.src;
        script.async = true; // Set async or defer based on your needs
        // script.defer = true; // Uncomment if you want to use defer

        if (scriptInfo.id) {
            script.id = scriptInfo.id;
        }
        if (scriptInfo.type) {
            script.type = scriptInfo.type;
        }
        if (scriptInfo.attributes) {
            Object.keys(scriptInfo.attributes).forEach(attr => {
                script.setAttribute(attr, scriptInfo.attributes[attr]);
            });
        }

        // Handle script load and error events
        script.onload = () => {
            loadedScripts.add(scriptInfo.src); // Mark script as loaded
            // console.log(`Script loaded: ${scriptInfo.src}`);
        };
        script.onerror = () => {
            // console.error(`Failed to load script: ${scriptInfo.src}`);
        };

        document.head.appendChild(script);
    });
};

// Function to read text from various file types and return as a Promise
const getTextFromFile = (file) => {
    // Ensure we return a Promise that resolves with the extracted text
    return new Promise((resolve, reject) => {
        if (file.type === 'text/plain' || file.type === '') {
            // Plain text file
            readTextFile(file).then(resolve).catch(reject);
        } else if (file.type === 'application/pdf') {
            // PDF file
            readPdfFile(file).then(resolve).catch(reject);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // DOCX file (using Mammoth)
            readDocumentFile(file).then(resolve).catch(reject);
        } else if (file.type === "application/msword") {
            var formData = new FormData();
            formData.append("file", file);
            formData.append("_token", $('meta[name="_token"]').attr("content"));
            formData.append("getFileContent", true);
            promiseReadFile(formData).then(resolve).catch(reject);
        }
        else {
            // Unsupported file type
            showAlertBox('Error', `File type: ${file.type} is not supported`);
            reject(new Error('Unsupported file type'));
        }
    });
}
const readFile = (file) => {
    return new Promise((resolve, reject) => {
        var fileName = file.name;
        var fileExtension = fileName.substr(fileName.lastIndexOf(".") + 1);
        const allowedExtensions = ["txt", "pdf", "docx", "doc"];
        if (allowedExtensions.includes(fileExtension)) {
            getTextFromFile(file)
                .then((text) => {
                    resolve(text);
                })
                .catch((error) => {
                    console.error('Error reading file:', error);
                    reject(error);
                });
        } else {
            showAlertBox('Error', 'File Type Not Allowed');
            reject(new Error('File Type Not Allowed'));
        }
    });
};


const promiseReadFile = (formdata) => {
    return new Promise((resolve, reject) => {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
            }
        });

        $.ajax({
            url: base_url + 'getTxtFrmFile',
            type: 'POST',
            data: formdata,
            contentType: false,
            processData: false,
            success: function (response) {
                try {
                    // let result = stripHtml(response) || response;
                    resolve(response); // Resolve the Promise with the result
                } catch (error) {
                    reject(error); // Reject the Promise if an error occurs
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                showAlertBox('Error', 'Failed to read file content from server.');
                reject(textStatus); // Reject the Promise with the error message
            }
        });
    });
};

// Function to read text from a plain text file
const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function (event) {
            const textContent = event.target.result;
            resolve(textContent);
        };
        reader.onerror = function () {
            showAlertBox('Error', 'Error reading text file');
            reject(new Error('Error reading text file'));
        }
        reader.readAsText(file);
    });
}

// Function to read text from a PDF file
const readPdfFile = (file) => {
    // https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = async (e)=> {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

                const pagesText = await Promise.all(
                    Array.from({ length: pdf.numPages }, (_, i) => getPageText(i + 1, pdf))
                );

                resolve(pagesText.join("\n\n"));
            } catch (error) {
                reject(err);
            }
        };
        reader.onerror = function () {
            showAlertBox('Error', 'Error reading PDF file');
            reject(new Error('Error reading PDF file'));
        }
        reader.readAsArrayBuffer(file);
    });
}

const readDocumentFile = (file) => {
    // https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function (event) {
            var arrayBuffer = event.target.result;
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then(function (result) {
                    var text = result.value; // The raw text
                    resolve(text);
                })
                .catch(function (err) {
                    showAlertBox('Error', 'Error extracting text from DOCX file: ' + err.message);
                    reject(new Error('Error extracting text from DOCX file: ' + err));
                });
        };
        reader.onerror = function () {
            showAlertBox('Error', 'Error reading DOCX file');
            reject(new Error('Error reading DOCX file'));
        }
        reader.readAsArrayBuffer(file);
    });
}


const getPageText = async (pageNum, pdf) => {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let text = "";
    let lastY = null;

    textContent.items.forEach((item) => {
        if (lastY !== null && item.transform[5] !== lastY) {
            text += "\n"; // Preserve original line breaks
        }
        text += item.str + " ";
        lastY = item.transform[5]; // Track Y-position
    });

    // Remove excessive spaces *inside* lines, but preserve new lines
    return text.replace(/[ ]{2,}/g, " ").trim();
}

const scriptsToLoad = [
    {
        src: "/web_assets/frontend/script/mammoth.browser.min.js",
        id: "mammoth"
    },
    {
        src: "/web_assets/frontend/script/pdf.min.js",
        id: "pdfjs"
    }
];


$(document).click(function () {
    loadScriptsDynamically(scriptsToLoad);
});

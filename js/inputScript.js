let ranking = {};
let currentCharacters = [];
let currentPage = 0;
let itemsPerPage = 9;
let phrases = {};
let currentPhrases = [];
let selectedChar = '';
let punctuation = [];
let punctuationPage = 0;
let phrasePage = 0;
let currentDisplayType = 'characters'; // track what is currently being displayed

function copyToClipboard() {
    var copyText = document.getElementById("Output");
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value).then(function() {
        //alert("文字已複製到剪貼板");
    }, function(err) {
        alert("無法複製文字: ", err);
    });
}

function findCharacters() {
    const input = document.getElementById('strokeInput').value.trim().toLowerCase();
    document.getElementById('strokeInput').value = input;
    displayStrokeCode(input);
    if (!input) {
        updateDisplay([]);
        return;
    }

    let foundCharacters = [];
    for (const [strokes, chars] of Object.entries(window.strokeData)) {
        if (strokes.startsWith(input)) {
            chars.forEach(char => {
                foundCharacters.push({ strokes, char });
            });
        }
    }

    foundCharacters.sort((a, b) => {
        const strokeDiff = a.strokes.length - b.strokes.length;
        if (strokeDiff !== 0) {
            return strokeDiff;
        }
        return (ranking[a.char] || Infinity) - (ranking[b.char] || Infinity);
    });

    const sortedCharacters = [
        ...foundCharacters.slice(0, 2).sort((a, b) => a.strokes.length - b.strokes.length),
        ...foundCharacters.slice(2).sort((a, b) => (ranking[a.char] || Infinity) - (ranking[b.char] || Infinity))
    ];

    currentCharacters = sortedCharacters;
    currentPage = 0;
    currentDisplayType = 'characters';
    updateDisplay(currentCharacters);
}

document.getElementById('Output').addEventListener('keydown', function(event) {
    const strokeInput = document.getElementById('strokeInput');
    const keyMap = {
        'Numpad7': 'u',
        'Numpad8': 'i',
        'Numpad9': 'o',
        'Numpad4': 'j',
        'Numpad5': 'k'
    };

    if (['u', 'i', 'o', 'j', 'k', 'U', 'I', 'O', 'J', 'K'].includes(event.key)) {
        event.preventDefault();
        strokeInput.value += event.key.toLowerCase();
        findCharacters();
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        if (strokeInput.value) {
            strokeInput.value = strokeInput.value.slice(0, -1);
            findCharacters();
        } else {
            this.value = this.value.slice(0, -1);
        }
    } else if (keyMap[event.code]) {
        event.preventDefault();
        strokeInput.value += keyMap[event.code];
        findCharacters();
    } else if (/[a-zA-Z]/.test(event.key) && !event.ctrlKey) {
        event.preventDefault();
    }
});


document.addEventListener('DOMContentLoaded', function() {
    loadRanking();
    fetch('database.txt')
        .then(response => response.text())
        .then(data => {
            window.strokeData = parseData(data);
        })
        .catch(error => {
            console.error('Failed to fetch stroke data:', error);
        });

    loadPhrases();
    loadPunctuation();

    document.getElementById('strokeInput').addEventListener('input', function(event) {
        this.value = this.value.replace(/[^uijokUIJOK78945]/g, '');
        this.value = this.value.toLowerCase();
        this.value = this.value.replace(/7/g, 'u').replace(/8/g, 'i').replace(/9/g, 'o').replace(/4/g, 'j').replace(/5/g, 'k');
        findCharacters();
    });

    document.addEventListener('keydown', function(event) {
        if (event.code.startsWith('Digit') && event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            const keyIndex = parseInt(event.key, 10);
            const selectedCharCell = document.querySelector(`#char-${keyIndex}`);
            if (selectedCharCell) {
                const character = selectedCharCell.querySelector('td:nth-child(2)').textContent.trim();
                selectCharacter(character, keyIndex);
            } else {
                const selectedPhraseCell = document.querySelector(`#phrase-${keyIndex}`);
                if (selectedPhraseCell) {
                    const phrase = selectedPhraseCell.querySelector('td:nth-child(2)').textContent.trim();
                    selectPhrase(phrase);
                } else {
                    const selectedPunctuationCell = document.querySelector(`#punctuation-${keyIndex}`);
                    if (selectedPunctuationCell) {
                        const symbol = selectedPunctuationCell.querySelector('td:nth-child(2)').textContent.trim();
                        selectPunctuation(symbol);
                    }
                }
            }
        } else if (event.key === ' ') {
            event.preventDefault();
            if (currentDisplayType === 'characters') {
                nextPage();
            } else if (currentDisplayType === 'phrases') {
                nextPage();
            } else if (currentDisplayType === 'punctuation') {
                nextPage();
            }
        } else if (event.key === 'm') {
            event.preventDefault();
            punctuationPage = 0;
            currentDisplayType = 'punctuation';
            displayPunctuation();
        }else if (event.key === ',') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '，';
        }else if (event.key === '.') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '。';
        }else if (event.key === '<') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '《';
        }else if (event.key === '>') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '》';
        }else if (event.key === '/') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '／';
        }else if (event.key === '?') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '？';
        }else if (event.key === ';') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '；';
        }else if (event.key === ':') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '：';
        }else if (event.key === "'") {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '、';
        }else if (event.key === '"') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '＂';
        }else if (event.key === '[') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '「';
        }else if (event.key === '{') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '『';
        }else if (event.key === ']') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '」';
        }else if (event.key === '}') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '』';
        }else if (event.key === "\\") {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '＼';
        }else if (event.key === '|') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '｜';
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const outputInput = document.getElementById('Output');
            outputInput.value += '\n';
        }
    });

    const buttonContainer = document.querySelector('.button-container');

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '上一頁';
    prevBtn.id = 'prevBtn';
    prevBtn.onclick = previousPage;
    buttonContainer.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一頁';
    nextBtn.id = 'nextBtn';
    nextBtn.onclick = nextPage;
    buttonContainer.appendChild(nextBtn);
});

function loadRanking() {
    fetch('ranking-traditional.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            let rank = 0;
            lines.forEach(line => {
                if (line.trim() && !line.startsWith('#')) {
                    Array.from(line).forEach(char => {
                        if (!ranking[char]) {
                            ranking[char] = rank++;
                        }
                    });
                }
            });
        });
}

function parseData(data) {
    const lines = data.split('\n');
    const strokeDict = {};
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#') && line.includes('\t')) {
            const parts = line.split('\t');
            const character = parts[0].trim();
            const strokes = parts[1].trim();
            if (!strokeDict[strokes]) {
                strokeDict[strokes] = [];
            }
            strokeDict[strokes].push(character);
        }
    });
    return strokeDict;
}

function loadPhrases() {
    fetch('phrases-traditional.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            lines.forEach(line => {
                if (line.trim() && !line.startsWith('#')) {
                    const char = line[0];
                    if (!phrases[char]) {
                        phrases[char] = [];
                    }
                    phrases[char].push(line.trim());
                }
            });
        });
}

function loadPunctuation() {
    fetch('punctuation.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            lines.forEach(line => {
                if (line.trim() && !line.startsWith('#')) {
                    punctuation.push(line.trim());
                }
            });
        });
}

const mappings = { 'u': '一', 'i': '丨', 'o': '丿', 'j': '丶', 'k': 'フ' };

function displayStrokeCode(input) {
    const checkInput = document.getElementById('checkInput');
    let displayCode = '';
    for (let char of input) {
        if (mappings[char]) {
            displayCode += mappings[char];
        }
    }
    checkInput.value = displayCode;
}

function updateDisplay(characters) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    const pageCharacters = characters.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    if (pageCharacters.length === 0) {
        results.innerHTML = '<tr><td colspan="3">未找到相應的漢字。</td></tr>';
        return;
    }

    pageCharacters.forEach((item, index) => {
        const displayStrokes = item.strokes.split('').map(char => mappings[char] || char).join('');
        results.innerHTML += `<tr id="char-${index + 1}" onclick="selectCharacter('${item.char}', ${index + 1})"><td>${index + 1}</td><td>${item.char}</td><td>${displayStrokes}</td></tr>`;
    });
}

function displayPunctuation() {
    const results = document.getElementById('results');
    results.innerHTML = '';

    const pagePunctuation = punctuation.slice(punctuationPage * itemsPerPage, (punctuationPage + 1) * itemsPerPage);
    if (pagePunctuation.length === 0) {
        results.innerHTML = '<tr><td colspan="3">未找到相應的標點符號。</td></tr>';
        return;
    }

    pagePunctuation.forEach((symbol, index) => {
        results.innerHTML += `<tr id="punctuation-${index + 1}" onclick="selectPunctuation('${symbol}')"><td>${index + 1}</td><td colspan="2">${symbol}</td></tr>`;
    });
}

function selectCharacter(character, charIndex) {
    selectedChar = character;
    const outputInput = document.getElementById('Output');
    outputInput.value += character;
    document.getElementById('strokeInput').value = '';
    currentPhrases = phrases[character] || [];
    phrasePage = 0;
    currentDisplayType = 'phrases';
    displayPhrases();
}

function selectPunctuation(symbol) {
    const outputInput = document.getElementById('Output');
    outputInput.value += symbol;
}

function displayPhrases() {
    const results = document.getElementById('results');
    results.innerHTML = '';

    const pagePhrases = currentPhrases.slice(phrasePage * itemsPerPage, (phrasePage + 1) * itemsPerPage);
    if (pagePhrases.length === 0) {
        results.innerHTML = '<tr><td colspan="3">未找到相應的詞語。</td></tr>';
        return;
    }

    pagePhrases.forEach((phrase, index) => {
        results.innerHTML += `<tr id="phrase-${index + 1}" onclick="selectPhrase('${phrase}')"><td>${index + 1}</td><td colspan="2">${phrase}</td></tr>`;
    });
}

function selectPhrase(phrase) {
    const outputInput = document.getElementById('Output');
    outputInput.value = outputInput.value.slice(0, -1) + phrase;
    document.getElementById('strokeInput').value = '';
    findCharacters();
}

function previousPage() {
    if (currentDisplayType === 'phrases' && phrasePage > 0) {
        phrasePage--;
        displayPhrases();
    } else if (currentDisplayType === 'characters' && currentPage > 0) {
        currentPage--;
        updateDisplay(currentCharacters);
    } else if (currentDisplayType === 'punctuation' && punctuationPage > 0) {
        punctuationPage--;
        displayPunctuation();
    }
}


function nextPage() {
    if (currentDisplayType === 'phrases') {
        phrasePage++;
        if ((phrasePage * itemsPerPage) >= currentPhrases.length) {
            phrasePage = 0;
        }
        displayPhrases();
    } else if (currentDisplayType === 'characters') {
        currentPage++;
        if ((currentPage * itemsPerPage) >= currentCharacters.length) {
            currentPage = 0;
        }
        updateDisplay(currentCharacters);
    } else if (currentDisplayType === 'punctuation') {
        punctuationPage++;
        if ((punctuationPage * itemsPerPage) >= punctuation.length) {
            punctuationPage = 0;
        }
        displayPunctuation();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'c') {
        copyToClipboard();
    }
});

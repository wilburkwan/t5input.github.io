window.onload = function() {
    fetch('database.txt')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        window.strokeData = parseData(data);
    })
    .catch(error => {
        console.error('Failed to fetch stroke data:', error);
        document.getElementById('results').innerHTML = '<tr><td colspan="2">無法載入筆劃資料。</td></tr>';
    });
};

function parseData(data) {
    const lines = data.split('\n');
    const strokeDict = {};
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const parts = line.split('\t');
            if (parts.length === 2) {
                strokeDict[parts[0].trim()] = convertStrokeToSymbols(parts[1].trim());
            }
        }
    });
    return strokeDict;
}

function convertStrokeToSymbols(strokeCode) {
    return strokeCode.replace(/u/g, '一')
                     .replace(/i/g, '丨')
                     .replace(/o/g, '丿')
                     .replace(/j/g, '丶')
                     .replace(/k/g, 'フ');
}

function searchCharacter() {
    const input = document.getElementById('searchInput').value.trim();
    const results = document.getElementById('results');
    results.innerHTML = ''; // Clear previous results

    if (!input) {
        results.innerHTML = '<tr><td colspan="2">請輸入一個或多個漢字。</td></tr>';
        return;
    }

    // Process each character in the input
    Array.from(input).forEach(char => {
        let rowHtml = '<tr>';
        if (window.strokeData[char]) {
            rowHtml += `<td>${char}</td><td>${window.strokeData[char]}</td>`;
        } else {
            rowHtml += `<td>${char}</td><td>未找到筆劃順序。</td>`;
        }
        rowHtml += '</tr>';
        results.innerHTML += rowHtml;
    });
}

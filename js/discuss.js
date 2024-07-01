document.getElementById('google-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止預設提交行為

    var form = event.target;
    var data = new FormData(form);

    fetch('https://docs.google.com/forms/d/e/1FAIpQLSeVOywfy-DGrt6JGDy_jZp6TCmRnvAc7VB-x6KLd3kvDAtgww/formResponse', {
        method: 'POST',
        body: data,
        mode: 'no-cors'
    }).then(function() {
        document.getElementById('success-message').style.display = 'block';
        form.reset();
        // 10秒後重新載入留言區
        setTimeout(fetchSheetData, 10000);
    }).catch(function(error) {
        console.error('Error:', error);
    });
});

function fetchSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLrqIF3Nxqqcs-GVvLxkOcf08-qwJy3Tpg1XHAveKbo6n6lQ7ZqZQwY0--ZWZmm4NKfYC13UToodBU/pub?output=csv';

    fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log('Data fetched successfully');
            const rows = data.split('\n').slice(1); // 跳过标题行
            const comments = rows.map(row => {
                const cols = row.split(',');
                return {
                    timestamp: parseDate(cols[0]),
                    nickname: cols[1],
                    message: cols[2]
                };
            });
            comments.sort((a, b) => b.timestamp - a.timestamp); // 按时间从新到旧排序
            displayComments(comments);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function parseDate(dateString) {
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date;
}

function displayComments(comments) {
    const commentSection = document.getElementById('comment-section');
    commentSection.innerHTML = ''; // 清空現有留言

    comments.forEach(comment => {
        if (comment.timestamp && comment.nickname && comment.message &&
            comment.nickname.trim() !== '' && comment.message.trim() !== '') {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';

            const nicknameDiv = document.createElement('div');
            nicknameDiv.className = 'nickname';
            nicknameDiv.textContent = comment.nickname;

            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'timestamp';
            timestampDiv.textContent = comment.timestamp instanceof Date ? comment.timestamp.toLocaleString() : comment.timestamp; // 格式化时间

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = comment.message;

            commentDiv.appendChild(nicknameDiv);
            commentDiv.appendChild(timestampDiv);
            commentDiv.appendChild(messageDiv);

            commentSection.appendChild(commentDiv);
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchSheetData);

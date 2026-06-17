const title = document.getElementById('title');

const colors = ['red', 'green', 'blue', 'orange', 'purple', 'pink', 'yellow'];
function updateColorForTitle() {
    setInterval(() => {
        title.style.color = colors[Math.floor(Math.random() * colors.length)];
    }, 700);
}



KEY_UP = 38;
KEY_DOWN = 40;

var currentRow = 0;

function getRowElement(row) {
    return document.getElementById("row" + row);
}

function moveRow(direction) {
    getRowElement(currentRow).className = "";
    currentRow += direction;
    getRowElement(currentRow).className = "selected";
}

window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;

    if (key == KEY_UP) {
	moveRow(-1);
    } else if (key == KEY_DOWN) {
	moveRow(1);
    } else {
	console.log("key: " + key);
    }
}

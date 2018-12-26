

KEY_UP = 38;
KEY_DOWN = 40;
KEY_ENTER = 13;
KEY_TAB = 9;

var currentRow = 0;

function getRowElement(row) {
    return document.getElementById("row" + row);
}

function moveRow(direction) {
    var currentElement = getRowElement(currentRow);
    var text = currentElement.childNodes[0].value;
    currentElement.innerHTML = text;

    var newCurrentRow = currentRow + direction;
    var newElement = getRowElement(newCurrentRow);
    if (newElement != null) {
	currentRow = newCurrentRow;
	currentElement = newElement;
    }

    text = currentElement.innerHTML;
    currentElement.innerHTML = '<input type="text" value="' + text + '">';
    currentElement.childNodes[0].focus();
}

var temporaryIndent = 0;

function changeIndent(direction) {
    if (temporaryIndent == 0 && direction < 0) {
	return;
    }

    var currentElement = getRowElement(currentRow);
    temporaryIndent += direction;
    currentElement.style.marginLeft = "" + temporaryIndent * 20 + "px";
}

function insertNewRow() {
    var mainElement = document.getElementById("main");

    var newNode = document.createElement("div");
    newNode.setAttribute("id", "row" + (currentRow + 1));
    newNode.innerHTML = "&nbsp;";
    //newNode.appendChild(document.createTextNode("&nbsp;"));

    var nextRowElement = getRowElement(currentRow + 1);
    if (nextRowElement == null) {
	mainElement.appendChild(newNode);
    } else {
	mainElement.insertBefore(newNode, nextRowElement);
    }
    moveRow(1);
}

window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;

    if (key == KEY_UP) {
	moveRow(-1);
    } else if (key == KEY_DOWN) {
	moveRow(1);
    } else if (key == KEY_ENTER) {
	insertNewRow();
    } else if (key == KEY_TAB) {
	if (e.shiftKey) {
	    changeIndent(-1);
	} else {
	    changeIndent(1);
	}
    } else {
	console.log("key: " + key);
	return true;
    }

    return false;
}

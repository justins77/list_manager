
// Next steps:
// - expand/contract children
// - show an ID in a box for each row
// - smarter cursor positioning in row when moving up/down
// - dragging of items up/down
// - mouse selection of rows

KEY_UP = 38;
KEY_DOWN = 40;
KEY_ENTER = 13;
KEY_BACKSPACE = 8;
KEY_TAB = 9;

PX_PER_INDENT_LEVEL = 20;

var currentRowElement = document.getElementById("row0");

function populateCurrentInputElement() {
    text = currentRowElement.innerHTML;
    currentRowElement.innerHTML = '<input type="text" value="' + text + '">';
    currentRowElement.childNodes[0].focus();
}

function moveRow(direction) {
    var text = currentRowElement.childNodes[0].value;
    currentRowElement.innerHTML = text;

    var newElement = direction == 1 ? currentRowElement.nextSibling : currentRowElement.previousSibling;
    if (newElement != null) {
	currentRowElement = newElement;
    }

    populateCurrentInputElement();
}

function changeIndent(direction) {
    var currentMargin = parseInt(currentRowElement.style.marginLeft);
    if (isNaN(currentMargin)) {
	currentMargin = 0;
    }
    var currentIndent = currentMargin / PX_PER_INDENT_LEVEL;

    if (currentIndent == 0 && direction < 0) {
	return;
    }

    currentIndent += direction;
    currentRowElement.style.marginLeft = "" + currentIndent * PX_PER_INDENT_LEVEL + "px";
}

function insertNewRow() {
    var mainElement = document.getElementById("main");

    var newNode = document.createElement("div");
    newNode.style.marginLeft = currentRowElement.style.marginLeft;
    newNode.innerHTML = "&nbsp;";

    var nextRowElement = currentRowElement.nextSibling;
    if (nextRowElement == null) {
	mainElement.appendChild(newNode);
    } else {
	mainElement.insertBefore(newNode, nextRowElement);
    }
    moveRow(1);
}

function deleteRow() {
    var previousElement = currentRowElement.previousSibling;

    if (previousElement == null) {
	return;
    }

    var mainElement = document.getElementById("main");
    mainElement.removeChild(currentRowElement);
    currentRowElement = previousElement;

    populateCurrentInputElement();
}

function maybeDeleteRow() {
    var inputElement = currentRowElement.childNodes[0];

    if (inputElement.selectionStart == 0 && inputElement.selectionEnd == 0 && inputElement.value.trim().length == 0) {
	deleteRow();
	return false;
    }

    return true;
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
    } else if (key == KEY_BACKSPACE) {
	return maybeDeleteRow();
    } else {
	console.log("key: " + key);
	return true;
    }

    return false;
}

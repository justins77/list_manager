
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
KEY_ESC = 27;

PX_PER_INDENT_LEVEL = 20;

var currentRowElement = document.getElementById("row0");

function getRowPrefixHtml(rowElement) {
    var nextRowElement = rowElement.nextSibling;
    if (nextRowElement != null && getIndent(nextRowElement) > getIndent(rowElement)) {
	if (rowElement.lmContracted) {
	    return '<img src="icon_closed.png">';
	} else {
	    return '<img src="icon_open.png">'
	}
    } else {
	return '<img src="icon_single.png">'
    }
}

function getTextForRow(rowElement) {
    var textNode = rowElement.childNodes[1];
    var text;
    if (textNode == null) {
	return '';
    } else if (textNode instanceof HTMLInputElement) {
	return textNode.value;
    } else {
	return textNode.textContent;
    }
}

function populateNonInputRow(rowElement) {
    rowElement.innerHTML = getRowPrefixHtml(rowElement) + getTextForRow(rowElement);
}

function populateCurrentInputElement() {
    var text = getTextForRow(currentRowElement);
    currentRowElement.innerHTML = getRowPrefixHtml(currentRowElement) + '<input type="text" value="' + text + '">';
    currentRowElement.childNodes[1].focus();
}

function moveRow(direction) {
    var newElement = direction == 1 ? currentRowElement.nextSibling : currentRowElement.previousSibling;
    if (newElement == null) {
	return;
    }

    populateNonInputRow(currentRowElement);
    currentRowElement = newElement;
    populateCurrentInputElement();
}

function getIndent(rowElement) {
    var currentMargin = parseInt(rowElement.style.marginLeft);
    if (isNaN(currentMargin)) {
	currentMargin = 0;
    }
    return currentMargin / PX_PER_INDENT_LEVEL;
}

function changeIndent(direction) {
    if (currentRowElement.previousSibling == null) {
	return;
    }

    var previousIndent = getIndent(currentRowElement.previousSibling);
    var currentIndent = getIndent(currentRowElement);

    if ((currentIndent >= previousIndent + 1 && direction > 0) ||
	(currentIndent == 0 && direction < 0)) {
	return;
    }

    currentIndent += direction;
    currentRowElement.style.marginLeft = "" + currentIndent * PX_PER_INDENT_LEVEL + "px";
    populateNonInputRow(currentRowElement.previousSibling);
}

function insertNewRow() {
    var mainElement = document.getElementById("main");

    var newNode = document.createElement("div");
    newNode.style.marginLeft = currentRowElement.style.marginLeft;
    newNode.innerHTML = '<img src="icon_single.png">';

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
    var inputElement = currentRowElement.childNodes[1];

    if (inputElement.selectionStart == 0 && inputElement.selectionEnd == 0 && inputElement.value.trim().length == 0) {
	deleteRow();
	return false;
    }

    return true;
}

function toggleExpanded() {
    currentRowElement.lmContracted = !currentRowElement.lmContracted;
    populateCurrentInputElement();
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
    } else if (key == KEY_ESC) {
	return toggleExpanded();
    } else {
	console.log("key: " + key);
	return true;
    }

    return false;
}

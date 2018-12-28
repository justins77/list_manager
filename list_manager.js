
// Next steps:
// - some hacky save/load functionality (would enable actually using it)
// - show an ID in a box for each row
// - dragging of items up/down
// - mouse selection of rows
// - mouse expand/contract
// - shift-up/down to select multiple rows
// - expand parent if needed when hitting tab to create child
//
// Longer term:
// - marking tasks as done
// - progress bar / percent complete
// - effort points for tasks
// - secondary list in another pane
//   - dragging between panes to create links
//   - typing "=" to create a link (should show a dropdown intelligently ranking items to link, can use item number or text)
// - maintain horizontal position in row when moving up/down

KEY_UP = 38;
KEY_DOWN = 40;
KEY_ENTER = 13;
KEY_BACKSPACE = 8;
KEY_TAB = 9;
KEY_ESC = 27;

PX_PER_INDENT_LEVEL = 20;

DEFAULT_ROW_HEIGHT = '24px';

var currentRowElement = null;

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
    var inputElement = currentRowElement.childNodes[1];
    inputElement.focus();
    // For now, put the cursor at end or row
    inputElement.selectionStart = text.length;
    inputElement.selectionEnd = text.length;
}

function moveRow(direction) {
    var newElement = currentRowElement;
    do {
	newElement = direction == 1 ? newElement.nextSibling : newElement.previousSibling;
    } while (newElement != null && newElement.style.visibility == 'hidden');

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

    // TODO: we may need to unhide the children of our parent if we are indenting to become
    // a child of a currently-hidden parent

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
    newNode.style.marginLeft = currentRowElement ? currentRowElement.style.marginLeft : '0px';
    newNode.style.height = DEFAULT_ROW_HEIGHT;
    newNode.innerHTML = '<img src="icon_single.png">';

    var nextRowElement = currentRowElement ? currentRowElement.nextSibling : null;
    while (nextRowElement != null && nextRowElement.style.visibility == 'hidden') {
	nextRowElement = nextRowElement.nextSibling;
    }
    if (nextRowElement == null) {
	mainElement.appendChild(newNode);
    } else {
	mainElement.insertBefore(newNode, nextRowElement);
    }

    if (currentRowElement == null) {
	currentRowElement = newNode;
    }
    moveRow(1);
}

function deleteRow() {
    var previousElement = currentRowElement.previousSibling;

    while (previousElement != null && previousElement.style.visibility == 'hidden') {
	previousElement = previousElement.previousSibling;
    }

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

function updateVisibilityState(parentRow) {
    var myIndent = getIndent(parentRow);
    var contracted = parentRow.lmContracted;
    var row = parentRow.nextSibling;
    while (row != null && getIndent(row) > myIndent) {
	if (!contracted) {
	    row.style.visibility = 'visible';
	    row.style.height = DEFAULT_ROW_HEIGHT;
	    if (row.lmContracted) {
		row = updateVisibilityState(row);
		continue;
	    }
	} else {
	    row.style.visibility = 'hidden';
	    row.style.height = '0px';
	}
	row = row.nextSibling;
    }
    return row;
}

function toggleExpanded() {
    currentRowElement.lmContracted = !currentRowElement.lmContracted;
    populateCurrentInputElement();
    updateVisibilityState(currentRowElement);
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

// Insert the first empty row for this list
insertNewRow();
populateCurrentInputElement();

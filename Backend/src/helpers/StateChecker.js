export function checkState(field, x, y) {
    let fieldLength = field.length;
    let isWinner = false;

    //check rows
    for (let i = 0; i < fieldLength; i++) {
        let str = field[i];
        isWinner = true;
        for (let j = 1; j < fieldLength; j++) {
            if (str.charAt(0) === "?" || str.charAt(0) !== str.charAt(j)) {
                isWinner = false;
                break;
            }
        }
        if (isWinner) {
            return defineWinner(str.charAt(0));
        }
    }

    //check colls
    for (let i = 0; i < fieldLength; i++) {
        let str = field[0];
        isWinner = true;
        for (let j = 1; j < fieldLength; j++) {
            if (str.charAt(i) === "?" || str.charAt(i) !== field[j].charAt(i)) {
                isWinner = false;
                break;
            }
        }
        if (isWinner) {
            return defineWinner(str.charAt(0));
        }
    }

    //check diag
    for (let i = 1; i < fieldLength; i++) {
        isWinner = true;
        if (field[0].charAt(0) === "?" || field[0].charAt(0) !== field[i].charAt(i)) {
            isWinner = false;
            break;
        }
    }

    if (isWinner) {
        return defineWinner(field[0].charAt(0));
    }

    //check anti diag
    let index = fieldLength - 1;
    let ch = field[0].charAt(index);

    for (let i = 1; i < fieldLength; i++) {
        isWinner = true;
        if (ch === "?" || field[i].charAt(index) !== ch) {
            isWinner = false;
            break;
        }
        index--;
    }

    if (isWinner) {
        return defineWinner(ch);
    }

    for (let i = 0; i < fieldLength; i++) {
        for (let j = 0; j < fieldLength; j++) {
            if (field[i].charAt(j) === "?") {
                return "";
            }
        }
    }

    return "draw";
}

function defineWinner(ch) {
    if (ch === "x") {
        return "owner";
    } else if (ch === "o") {
        return "opponent"
    } else {
        return "";
    }
}
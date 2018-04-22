import { getCharAt } from "./StringHelper";

export function checkState(field, x, y) {
    let fieldLength = field.length;
    let isWinner = false;

    for (let i = 0; i < fieldLength; i++) {
        let str = field[i];
        isWinner = true;
        console.log(str.charAt(0));
        for (let j = 1; j < fieldLength; j++) {
            console.log(getCharAt(str, 1) + " " + getCharAt(str, j));
            if (getCharAt(str, 0) !== getCharAt(str, j)) {
                isWinner = false;
                break;
            }
        }
        if (isWinner) {
            return ch;
        }
    }
}
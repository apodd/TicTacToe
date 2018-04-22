export function setCharAt(str, index, chr) {
    if(index >= str.length) {
        return str;
    } else {
        return str.substr(0, index) + chr + str.substr(index + 1);
    }
}

export function getCharAt(str, index) {
    if(index >= str.length) {
        return str;
    } else {
        return str.substr(index, index);
    }
}
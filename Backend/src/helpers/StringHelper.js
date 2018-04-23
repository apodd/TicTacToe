export function setCharAt(str, index, chr) {
    if(index >= str.length) {
        return str;
    } else {
        return str.substr(0, index) + chr + str.substr(index + 1);
    }
}
export function setCharAt(str, index, chr) {
    if(index >= str.length) {
        return str;
    } else {
        return str.substr(0, index) + chr + str.substr(index + 1);
    }
}

export function setOptions(options, status, code, msg) {
    options.status = status;
    options.code = code;
    options.message = msg;
}
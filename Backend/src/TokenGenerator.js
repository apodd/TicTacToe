import * as jwt from "jsonwebtoken";
import * as config from "./Config"

export class TokenGenerator {
    static createGameToken(name) {
        return jwt.sign({userName: name}, config.secret); 
    }

	static createAccessToken(name, token) {
        return jwt.sign({userName: name, gameToken: token}, config.secret); 
	}
	
    static decodeToken(token) {
		try {
			return jwt.verify(token, config.secret).userName;
		} catch (err) {
			return undefined;
		}
	}

	static decodeGameToken(token) {
		try {
			return jwt.verify(token, config.secret);
		} catch (err) {
			return undefined;
		}
	}
}
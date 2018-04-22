import * as jwt from "jsonwebtoken";
import * as config from "./Config"

export class TokenGenerator {
    static createToken(name) {
        return jwt.sign({userName: name}, config.secret); // playerType: owner connected spectator
    }

    static decodeToken(token) {
		try {
			return jwt.verify(token, config.secret).userName;
		} catch (err) {
			return undefined;
		}
	}
}
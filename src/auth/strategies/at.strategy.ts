import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type JwtPayload = {
    userId: number;
    email: string;
    role: string;
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
        });
    }

    validate(payload: JwtPayload) {
        return { userId: payload.userId, email: payload.email, role: payload.role };
    }
}

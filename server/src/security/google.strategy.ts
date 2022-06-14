import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { config } from '../config';
import { fromGoogleProfile } from '../web/rest/mappers';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: config.get('client.id.google'),
            clientSecret: config.get('client.secret.google'),
            callbackURL: config.get('callback.url.google'),
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const user = fromGoogleProfile(profile);
        return new Promise((resolve, reject) => resolve(user));
    }
}

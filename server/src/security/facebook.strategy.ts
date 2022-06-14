import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { config } from '../config';
import { fromFacebookProfile } from '../web/rest/mappers';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor() {
        super({
            clientID: config.get('client.id.facebook'),
            clientSecret: config.get('client.secret.facebook'),
            callbackURL: config.get('callback.url.facebook'),
            scope: 'email',
            profileFields: ['emails', 'name'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user: any, info?: any) => void,
    ): Promise<any> {
        const user = fromFacebookProfile(profile);
        return new Promise((resolve, reject) => resolve(user));
    }
}

import { UserDTO } from '../../service/dto/user.dto';
import { generate } from 'generate-password';

export function fromGoogleProfile(googleProfile: any): UserDTO {
    const user = new UserDTO();
    user.email = googleProfile.emails[0].value;
    user.activated = true;
    user.firstName = googleProfile.name.givenName;
    user.lastName = googleProfile.name.familyName;
    user.login = googleProfile.displayName;
    const password = generate({
        length: 10,
        numbers: true,
    });
    user.password = password;
    return user;
}

export function fromFacebookProfile(facebookProfile: any): UserDTO {
    const user = new UserDTO();
    user.email = facebookProfile.emails[0].value;
    user.activated = true;
    user.firstName = facebookProfile.name.givenName;
    user.lastName = facebookProfile.name.familyName;
    user.login = facebookProfile.name.givenName + ' ' + facebookProfile.name.familyName;
    const password = generate({
        length: 10,
        numbers: true,
    });
    user.password = password;
    return user;
}

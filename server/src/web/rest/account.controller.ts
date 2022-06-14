/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Body,
    Param,
    Post,
    Res,
    UseGuards,
    Controller,
    Get,
    Logger,
    Req,
    UseInterceptors,
    ClassSerializerInterceptor,
    InternalServerErrorException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard, Roles, RoleType, RolesGuard } from '../../security';
import { PasswordChangeDTO } from '../../service/dto/password-change.dto';
import { UserDTO } from '../../service/dto/user.dto';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { ApiBearerAuth, ApiUseTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../../service/auth.service';
import { AuthGuard as AuthGuardSocial } from '@nestjs/passport';
import { UserService } from '../../service/user.service';
import { config } from '../../config';

@Controller('api')
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiUseTags('account-resource')
export class AccountController {
    logger = new Logger('AccountController');

    constructor(private readonly authService: AuthService, private userService: UserService) {}

    @Post('/register')
    @ApiOperation({ title: 'Register user' })
    @ApiResponse({
        status: 201,
        description: 'Registered user',
        type: UserDTO,
    })
    async registerAccount(@Req() req: Request, @Body() userDTO: UserDTO & { password: string }): Promise<any> {
        return await this.authService.registerNewUser(userDTO);
    }

    @Get('/google')
    @UseGuards(AuthGuardSocial('google'))
    // eslint-disable-next-line
  async googleAuth(@Req() req) {}

    @Get('/google/callback')
    @UseGuards(AuthGuardSocial('google'))
    @ApiResponse({
        status: 200,
        description: 'google-login',
    })
    async googleAuthRedirect(@Req() req, @Res() resp) {
        const jwt = await this.ensureUserCreation(req.user);
        this.redirectToClientWithToken(resp, jwt);
    }

    private async ensureUserCreation(user: UserDTO): Promise<any> {
        let userFound = await this.userService.findByFields({ where: { email: user.email } });
        if (!userFound) {
            userFound = await this.authService.registerNewUser(user);
        }
        return await this.authService.generateJWT(userFound);
    }

    private redirectToClientWithToken(resp: any, jwt: any): void {
        resp.status(302).redirect(`${config.get('oauth.client.url')}?token=${jwt.id_token}`);
    }

    @Get('/facebook')
    @UseGuards(AuthGuardSocial('facebook'))
    // eslint-disable-next-line
  async facebookLogin() {}

    @Get('/facebook/redirect')
    @UseGuards(AuthGuardSocial('facebook'))
    async facebookLoginRedirect(@Req() req, @Res() resp) {
        const jwt = await this.ensureUserCreation(req.user);
        this.redirectToClientWithToken(resp, jwt);
    }

    @Get('/activate')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    @ApiOperation({ title: 'Activate an account' })
    @ApiResponse({
        status: 200,
        description: 'activated',
    })
    activateAccount(@Param() key: string, @Res() res: Response): any {
        throw new InternalServerErrorException();
    }

    @Get('/authenticate')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ title: 'Check if the user is authenticated' })
    @ApiResponse({
        status: 200,
        description: 'login authenticated',
    })
    isAuthenticated(@Req() req: Request): any {
        const user: any = req.user;
        return user.login;
    }

    @Get('/account')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ title: 'Get the current user.' })
    @ApiResponse({
        status: 200,
        description: 'user retrieved',
    })
    async getAccount(@Req() req: Request): Promise<any> {
        const user: any = req.user;
        const userProfileFound = await this.authService.getAccount(user.id);
        return userProfileFound;
    }

    @Post('/account')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ title: 'Update the current user information' })
    @ApiResponse({
        status: 201,
        description: 'user info updated',
        type: UserDTO,
    })
    async saveAccount(@Req() req: Request, @Body() newUserInfo: UserDTO): Promise<any> {
        const user: any = req.user;
        return await this.authService.updateUserSettings(user.login, newUserInfo);
    }

    @Post('/account/change-password')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ title: 'Change current password' })
    @ApiResponse({
        status: 201,
        description: 'user password changed',
        type: PasswordChangeDTO,
    })
    async changePassword(@Req() req: Request, @Body() passwordChange: PasswordChangeDTO): Promise<any> {
        const user: any = req.user;
        return await this.authService.changePassword(
            user.login,
            passwordChange.currentPassword,
            passwordChange.newPassword,
        );
    }

    @Post('/account/reset-password/init')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ title: 'Send an email to reset the password of the user' })
    @ApiResponse({
        status: 201,
        description: 'mail to reset password sent',
        type: 'string',
    })
    requestPasswordReset(@Req() req: Request, @Body() email: string, @Res() res: Response): any {
        throw new InternalServerErrorException();
    }

    @Post('/account/reset-password/finish')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiOperation({ title: 'Finish to reset the password of the user' })
    @ApiResponse({
        status: 201,
        description: 'password reset',
        type: 'string',
    })
    finishPasswordReset(@Req() req: Request, @Body() keyAndPassword: string, @Res() res: Response): any {
        throw new InternalServerErrorException();
    }
}

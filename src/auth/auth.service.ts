import { Injectable } from '@nestjs/common';
// import Chatkit from '@pusher/chatkit-server';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../models/user.entity';
import Chatkit, { AuthenticationResponse } from '@pusher/chatkit-server';

@Injectable()
export class AuthService {
    chatKit: Chatkit;
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {
        this.chatKit = new Chatkit({
            instanceLocator: 'v1:us1:de477ab4-3933-44e0-82f5-0d5e809d516c',
            key: 'f0e2b2b8-f89c-4a3b-be67-311dcf52da2d:niw8lHGrmxfQ1FzljoTHqOnRMjXJPni2fIIGEBWwb54=',
        });
    }

    private async createUser(userData: User): Promise<User> {
        return this.userService.create(userData).then(user => {
            const userId = `${user.name}${user.id}`;
            const roomId = 'c33cbe78-f668-4fa2-ba50-5bd09dd7faf9';
            const avatarUrl = 'https://image.flaticon.com/icons/png/128/149/149071.png';

            return this.chatKit.createUser({
                id: userId,
                name: user.name,
                avatarURL: avatarUrl,
            }).then(() => {
                return this.chatKit.addUsersToRoom({
                    roomId: roomId,
                    userIds: [userId],
                }).then(() => {
                    return user;
                });
            });
        });
    }

    public getToken(userId: string): AuthenticationResponse {
        return this.chatKit.authenticate({ userId: userId });
    }

    private async validateUser(userData: User): Promise<User> {
        return await this.userService.findByEmail(userData.email);
    }

    public async register(user: User): Promise<any> {
        return this.createUser(user);
    }

    public async login(user: User): Promise<any | { status: number }> {
        return this.validateUser(user).then((userInfo) => {
            if (!userInfo) {
                return { status: 404 };
            }
            let userId = `${userInfo.name}${userInfo.id}`;
            const acceeToken = this.jwtService.sign(userId);
            return {
                expires_in: 3600,
                access_token: acceeToken,
                user_id: userId,
                status: 200,
            };
        });
    }

}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { User } from './models/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'my.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    JwtModule.register({
      secretOrPrivateKey: 'secret123',
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [AppService, UserService, AuthService],
})
export class AppModule { }

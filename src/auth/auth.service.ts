import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role, User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    // 🔐 Register new user
    async register(dto: RegisterDto) {
        const hashed = await bcrypt.hash(dto.password, 10);

        const user = await this.userService.findByEmail(dto.email);

        if (user) {
            throw new BadRequestException('Email is already registered');
        }

        const newUser = await this.userService.createUser({
            email: dto.email,
            password: hashed,
            role: Role[dto.role.toUpperCase() as keyof typeof Role],
        });
        if(newUser) delete (newUser as any).password
        return newUser;
    }


    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userService.findByEmail(email);
        if (!user || user.deletedAt) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
    }

    async login(user: User): Promise<{ access_token: string }> {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
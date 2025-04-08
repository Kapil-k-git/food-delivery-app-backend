import { Injectable } from '@nestjs/common';
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

        return this.userService.createUser({
            email: dto.email,
            password: hashed,
            role: Role[dto.role.toUpperCase() as keyof typeof Role], // 👈 converts 'customer' to Role.CUSTOMER
        });
    }


    // 🔎 Validate user credentials during login
    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userService.findByEmail(email);
        if (!user || user.deletedAt) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
    }

    // 🔑 Generate JWT token
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
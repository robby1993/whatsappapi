import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from '../database/models/Token';
import { User } from '../database/models/User';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Token)
    private tokenModel: typeof Token,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async validateToken(tokenString: string): Promise<any> {
    const tokenData = await this.tokenModel.findOne({ where: { token: tokenString } });
    if (!tokenData) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userModel.findOne({ where: { number: tokenData.number } });
    if (!user) {
      await this.tokenModel.destroy({ where: { token: tokenString } });
      throw new UnauthorizedException('User account not found');
    }

    const createdAtTime = user.createdAt ? new Date(user.createdAt).getTime() : Date.now();
    const expiry = createdAtTime + (user.validDays * 86400000);
    const isExpired = user.userType !== 'admin' && (Date.now() > expiry || user.validDays <= 0);

    return {
      userNumber: user.number,
      userType: user.userType,
      isActive: user.isActive,
      isExpired,
    };
  }
}

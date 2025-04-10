import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    const jwksUri = configService.get<string>('COGNITO_JWKS_URI');

    if (!jwksUri) {
      throw new Error('COGNITO_JWKS_URI environment variable is not defined');
    }

    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['RS256'],
    });

    this.logger.log(`JWT Strategy initialized with jwksUri: ${jwksUri}`);
  }

  async validate(payload: any) {
    try {
      this.logger.debug(
        `JWT Payload received: ${JSON.stringify(payload, null, 2)}`,
      );

      if (!payload) {
        this.logger.warn('Invalid token payload: payload is empty or null');
        throw new UnauthorizedException('Invalid token payload');
      }

      this.logger.debug(
        `Token validation successful for subject: ${payload.sub}`,
      );
      return payload;
    } catch (error) {
      this.logger.error(`JWT Validation Error: ${error.message}`, error.stack);
      throw new UnauthorizedException(
        `Token validation failed: ${error.message}`,
      );
    }
  }
}

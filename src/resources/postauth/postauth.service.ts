import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PostuserService } from '../postuser/postuser.service';
import { Postuser } from '../postuser/entities/postuser.entity';

@Injectable()
export class PostauthService {
  constructor(
    @Inject(forwardRef(() => PostuserService))
    private postuserService: PostuserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida le credenziali di un utente.
   *
   * @param username Il nome utente da validare.
   * @param pass La password da validare.
   * @returns Il documento dell'utente se le credenziali sono valide, altrimenti null.
   */
  async validateUser(username: string, pass: string): Promise<Postuser | null> {
    const user = await this.postuserService.findByUsername(username);

    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }

    return null;
  }

  /**
   * Effettua il login per un utente.
   *
   * @param user L'oggetto utente contenente le informazioni dell'utente.
   * @returns Un oggetto contenente il token di accesso JWT.
   */
  async login(user: any) {
    const payload = { username: user.username, sub: user._id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

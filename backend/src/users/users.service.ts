import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums';
import { User } from './user.entity';

// bcrypt "cost": each +1 doubles the time to hash. 10-12 is the usual range.
export const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  /** Login only: also loads the password hash, which is hidden from every other query. */
  findForLogin(email: string) {
    return this.repo.findOne({
      where: { email },
      select: { id: true, name: true, email: true, role: true, passwordHash: true },
    });
  }

  async create(data: { name: string; email: string; password: string; role: UserRole }) {
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const saved = await this.repo.save(
      this.repo.create({ name: data.name, email: data.email, passwordHash, role: data.role }),
    );
    // The returned object still carries the hash in memory: strip it before it can travel anywhere.
    return { id: saved.id, name: saved.name, email: saved.email, role: saved.role };
  }

  /**
   * Agents cannot sign up from the website (that would let anyone make themselves an admin).
   * The first agent is created here from .env, the same way the catalog seeds itself.
   */
  async onModuleInit() {
    const email = this.config.get<string>('SEED_AGENT_EMAIL')?.toLowerCase();
    const password = this.config.get<string>('SEED_AGENT_PASSWORD');
    if (!email || !password) return;
    if (await this.findByEmail(email)) return;

    await this.create({
      name: this.config.get<string>('SEED_AGENT_NAME') ?? 'IT Support',
      email,
      password,
      role: UserRole.AGENT,
    });
    this.logger.log(`Seeded support agent account: ${email}`);
  }
}

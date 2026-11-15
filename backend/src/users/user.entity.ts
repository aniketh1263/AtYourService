import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../common/enums';

/** A person who can log in. */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  // Unique, stored lower-case, used as the login name.
  @Column({ unique: true })
  email!: string;

  // bcrypt hash, never the password. select:false = normal queries (and relations that load a user,
  // e.g. a ticket's requester) do NOT return it. Only the login query asks for it explicitly.
  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;
}

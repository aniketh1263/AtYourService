import { UserRole } from '../common/enums';

/** What the rest of the app knows about the caller. Set on request.user by the JWT guard. */
export interface AuthUser {
  id: string;
  role: UserRole;
}

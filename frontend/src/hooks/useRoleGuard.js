import { useAuth } from './useAuth';
import { ROLES } from '../constants/roles';

export function useRoleGuard(allowedRoles = []) {
  const { user } = useAuth();

  if (!user) return false;
  // Owner role has full access across all dashboards
  if (user.role === ROLES.OWNER) return true;

  return allowedRoles.includes(user.role);
}

export default useRoleGuard;


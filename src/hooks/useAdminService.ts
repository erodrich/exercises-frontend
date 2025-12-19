/**
 * Custom hook to provide admin service
 */

import type { AdminService } from '../services/adminService';
import { adminService } from '../config/admin';

export function useAdminService(): AdminService {
  return adminService;
}

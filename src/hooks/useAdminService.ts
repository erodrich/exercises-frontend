/**
 * Custom hook to provide admin service
 */

import type { AdminService } from '../services/adminService';
import { MockAdminService } from '../services/adminService';

let adminServiceInstance: AdminService | null = null;

export function useAdminService(): AdminService {
  if (!adminServiceInstance) {
    // Using mock service for now - will be replaced with HTTP service when backend is connected
    adminServiceInstance = new MockAdminService();
  }
  return adminServiceInstance;
}

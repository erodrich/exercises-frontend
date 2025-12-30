/**
 * Public Exercise Service Configuration
 */

import { HttpPublicExerciseService } from '../services/publicExerciseService';
import API_CONFIG from './api';

/**
 * Create and export the public exercise service instance
 */
export const publicExerciseService = new HttpPublicExerciseService(API_CONFIG.baseURL);

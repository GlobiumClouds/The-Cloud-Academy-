/**
 * Dashboard API Service
 * GET /dashboard/stats
 */

import api from '@/lib/api';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_DASHBOARD_STATS, DUMMY_CHART_DATA } from '@/data/dummyData';

export const dashboardService = {
  getStats: () =>
    withFallback(
      () => api.get('/dashboard').then((r) => r.data),
      () => ({ data: DUMMY_DASHBOARD_STATS }),
    ),

  getChartData: () =>
    withFallback(
      () => api.get('/dashboard/charts').then((r) => r.data),
      () => ({ data: DUMMY_CHART_DATA }),
    ),
};

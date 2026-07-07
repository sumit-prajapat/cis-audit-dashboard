/**
 * scanService.js - Scan operations service
 */
import { apiDelete, apiGet, apiPost } from './apiClient';

export const scanService = {
  // Get all scans for organization
  getOrgScans: async (orgId, filters = {}) => {
    const params = new URLSearchParams({
      skip: filters.skip || 0,
      limit: filters.limit || 50,
      sort_by: filters.sortBy || 'created_at',
      sort_order: filters.sortOrder || 'desc',
    });

    const query = orgId ? `org_id=${encodeURIComponent(orgId)}&${params}` : params.toString();
    return apiGet(`/api/scans?${query}`);
  },

  // Get scans for specific device
  getDeviceScans: async (deviceId, orgId, filters = {}) => {
    const params = new URLSearchParams({
      skip: filters.skip || 0,
      limit: filters.limit || 50,
    });

    return apiGet(`/api/devices/${deviceId}/scans?${params}`);
  },

  // Get scan details
  getScanDetails: async (scanId, orgId) => {
    return apiGet(`/api/scans/${scanId}`);
  },

  // Create new scan
  createScan: async (deviceId, checks) => {
    return apiPost(`/api/scans`, deviceId && deviceId.device && deviceId.results ? deviceId : {
      device: deviceId,
      results: checks || [],
    });
  },

  // Get compliance trend
  getComplianceTrend: async (deviceId, days = 30) => {
    return apiGet(`/api/devices/${deviceId}/compliance-trend?days=${days}`);
  },

  // Get organization compliance metrics
  getOrgCompliance: async (orgId) => {
    const query = orgId ? `?org_id=${encodeURIComponent(orgId)}` : '';
    return apiGet(`/api/scans/compliance-metrics${query}`);
  },
};

/**
 * deviceService.js - Device management service
 */
export const deviceService = {
  // Get all devices in organization
  getDevices: async (orgId, filters = {}) => {
    const params = new URLSearchParams({
      skip: filters.skip || 0,
      limit: filters.limit || 50,
      os_type: filters.osType || '',
      is_active: filters.isActive !== undefined ? filters.isActive : '',
    });

    return apiGet(`/api/devices?org_id=${orgId}&${params}`);
  },

  // Get device details
  getDevice: async (deviceId) => {
    return apiGet(`/api/devices/${deviceId}`);
  },

  // Register new device
  registerDevice: async (deviceData) => {
    return apiPost(`/api/devices/register`, deviceData);
  },

  // Update device
  updateDevice: async (deviceId, data) => {
    return apiPost(`/api/devices/${deviceId}`, data);
  },

  // Delete device
  deleteDevice: async (deviceId) => {
    return apiDelete(`/api/devices/${deviceId}`);
  },

  // Search devices
  searchDevices: async (orgId, searchTerm) => {
    return apiGet(`/api/devices/search?org_id=${orgId}&q=${searchTerm}`);
  },

  // Get device stats
  getDeviceStats: async (orgId) => {
    return apiGet(`/api/devices/stats?org_id=${orgId}`);
  },
};

/**
 * reportService.js - Report generation service
 */
export const reportService = {
  // Get all reports
  getReports: async (orgId, filters = {}) => {
    const params = new URLSearchParams({
      skip: filters.skip || 0,
      limit: filters.limit || 50,
      report_type: filters.reportType || '',
    });

    return apiGet(`/api/reports?org_id=${encodeURIComponent(orgId)}&${params}`);
  },

  // Create report
  createReport: async (reportData) => {
    return apiPost(`/api/reports`, reportData);
  },

  // Generate PDF
  generatePDF: async (reportId) => {
    return apiGet(`/api/reports/archive/${reportId}/pdf`);
  },

  // Download report
  downloadReport: async (reportId, format = 'pdf') => {
    return apiGet(`/api/reports/archive/${reportId}/pdf?format=${format}`);
  },

  // Schedule report
  scheduleReport: async (reportData) => {
    return apiPost(`/api/reports/schedule`, reportData);
  },
};

/**
 * billingService.js - Billing and subscription service
 */
export const billingService = {
  // Get billing info
  getBillingInfo: async (orgId) => {
    return apiGet('/billing/status');
  },

  // Get usage
  getUsage: async (orgId) => {
    return apiGet('/billing/status');
  },

  // Update plan
  updatePlan: async (orgId, planId) => {
    return apiPost(`/billing/checkout?plan=${planId}`);
  },

  // Get invoices
  getInvoices: async (orgId) => {
    return apiGet('/billing/status');
  },

  // Update payment method
  updatePaymentMethod: async (orgId, paymentData) => {
    return apiPost('/billing/portal', paymentData);
  },
};

export default {
  scanService,
  deviceService,
  reportService,
  billingService,
};

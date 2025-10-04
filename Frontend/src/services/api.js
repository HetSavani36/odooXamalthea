// Frontend/src/services/api.js
// API Service for backend integration

import axios from 'axios';

// Base URL for API - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies (JWT tokens)
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// AUTH API CALLS
// ============================================

export const authAPI = {
    // Register new company/admin
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    // Login
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        if (response.data.success) {
            const { accessToken, user } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        return response.data;
    },

    // Get current user
    me: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    // Refresh token
    refreshToken: async () => {
        const response = await apiClient.post('/auth/refresh-token');
        return response.data;
    },
};

// ============================================
// USER API CALLS
// ============================================

export const userAPI = {
    // Get all users (for admin/manager)
    getAllUsers: async () => {
        const response = await apiClient.get('/user');
        return response.data;
    },

    // Get user by ID
    getUserById: async (userId) => {
        const response = await apiClient.get(`/user/${userId}`);
        return response.data;
    },

    // Create new user
    createUser: async (userData) => {
        const response = await apiClient.post('/user', userData);
        return response.data;
    },

    // Update user
    updateUser: async (userId, userData) => {
        const response = await apiClient.put(`/user/${userId}`, userData);
        return response.data;
    },

    // Delete user
    deleteUser: async (userId) => {
        const response = await apiClient.delete(`/user/${userId}`);
        return response.data;
    },
};

// ============================================
// EXPENSE API CALLS
// ============================================

export const expenseAPI = {
    // Get all expenses
    getAllExpenses: async (filters = {}) => {
        const response = await apiClient.get('/expense', { params: filters });
        return response.data;
    },

    // Get expense by ID
    getExpenseById: async (expenseId) => {
        const response = await apiClient.get(`/expense/${expenseId}`);
        return response.data;
    },

    // Create expense
    createExpense: async (expenseData) => {
        const response = await apiClient.post('/expense', expenseData);
        return response.data;
    },

    // Update expense
    updateExpense: async (expenseId, expenseData) => {
        const response = await apiClient.put(`/expense/${expenseId}`, expenseData);
        return response.data;
    },

    // Delete expense
    deleteExpense: async (expenseId) => {
        const response = await apiClient.delete(`/expense/${expenseId}`);
        return response.data;
    },

    // Submit expense (from draft to pending)
    submitExpense: async (expenseId) => {
        const response = await apiClient.post(`/expense/${expenseId}/submit`);
        return response.data;
    },

    // Approve expense
    approveExpense: async (expenseId, comments) => {
        const response = await apiClient.post(`/expense/${expenseId}/approve`, { comments });
        return response.data;
    },

    // Reject expense
    rejectExpense: async (expenseId, comments) => {
        const response = await apiClient.post(`/expense/${expenseId}/reject`, { comments });
        return response.data;
    },

    // Get expenses pending approval (for managers)
    getPendingExpenses: async () => {
        const response = await apiClient.get('/expense/pending');
        return response.data;
    },

    // Get user's expenses
    getMyExpenses: async () => {
        const response = await apiClient.get('/expense/my-expenses');
        return response.data;
    },
};

// ============================================
// ADMIN API CALLS
// ============================================

export const adminAPI = {
    // Get all companies
    getAllCompanies: async () => {
        const response = await apiClient.get('/admin/companies');
        return response.data;
    },

    // Get company statistics  
    getCompanyStats: async () => {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    },

    // Get admin analytics/stats
    getStats: async () => {
        const response = await apiClient.get('/admin/analytics');
        return response.data;
    },

    // Create approval rule
    createApprovalRule: async (ruleData) => {
        const response = await apiClient.post('/admin/approval-rules', ruleData);
        return response.data;
    },

    // Get approval rules
    getApprovalRules: async () => {
        const response = await apiClient.get('/admin/approval-rules');
        return response.data;
    },

    // Update approval rule
    updateApprovalRule: async (ruleId, ruleData) => {
        const response = await apiClient.put(`/admin/approval-rules/${ruleId}`, ruleData);
        return response.data;
    },

    // Delete approval rule
    deleteApprovalRule: async (ruleId) => {
        const response = await apiClient.delete(`/admin/approval-rules/${ruleId}`);
        return response.data;
    },
};

// ============================================
// DASHBOARD API CALLS
// ============================================

export const dashboardAPI = {
    // Get employee dashboard data
    getEmployeeDashboard: async () => {
        const response = await apiClient.get('/dashboard/employee');
        return response.data;
    },

    // Get manager dashboard data
    getManagerDashboard: async () => {
        const response = await apiClient.get('/dashboard/manager');
        return response.data;
    },

    // Get admin dashboard data
    getAdminDashboard: async () => {
        const response = await apiClient.get('/dashboard/admin');
        return response.data;
    },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Handle API errors
export const handleAPIError = (error) => {
    if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || 'An error occurred';
        return { success: false, message, status: error.response.status };
    } else if (error.request) {
        // Request made but no response
        return { success: false, message: 'No response from server. Please check your connection.', status: 0 };
    } else {
        // Error in request setup
        return { success: false, message: error.message || 'An error occurred', status: 0 };
    }
};

// Export default client for custom requests
export default apiClient;

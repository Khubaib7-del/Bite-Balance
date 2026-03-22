import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
    verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    logout: () => localStorage.removeItem('token')
};

export const foodService = {
    getAllFoods: () => api.get('/foods'),
    searchFoods: (name) => api.get(`/foods/search?name=${name}`),
    addFood: (foodData) => api.post('/foods', foodData),
    updateFood: (id, foodData) => api.put(`/foods/${id}`, foodData),
    deleteFood: (id) => api.delete(`/foods/${id}`)
};

export const mealService = {
    createMealPlan: (date) => api.post('/mealplan', { date }),
    addFoodToMealPlan: (data) => api.post('/mealplan/add-food', data),
    getMealPlanByDate: (date) => api.get(`/mealplan/${date}`),
    getNutritionSummary: (date) => api.get(`/mealplan/nutrition-summary/${date}`),
    deleteMealPlanEntry: (entryId) => api.delete(`/mealplan/entry/${entryId}`),
    getWeeklySummary: () => api.get('/mealplan/weekly-summary')
};

export const savedPlanService = {
    savePlan: (planName, items) => api.post('/saved-plans', { planName, items }),
    getSavedPlans: () => api.get('/saved-plans'),
    getPlanDetails: (id) => api.get(`/saved-plans/${id}`),
    deletePlan: (id) => api.delete(`/saved-plans/${id}`)
};

export const adminService = {
    getUsers: () => api.get('/admin/users'),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id, data) => api.delete(`/admin/users/${id}`),
    getArticles: () => api.get('/admin/articles'),
    createArticle: (data) => api.post('/admin/articles', data),
    deleteArticle: (id) => api.delete(`/admin/articles/${id}`),
    getAdminCode: () => api.get('/admin/settings/admin-code'),
    updateAdminCode: (adminCode) => api.put('/admin/settings/admin-code', { adminCode })
};

export const userService = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.post('/user/profile', data)
};

export default api;

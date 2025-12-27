// src/utils/User.ts
import axios, { AxiosResponse } from 'axios';

// Define interfaces
interface LoginRequest {
    phoneNumber: string;
    password: string;
}

interface LoginResponse {
    code: number;
    result: {
        token: string;
        authenticated: boolean;
    };
}

interface UserResponse {
    id: number;
    name: string | null;
    phone_number: string;
    email: string;
    role_id: number | null;
    is_active: boolean;
}

// API base URL
const API_URL = 'http://localhost:8080/restaurant/api/v1';

// LocalStorage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_response';

// Login function
export const login = async (phoneNumber: string, password: string): Promise<LoginResponse> => {
    try {
        const loginResponse: AxiosResponse<LoginResponse> = await axios.post(`${API_URL}/auth/log-in`, {
            phoneNumber,
            password,
        } as LoginRequest, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000',
                'Accept-Language': 'vi',
            },
            withCredentials: true,
        });

        if (loginResponse.data.code === 0 && loginResponse.data.result.authenticated) {
            const token = loginResponse.data.result.token;
            
            // Decode token to get user role
            const payloadBase64 = token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));
            const role = payload.scope || '';
            console.log('User role:', role);

            // Lưu thông tin token và user role vào localStorage
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem('user_role', role);

            // Lấy thông tin người dùng từ API
            const userDetailResponse: AxiosResponse<{ code: number; result: UserResponse }> = await axios.get(
                `${API_URL}/user/myInfo`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept-Language': 'vi',
                    }
                }
            );
            
            if (userDetailResponse.data.code === 0) {
                // Lưu userResponse vào localStorage
                const userResponse = userDetailResponse.data.result;
                localStorage.setItem(USER_KEY, JSON.stringify(userResponse));  // Lưu toàn bộ thông tin user
            }

            return loginResponse.data;
        }

        return loginResponse.data;
    } catch (error) {
        console.error('Login error:', error);
        throw new Error('Login failed. Please check your credentials.');
    }
};

// Logout function
export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Get token from localStorage
export const getTokenFromLocalStorage = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Get token from localStorage
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// Save UserResponse to localStorage
export const saveUserResponseToLocalStorage = (userResponse?: UserResponse): void => {
    try {
        if (!userResponse) return;
        const userResponseJSON = JSON.stringify(userResponse);
        localStorage.setItem(USER_KEY, userResponseJSON);
        console.log('User response saved to localStorage:', userResponse);
    } catch (error) {
        console.error('Error saving user response to localStorage:', error);
    }
};

// Get UserResponse from localStorage
export const getUserResponseFromLocalStorage = (): UserResponse | null => {
    try {
        const userResponseJSON = localStorage.getItem(USER_KEY);
        if (!userResponseJSON) return null;
        return JSON.parse(userResponseJSON);
    } catch (error) {
        console.error('Error getting user response from localStorage:', error);
        return null;
    }
};

export const getUserId = (): number | null => {
    const userResponse = getUserResponseFromLocalStorage();
    return userResponse ? userResponse.id : null;
};

// Remove UserResponse from localStorage
export const removeUserResponseFromLocalStorage = (): void => {
    try {
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error removing user response from localStorage:', error);
    }
};

// Function to decode JWT token and extract the role
export const getUserRole = (): string | null => {
    try {
        const token = getTokenFromLocalStorage();
        if (!token) return null;

        // JWT token is in the format: header.payload.signature
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return null;

        // Decode the Base64 payload
        const payload = JSON.parse(atob(payloadBase64));

        // Extract the role from the 'scope' field
        return payload.scope || null;
    } catch (error) {
        console.error('Error decoding token to get user role:', error);
        return null;
    }
};

// Check if the token is still valid
export const checkTokenValidity = async (token: string): Promise<boolean> => {
    try {
        const response = await axios.post('http://localhost:8080/restaurant/api/v1/auth/introspect', { token });
        return response.data.code === 0 && response.data.result.valid;
    } catch (error) {
        console.error('Error checking token validity:', error);
        return false;
    }
};

// Refresh token if expired
export const refreshToken = async (): Promise<string | null> => {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await axios.post('http://localhost:8080/restaurant/api/v1/auth/refresh', { token });
        if (response.data.code === 0) {
            const newToken = response.data.result.token;
            localStorage.setItem(TOKEN_KEY, newToken);
            return newToken;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};

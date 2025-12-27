// src/utils/TokenManager.ts
import { getToken, refreshToken } from './user';

export const checkAndRefreshToken = async (): Promise<string | null> => {
    const token = getToken();
    
    if (!token) {
        console.error('No token found');
        return null;
    }

    // Kiểm tra tính hợp lệ của token
    const isValid = await checkTokenValidity(token);

    debugger;
    if (!isValid) {
        console.log('Token expired, refreshing...');
        // Làm mới token nếu token không hợp lệ
        const newToken = await refreshToken();
        return newToken; // Trả về token mới
    }

    console.log('Token is valid');
    return token; // Trả về token hiện tại nếu vẫn hợp lệ
};

// Hàm kiểm tra tính hợp lệ của token
const checkTokenValidity = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch('http://localhost:8080/restaurant/api/v1/auth/introspect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token }),
        });
        debugger;
        const data = await response.json();
        return data.code === 0 && data.result.valid;
    } catch (error) {
        console.error('Error checking token validity:', error);
        return false;
    }
};

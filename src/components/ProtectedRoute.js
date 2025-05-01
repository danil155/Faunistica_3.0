import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import { apiService } from "../api";

export default function ProtectedRoute({ children }) {
    const location = useLocation();
    const [isAuth, setIsAuth] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const authStatus = await apiService.checkAuth();
                setIsAuth(authStatus);
            } catch {
                setIsAuth(false);
            }
        };

        verifyAuth();
    }, [location.pathname]);

    if (isAuth === null) {
        return <div>Loading...</div>; // Или спиннер
    }

    return isAuth ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

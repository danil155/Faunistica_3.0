import { Navigate, useLocation } from 'react-router-dom';
import useToken from './useToken';

export default function ProtectedRoute({ children }) {
    const { token } = useToken();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
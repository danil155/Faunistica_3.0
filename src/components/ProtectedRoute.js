import { useEffect } from 'react';

export function ProtectedRoute({ children, onAuthRequired, isAuthenticated }) {

    useEffect(() => {
        if (!isAuthenticated) {
            onAuthRequired();
        }
    }, [isAuthenticated, onAuthRequired]);

    return children;
}
import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    element: React.FC;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element: Element }) => {
    const token = localStorage.getItem("token");

    return token ? <Element /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

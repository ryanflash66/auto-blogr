import React from "react";

/**
 * ProtectedRoute - Wrapper component for route protection
 * Currently in development mode - returns children directly
 * TODO: Implement authentication when ready for production
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render
 */
const ProtectedRoute = ({ children }) => {
  // Development mode: Allow access to all routes
  return children;
};

export default ProtectedRoute;

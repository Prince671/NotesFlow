import { BrowserRouter, Routes, Route } from "react-router-dom";
import Notes from "./components/Notes";
import Login from "./components/Login";
import Register from "./components/Register";
import SharedNote from "./components/SharedNote";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    
      <Routes>
        {/* Public routes (accessible only if NOT logged in) */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes (need login) */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/shared/:publicId"
          element={
            <ProtectedRoute>
              <SharedNote />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default App;

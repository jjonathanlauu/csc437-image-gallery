import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { MainLayout } from "./MainLayout.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

function App() {
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("authToken") || "",
  );

  useEffect(() => {
    if (authToken) {
      localStorage.setItem("authToken", authToken);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [authToken]);

  return (
    <Routes>
      <Route
        path={VALID_ROUTES.LOGIN}
        element={
          <LoginPage isRegistering={false} onAuthSuccess={setAuthToken} />
        }
      />

      <Route
        path={VALID_ROUTES.REGISTER}
        element={
          <LoginPage isRegistering={true} onAuthSuccess={setAuthToken} />
        }
      />

      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <ProtectedRoute authToken={authToken}>
              <AllImages authToken={authToken} />
            </ProtectedRoute>
          }
        />
        <Route
          path="gallery/:imageId"
          element={
            <ProtectedRoute authToken={authToken}>
              <ImageDetails authToken={authToken} />
            </ProtectedRoute>
          }
        />
        <Route
          path="upload"
          element={
            <ProtectedRoute authToken={authToken}>
              <UploadPage authToken={authToken} />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

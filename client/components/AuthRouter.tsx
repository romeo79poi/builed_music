import { useEffect, useState } from "react";
import { useFirebase } from "../context/FirebaseContext";
import Splash from "../pages/Splash";
import Home from "../pages/Home";
import Signup from "../pages/Signup";

export default function AuthRouter() {
  const { user, loading } = useFirebase();
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    // Show splash for at least 3 seconds
    const timer = setTimeout(() => {
      setSplashComplete(true);
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Always show splash initially (for 3 seconds minimum)
  if (!splashComplete || loading) {
    return <Splash />;
  }

  // After splash is complete and auth is loaded
  // If user is authenticated, show Home
  if (user) {
    return <Home />;
  }

  // If user is not authenticated, show Signup
  return <Signup />;
}

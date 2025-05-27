import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './dashboard.css';

export const Dashboard = () => {
  const isGuest = localStorage.getItem('guest_mode') === 'true';
  const [userData, setUserData] = useState<{ username: string } | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isGuest) return;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (err) {
        setError("Failed to fetch user data");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate, isGuest]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guest_mode");
    navigate("/login");
  };

  const handleOlympiadsClick = () => {
    navigate("/olympiads");
  };

const handleProfileClick = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    await axios.get("/profile", { headers: { Authorization: `Bearer ${token}` } });
    navigate("/profile");
  } catch (err) {
    localStorage.removeItem("token");
    navigate("/login");
  }
};

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
        {error && <div className="error-message">{error}</div>} {/* Добавлено */}
      {isGuest && (
        <div className="guest-banner">
          You're browsing in guest mode. <a href="/register">Register</a> for full access.
        </div>
      )}
      {userData && <p className="welcome-message">Welcome, {userData.username}!</p>}
      <div className="button-group">
        <button className="dashboard-button" onClick={handleOlympiadsClick}>
          Все олимпиады
        </button>
        <button className="dashboard-button" onClick={handleProfileClick}>
          Профиль
        </button>
        <button className="dashboard-button" onClick={handleLogout}>
          {isGuest ? "Exit Guest Mode" : "Logout"}
        </button>
      </div>
    </div>
  );
};
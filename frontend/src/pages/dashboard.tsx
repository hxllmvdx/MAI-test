import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './dashboard.css';

export const Dashboard = () => {
  const [userData, setUserData] = useState<{ username: string } | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOlympiadsClick = () => {
    navigate("/olympiads");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      {userData && <p className="welcome-message">Welcome, {userData.username}!</p>}
      <div className="button-group">
        <button className="dashboard-button" onClick={handleOlympiadsClick}>Все олимпиады</button>
        <button className="dashboard-button" onClick={handleProfileClick}>Профиль</button>
        <button className="dashboard-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

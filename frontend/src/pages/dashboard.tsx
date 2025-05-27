import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './dashboard.css';

interface Olympiad {
  id: number;
  title: string;
  start_date: string;
  registration_link: string;
  level: string;
  parsed_subjects: string[];
}

interface UserFilters {
  selected_olympiads: number[];
  selected_levels: string[];
  selected_subjects: string[];
}

export const Dashboard = () => {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [userFilters, setUserFilters] = useState<UserFilters>({
    selected_olympiads: [],
    selected_levels: [],
    selected_subjects: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isGuest = localStorage.getItem('guest_mode') === 'true';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const olympiadsResponse = await axios.get("http://localhost:8000/all-olympiads");
        const allOlympiads: Olympiad[] = olympiadsResponse.data;

        let filters: UserFilters = {
          selected_olympiads: [],
          selected_levels: [],
          selected_subjects: []
        };

        if (!isGuest) {
          const token = localStorage.getItem("token");
          const userResponse = await axios.get("http://localhost:8000/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          filters = {
            selected_olympiads: userResponse.data.selected_olympiads,
            selected_levels: userResponse.data.selected_levels || [],
            selected_subjects: userResponse.data.selected_subjects || []
          };
        }

        const filtered = allOlympiads.filter(olympiad => {
          if (filters.selected_olympiads.includes(olympiad.id)) return true;

          const hasActiveFilters =
            filters.selected_levels.length > 0 ||
            filters.selected_subjects.length > 0;

          if (!hasActiveFilters) return false;

          const levelMatch =
            filters.selected_levels.length === 0 ||
            filters.selected_levels.some(l =>
              l.trim().toLowerCase() === olympiad.level?.trim().toLowerCase()
            );

          const subjectMatch =
            filters.selected_subjects.length === 0 ||
            (filters.selected_subjects.some(filterSubj =>
              olympiad.parsed_subjects?.some(olympiadSubj =>
                filterSubj.trim().toLowerCase() === olympiadSubj.trim().toLowerCase()
              )
            ));
          console.log("Olympiads", olympiad.parsed_subjects);

          return levelMatch && subjectMatch;
        });

        setOlympiads(filtered);
        setUserFilters(filters);
      } catch (err) {
        setError("Ошибка загрузки данных");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, isGuest]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guest_mode");
    navigate("/login");
  };

  const handleOlympiadsClick = () => navigate("/olympiads");
  const handleProfileClick = () => navigate("/profile");

  if (loading) {
    return (
      <div className="dashboard-container">
        <p className="loading-text">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="navigation-header">
        <h2 className="menu-title">Меню</h2>
        <div className="buttons-container">
          <button className="primary-button" onClick={handleOlympiadsClick}>
            Все олимпиады
          </button>
          <button className="primary-button" onClick={handleProfileClick}>
            Профиль
          </button>
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            {isGuest ? "Выйти" : "Выйти из аккаунта"}
          </button>
        </div>
      </div>

      <h1 className="dashboard-title">Мои олимпиады</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="olympiads-grid">
        {olympiads.map(olympiad => (
          <div key={olympiad.id} className="olympiad-card">
            <h3>{olympiad.title}</h3>
            <p className="olympiad-date">Начало: {olympiad.start_date}</p>
            <button
              className="registration-button"
              onClick={() => window.open(olympiad.registration_link, "_blank")}
            >
              Перейти к регистрации
            </button>
          </div>
        ))}

        {olympiads.length === 0 && !loading && (
          <div className="no-results">
            {userFilters.selected_olympiads.length === 0
              ? "Нет олимпиад по выбранным фильтрам"
              : "У вас нет активных подписок"}
          </div>
        )}
      </div>
    </div>
  );
};
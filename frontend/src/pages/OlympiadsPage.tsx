import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import './OlympiadsPage.css';
import { Olympiad, FilterSettings } from "../types/olympiad.ts";

const OlympiadsPage: React.FC = () => {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [filteredOlympiads, setFilteredOlympiads] = useState<Olympiad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSettings>({
    levels: [],
    subjects: [],
    universities: []
  });
  const [participatedOlympiads, setParticipatedOlympiads] = useState<number[]>([]);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [searchUniversity, setSearchUniversity] = useState("");
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOlympiadId, setSelectedOlympiadId] = useState<number | null>(null);
  const [userDate, setUserDate] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [olympiadsResponse, participationsResponse, profileResponse] = await Promise.all([
          axios.get('http://localhost:8000/olympiads'),
          !localStorage.getItem('guest_mode') ? axios.get('http://localhost:8000/participations/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }) : Promise.resolve({ data: [] }),
          !localStorage.getItem('guest_mode') ? axios.get('http://localhost:8000/profile', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }) : Promise.resolve({ data: { user_date: new Date().toISOString() } })
        ]);

        const olympiadsData = olympiadsResponse.data;
        setOlympiads(olympiadsData);
        setFilteredOlympiads(olympiadsData);
        setParticipatedOlympiads(participationsResponse.data || []);
        setUserDate(new Date(profileResponse.data.user_date).toLocaleDateString('en-CA'));

        const allSubjects = olympiadsData.flatMap((o: Olympiad) => o.subjects);
        const unique = Array.from(new Set(allSubjects)).filter(s => s.trim() !== "");
        setUniqueSubjects(unique);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch olympiads");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isOlympiadCompleted = (endDate: string): boolean => {
    if (!userDate) return false;

    const [day, month, year] = endDate.split('.');
    const olympiadEndDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const userDateTime = new Date(userDate);

    return olympiadEndDate < userDateTime;
  };

  useEffect(() => {
    let result = olympiads;

    if (filters.levels?.length && !filters.levels.includes('')) {
      result = result.filter(o => filters.levels.includes(o.level));
    }

    if (filters.subjects?.length && !filters.subjects.includes('')) {
      result = result.filter(o =>
        filters.subjects.some(subj => o.subjects.includes(subj)))
    }

    if (searchUniversity) {
      result = result.filter(o =>
        o.university.toLowerCase().includes(searchUniversity.toLowerCase())
      );
    }

    setFilteredOlympiads(result);
  }, [filters, searchUniversity, olympiads]);

  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);

  const toggleSubjectsDropdown = () => {
    setIsSubjectsOpen(!isSubjectsOpen);
  };

  const handleSubjectCheck = (subject: string) => {
    setFilters(prev => {
      const newSubjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects: newSubjects };
    });
  };

  const handleParticipation = async (olympiadId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event

    if (participatedOlympiads.includes(olympiadId)) {
      try {
        await axios.delete(`http://localhost:8000/participations/${olympiadId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setParticipatedOlympiads(prev => prev.filter(id => id !== olympiadId));
      } catch (err) {
        console.error('Failed to delete participation:', err);
      }
    } else {
      setSelectedOlympiadId(olympiadId);
      setShowDateModal(true);
    }
  };

  const confirmParticipation = async () => {
    if (!selectedDate || !selectedOlympiadId) return;

    try {
      await axios.post(
        'http://localhost:8000/participations',
        {
          olympiad_id: selectedOlympiadId,
          participation_date: selectedDate
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setParticipatedOlympiads(prev => [...prev, selectedOlympiadId]);
      setShowDateModal(false);
    } catch (err) {
      console.error('Failed to update participation:', err);
    }
  };

  const handleViewOlympiad = (olympiadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/olympiads/${olympiadId}`);
  };

  const getLevelLabel = (level: string) => {
    switch(level) {
      case '1': return 'I уровень';
      case '2': return 'II уровень';
      case '3': return 'III уровень';
      default: return 'Другой';
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case '1': return '#3B82F6';
      case '2': return '#10B981';
      case '3': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const handleLevelSelect = (level: string) => {
    setFilters(prev => ({
      ...prev,
      levels: level ? [level] : []
    }));
    setIsLevelsOpen(false);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <div className="olympiads-page">
      <h1>Календарь олимпиад</h1>

      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Уровень</label>
            <div className="custom-dropdown">
              <button
                className="dropdown-toggle"
                onClick={() => setIsLevelsOpen(!isLevelsOpen)}
              >
                {filters.levels[0]
                  ? getLevelLabel(filters.levels[0])
                  : 'Все уровни'}
              </button>
              {isLevelsOpen && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => handleLevelSelect('')}
                  >
                    Все уровни
                  </div>
                  {['1', '2', '3', '-'].map(level => (
                    <div
                      key={level}
                      className="dropdown-item"
                      onClick={() => handleLevelSelect(level)}
                    >
                      {getLevelLabel(level)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label>Предметы</label>
            <div className="custom-dropdown">
              <button
                className="dropdown-toggle"
                onClick={toggleSubjectsDropdown}
              >
                {filters.subjects.length > 0
                  ? `Выбрано: ${filters.subjects.length}`
                  : 'Нажмите, чтобы выбрать'}
              </button>
              {isSubjectsOpen && (
                <div className="dropdown-menu">
                  {uniqueSubjects.map(subject => (
                    <label key={subject} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={filters.subjects.includes(subject)}
                        onChange={() => handleSubjectCheck(subject)}
                      />
                      <span className="checkmark"></span>
                      {subject}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label>Олимпиада</label>
            <input
              type="text"
              className="filter-control"
              placeholder="Введите название..."
              value={searchUniversity}
              onChange={(e) => setSearchUniversity(e.target.value)}
            />
          </div>

          <button
            className="reset-button"
            onClick={() => {
              setFilters({levels: [], subjects: [], universities: []});
              setSearchUniversity('');
            }}
          >
            Сбросить всё
          </button>
        </div>
      </div>

      {showDateModal && (
        <div className="date-modal-overlay">
          <div className="date-modal">
            <h3 style={{ color: '#000' }}>Введите дату участия (например: 1234-56-78)</h3>
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Формат: ГГГГ-ММ-ДД"
              className="date-input"
            />
            <div className="modal-buttons">
              <button
                onClick={() => setShowDateModal(false)}
                className="cancel-btn"
              >
                Отмена
              </button>
              <button
                onClick={confirmParticipation}
                className="confirm-btn"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="olympiads-grid">
        {filteredOlympiads.map(olympiad => (
          <div
            key={olympiad.id}
            className="olympiad-card"
            style={{
              backgroundColor: isOlympiadCompleted(olympiad.end_date) ? '#ffebee' : 'white'
            }}
          >
            <div className="card-header">
              <h3>{olympiad.title}</h3>
              <span
                className="level-badge"
                style={{backgroundColor: getLevelColor(olympiad.level)}}
              >
                {getLevelLabel(olympiad.level)}
              </span>
            </div>

            <div className="university">{olympiad.university}</div>

            <div className="details">
              <div className="detail">
                <span>📅 Начало: {olympiad.start_date}</span>
                <span>📅 Конец: {olympiad.end_date}</span>
                <span>🕒 Длительность: {olympiad.duration}</span>
                <span>📚 Предметы: {
                  olympiad.subjects.length > 0
                    ? olympiad.subjects.join(", ")
                    : "Нет данных"
                }</span>
              </div>
            </div>

            <div className="card-footer">
              <a
                href={olympiad.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="register-btn"
                onClick={(e) => e.stopPropagation()}
              >
                Регистрация <ExternalLink size={14} />
              </a>

              <button
                onClick={(e) => handleViewOlympiad(olympiad.id, e)}
                className="view-olympiad-btn"
              >
                Перейти к олимпиаде
              </button>

              {!localStorage.getItem('guest_mode') && (
                <button
                  onClick={(e) => handleParticipation(olympiad.id, e)}
                  className={`participation-btn ${
                    participatedOlympiads.includes(olympiad.id) ? 'participated' : ''
                  }`}
                >
                  {participatedOlympiads.includes(olympiad.id) ? '✓ Участвовал' : 'Отметить участие'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OlympiadsPage;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Olympiad, FilterSettings } from "../types/olympiad";
import './OlympiadsPage.css';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/olympiads');
        const olympiadsData = response.data;
        setOlympiads(olympiadsData);
        setFilteredOlympiads(olympiadsData);

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

  const handleParticipation = async (olympiadId: number) => {
    try {
      if (participatedOlympiads.includes(olympiadId)) {
        await axios.delete(`http://localhost:8000/participations/${olympiadId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setParticipatedOlympiads(prev => prev.filter(id => id !== olympiadId));
      } else {
        await axios.post('http://localhost:8000/participations',
          { olympiad_id: olympiadId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setParticipatedOlympiads(prev => [...prev, olympiadId]);
      }
    } catch (err) {
      console.error('Failed to update participation:', err);
    }
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


        <div className="olympiads-grid">
          {filteredOlympiads.map(olympiad => (
              <div key={olympiad.id} className="olympiad-card">
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
                  >
                    Регистрация
                  </a>

                  <button
                      onClick={() => handleParticipation(olympiad.id)}
                      className={`participation-btn ${
                          participatedOlympiads.includes(olympiad.id) ? 'participated' : ''
                      }`}
                  >
                    {participatedOlympiads.includes(olympiad.id) ? '✓ Участвовал' : 'Отметить участие'}
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default OlympiadsPage;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/olympiads');
        const olympiadsData = response.data;
        setOlympiads(olympiadsData);
        setFilteredOlympiads(olympiadsData);

        // Сбор уникальных предметов
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

    // Фильтр по уровням
    if (filters.levels?.length) {
      result = result.filter(o => filters.levels.includes(o.level));
    }

    // Фильтр по предметам (хотя бы одно совпадение)
    if (filters.subjects?.length) {
      result = result.filter(o =>
        filters.subjects.some(subj => o.subjects.includes(subj))
      );
    }

    // Фильтр по университету (частичное совпадение)
    if (searchUniversity) {
      const searchTerm = searchUniversity.toLowerCase();
      result = result.filter(o =>
        o.university.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredOlympiads(result);
  }, [filters, searchUniversity, olympiads]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selected = Array.from(options)
      .filter(opt => opt.selected)
      .map(opt => opt.value);
    setFilters(prev => ({ ...prev, [name]: selected }));
  };

  const handleUniversitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUniversity(e.target.value);
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

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
      <div className="olympiads-page">
        <h1>Календарь олимпиад</h1>

        <div className="filters">
          <div className="filter-group">
            <label>Уровень:</label>
            <select
                className="level-filter"
                name="levels"
                value={filters.levels}
                onChange={handleFilterChange}
            >
              <option value="">Все уровни</option>
              <option value="1">I уровень</option>
              <option value="2">II уровень</option>
              <option value="3">III уровень</option>
              <option value="-">Другие</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Предмет:</label>
            <select
                className="subject-filter"
                name="subjects"
                value={filters.subjects}
                onChange={handleFilterChange}
            >
              <option value="">Все предметы</option>
              {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Университет:</label>
            <input
                type="text"
                className="university-search"
                placeholder="Поиск..."
                value={searchUniversity}
                onChange={handleUniversitySearch}
            />
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
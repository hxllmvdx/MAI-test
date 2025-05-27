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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/olympiads');
        setOlympiads(response.data);
        setFilteredOlympiads(response.data);
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
    
    // if (filters.levels) {
    //   result = result.filter(o => o.level === filters.levels);
    // }
    // if (filters.subjects) {
    //   result = result.filter(o => o.subjects.includes(filters.subjects));
    // }
    // if (filters.universities) {
    //   result = result.filter(o =>
    //     o.university.toLowerCase().includes(filters.universities.toLowerCase())
    //   );
    // }
    
    setFilteredOlympiads(result);
  }, [filters, olympiads]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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
          <select className="levels" name="level" value={filters.levels} onChange={handleFilterChange}>
            <option value="">Все</option>
            <option value="1">I уровень</option>
            <option value="2">II уровень</option>
            <option value="3">III уровень</option>
            <option value="-">Другие</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Предмет:</label>
          <select 
            className="subjects" 
            name="subject" 
            value={filters.subjects}
            onChange={handleFilterChange}
          >
            <option value="">Все</option>
            <option value="математика">Математика</option>
            <option value="информатика">Информатика</option>
            <option value="астрономия">Астрономия</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Университет:</label>
          <input 
            className="search"
            type="text" 
            name="university" 
            placeholder="Поиск..." 
            value={filters.universities}
            onChange={handleFilterChange}
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
                style={{ backgroundColor: getLevelColor(olympiad.level) }}
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
                <span>📚 Предметы: {olympiad.subjects}</span>
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
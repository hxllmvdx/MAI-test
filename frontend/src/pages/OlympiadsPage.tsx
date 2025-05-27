import React, { useEffect, useState } from "react";
import { Olympiad } from "../types/olympiad";
import './OlympiadsPage.css';

const OlympiadsPage: React.FC = () => {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [filteredOlympiads, setFilteredOlympiads] = useState<Olympiad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    level: '',
    subject: '',
    university: ''
  });
  const [participatedOlympiads, setParticipatedOlympiads] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock данные
        const mockOlympiads: Olympiad[] = [
          {
            id: '1',
            name: 'СПбАстро – Практический тур',
            time: '10:00 -14:00',
            date: '02.03.2025',
            url: 'http://school.astro.spbu.ru/?q=node/670',
            university: 'СПбАстро',
            level: 'other',
            subject: 'астрономия'
          },
          {
            id: '2',
            name: 'Технокубок – Заключительный тур',
            time: '10:00 -13:00',
            date: '02.03.2025',
            url: 'https://techno-cup.ru/#timetable',
            university: 'Технокубок',
            level: 'other',
            subject: 'информатика'
          },
          {
            id: '3',
            name: 'Олимпиада ИТМО – Математика',
            time: '10:00 -14:00',
            date: '15.03.2025',
            url: 'https://olymp.itmo.ru/',
            university: 'Олимпиада ИТМО',
            level: 'third',
            subject: 'математика'
          },
          {
            id: '4',
            name: 'ММО – Первый день',
            time: '10:00 -14:00',
            date: '16.03.2025',
            url: 'https://mmo.mccme.ru/',
            university: 'ММО',
            level: 'first',
            subject: 'математика'
          },
          {
            id: '5',
            name: 'ММО – Второй день', 
            time: '10:00 -14:00', 
            date: '29.03.2025', 
            url: 'https://mmo.mccme.ru//', 
            university: 'ММО', 
            level: 'first',
            subject: 'математика'
          },
          {
            id: '6',
            name: 'Олимпиада ИТМО – Информатика',
            time: '10:00 -14:00',
            date: '16.03.2025',
            url: 'https://olymp.itmo.ru/',
            university: 'Олимпиада ИТМО',
            level: 'third',
            subject: 'информатика'
          }
        ];

        setOlympiads(mockOlympiads);
        setFilteredOlympiads(mockOlympiads);
        
        // Загрузка истории участия
        const mockParticipation = ['3', '4'];
        setParticipatedOlympiads(mockParticipation);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = olympiads;
    
    if (filters.level) {
      result = result.filter(o => o.level === filters.level);
    }
    if (filters.subject) {
      result = result.filter(o => o.subject === filters.subject);
    }
    if (filters.university) {
      result = result.filter(o => 
        o.university.toLowerCase().includes(filters.university.toLowerCase())
      );
    }
    
    setFilteredOlympiads(result);
  }, [filters, olympiads]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleParticipation = (olympiadId: string) => {
    setParticipatedOlympiads(prev => 
      prev.includes(olympiadId) 
        ? prev.filter(id => id !== olympiadId) 
        : [...prev, olympiadId]
    );
    // Здесь должен быть API вызов для сохранения
  };

  const getLevelLabel = (level: string) => {
    switch(level) {
      case 'first': return 'I уровень';
      case 'second': return 'II уровень';
      case 'third': return 'III уровень';
      default: return 'Другой';
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'first': return '#3B82F6';
      case 'second': return '#10B981';
      case 'third': return '#8B5CF6';
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
          <select className="levels" name="level" value={filters.level} onChange={handleFilterChange}>
            <option value="">Все</option>
            <option value="first">I уровень</option>
            <option value="second">II уровень</option>
            <option value="third">III уровень</option>
            <option value="other">Другие</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Предмет:</label>
          <select 
            className="subjects" 
            name="subject" 
            value={filters.subject} 
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
            value={filters.university}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      
      <div className="olympiads-grid">
        {filteredOlympiads.map(olympiad => (
          <div key={olympiad.id} className="olympiad-card">
            <div className="card-header">
              <h3>{olympiad.name}</h3>
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
                <span>📅 {olympiad.date}</span>
                <span>🕒 {olympiad.time}</span>
              </div>
            </div>
            
            <div className="card-footer">
              <a 
                href={olympiad.url} 
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
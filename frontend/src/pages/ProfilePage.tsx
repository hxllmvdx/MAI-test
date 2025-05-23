import React, { useState, useEffect } from 'react';
import { Olympiad, NotificationFilters, ParticipationHistory } from '../types/olympiad';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const [notificationFilters, setNotificationFilters] = useState<NotificationFilters>({
    olympiads: [],
    subjects: [],
    levels: []
  });
  const [participationHistory, setParticipationHistory] = useState<ParticipationHistory[]>([]);
  const [availableOlympiads, setAvailableOlympiads] = useState<Olympiad[]>([]);
  const [loading, setLoading] = useState(true);

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
          // ... другие олимпиады
        ];

        const mockFilters: NotificationFilters = {
          olympiads: ['1'],
          subjects: ['математика'],
          levels: ['first', 'second']
        };

        const mockHistory: ParticipationHistory[] = [
          {
            id: '1',
            olympiadId: '3',
            name: 'Олимпиада ИТМО – Математика',
            date: '15.03.2025',
            participationDate: '15.03.2025',
            result: 'Победитель'
          }
        ];

        setAvailableOlympiads(mockOlympiads);
        setNotificationFilters(mockFilters);
        setParticipationHistory(mockHistory);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (type: keyof NotificationFilters, value: string) => {
    setNotificationFilters(prev => {
      const currentValues = [...prev[type]];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [type]: newValues };
    });
    // Здесь должен быть API вызов для сохранения
  };

  const removeFromHistory = (id: string) => {
    setParticipationHistory(prev => prev.filter(item => item.id !== id));
    // Здесь должен быть API вызов для удаления
  };

  if (loading) {
    return <div className="loading">Загрузка профиля...</div>;
  }

  return (
    <div className="profile-page">
        <h1>Мой профиль</h1>
      
      
      <section className="notification-settings">
        <h2 className='notifications-h'>Настройки уведомлений</h2>
        
        <div className="settings-section">
          <h3 className='notifications-h'>Конкретные олимпиады</h3>
            <div className="checkbox-group">
                {availableOlympiads.map(olympiad => (
                <label key={olympiad.id} className="checkbox-label">
                <input
                    type="checkbox"
                    checked={notificationFilters.olympiads.includes(olympiad.id)}
                    onChange={() => handleFilterChange('olympiads', olympiad.id)}
                />
                <span>{olympiad.name}</span>
                </label>
            ))}
            </div>
        </div>
        
        <div className="settings-section">
          <h3>Предметы</h3>
          <div className="checkbox-group">
            {['математика', 'информатика', 'астрономия'].map(subject => (
              <label key={subject} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationFilters.subjects.includes(subject)}
                  onChange={() => handleFilterChange('subjects', subject)}
                />
                {subject}
              </label>
            ))}
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Уровни олимпиад</h3>
          <div className="checkbox-group">
            {['first', 'second', 'third'].map(level => (
              <label key={level} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationFilters.levels.includes(level)}
                  onChange={() => handleFilterChange('levels', level)}
                />
                {level === 'first' ? 'I уровень' : 
                 level === 'second' ? 'II уровень' : 'III уровень'}
              </label>
            ))}
          </div>
        </div>
      </section>
      
      <section className="participation-history">
        <h2>История участия</h2>
        
        {participationHistory.length > 0 ? (
          <div className="history-list">
            {participationHistory.map(item => (
              <div key={item.id} className="history-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Дата олимпиады: {item.date}</p>
                  <p>Участие: {item.participationDate}</p>
                  {item.result && <p>Результат: <strong>{item.result}</strong></p>}
                </div>
                <button 
                  onClick={() => removeFromHistory(item.id)}
                  className="remove-btn"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-history">Вы еще не участвовали в олимпиадах</p>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
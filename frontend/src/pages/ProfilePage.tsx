import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Olympiad, NotificationFilters, ParticipationHistory } from '../types/olympiad';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [nDaysNotice, setNDaysNotice] = useState(7);
  const [notificationFilters, setNotificationFilters] = useState<NotificationFilters>({
    olympiads: [],
    subjects: [],
    levels: []
  });
  const [userDate, setUserDate] = useState('');
  const [participations, setParticipations] = useState<Olympiad[]>([]);
  const [availableOlympiads, setAvailableOlympiads] = useState<Olympiad[]>([]);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [profileRes, olympiadsRes, participationsRes] = await Promise.all([
          axios.get('http://localhost:8000/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/all-olympiads'),
          axios.get('http://localhost:8000/participations/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!Array.isArray(olympiadsRes.data)) {
          throw new Error('Invalid data format from server');
        }

        setUsername(profileRes.data.username);
        setNDaysNotice(profileRes.data.n_days_notice);

        setNotificationFilters({
          olympiads: profileRes.data.selected_olympiads || [],
          subjects: profileRes.data.selected_subjects || [],
          levels: profileRes.data.selected_levels || []
        });

        const subjects = Array.from(new Set(
          olympiadsRes.data.flatMap((o: Olympiad) => o.subjects || [])
        ));
        setUniqueSubjects(subjects);
        setAvailableOlympiads(olympiadsRes.data);

        // Filter olympiads to get only those the user participated in
        const participatedOlympiadIds = participationsRes.data;
        const participatedOlympiads = olympiadsRes.data.filter((olympiad: Olympiad) =>
          participatedOlympiadIds.includes(olympiad.id)
        );
        setParticipations(participatedOlympiads);

        const rawDate = new Date(profileRes.data.user_date);
        const formattedDate = rawDate.toLocaleDateString('en-CA');
        setUserDate(formattedDate);

      } catch (err) {
        setError('Ошибка загрузки данных профиля');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleFilterChange = (type: keyof NotificationFilters, value: string) => {
    setNotificationFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  useEffect(() => {
    if (saveSuccess || saveError) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, saveError]);

  const handleSave = async () => {
    try {
      await axios.put('http://localhost:8000/profile', {
        n_days_notice: nDaysNotice,
        user_date: userDate,
        selected_olympiads: notificationFilters.olympiads,
        selected_subjects: notificationFilters.subjects,
        selected_levels: notificationFilters.levels
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSaveSuccess(true);
      setSaveError(false);
    } catch (err) {
      setSaveSuccess(false);
      setSaveError(true);
    }
  };

  const handleRemoveParticipation = async (olympiadId: number) => {
    try {
      await axios.delete(`http://localhost:8000/participations/${olympiadId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setParticipations(prev => prev.filter(p => p.id !== olympiadId));
    } catch (err) {
      console.error('Failed to remove participation:', err);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile-page">
      <h1>Ваш профиль</h1>

      <div className="user-info-section">
        <p className="username-info">Имя пользователя: {username}</p>
        <div className="date-section">
          <h3>Установка даты (гггг-мм-дд)</h3>
          <input
            type="text"
            value={userDate}
            onChange={(e) => setUserDate(e.target.value)}
            placeholder="Введите дату в формате ГГГГ-ММ-ДД"
            className="date-input"
          />
        </div>
      </div>

      <section className="notification-settings">
        <h2 className="notifications-h">Настройки уведомлений</h2>

        <div className="days-notice-section">
          <h3>Дни до уведомления</h3>
          <input
            type="number"
            value={nDaysNotice}
            onChange={(e) => setNDaysNotice(Number(e.target.value))}
            min="1"
            max="30"
            className="notice-input"
          />
        </div>

        <div className="settings-section">
          <h3>Конкретные олимпиады</h3>
          <div className="checkbox-group">
            {availableOlympiads.map(olympiad => (
              <label key={olympiad.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationFilters.olympiads.includes(olympiad.id)}
                  onChange={() => handleFilterChange('olympiads', olympiad.id)}
                />
                <span>{olympiad.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Предметы</h3>
          <div className="checkbox-group">
            {uniqueSubjects.map(subject => (
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
            {['1', '2', '3'].map(level => (
              <label key={level} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={notificationFilters.levels.includes(level)}
                  onChange={() => handleFilterChange('levels', level)}
                />
                {level === '1' ? 'I уровень' :
                  level === '2' ? 'II уровень' : 'III уровень'}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="participation-history">
        <h2>История участия</h2>
        {participations.length > 0 ? (
          <div className="history-list">
            {participations.map(olympiad => (
              <div key={olympiad.id} className="history-item">
                <div className="item-info">
                  <h4>{olympiad.title}</h4>
                  <p>Дата начала: {olympiad.start_date}</p>
                  <p>Дата окончания: {olympiad.end_date}</p>
                  <p>Уровень: {olympiad.level}</p>
                  <p>Предметы: {olympiad.subjects.join(', ')}</p>
                </div>
                <button
                  onClick={() => handleRemoveParticipation(olympiad.id)}
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

      <div className="status-messages">
        {saveSuccess && (
          <div className="success-message">
            ✅ Изменения успешно сохранены
          </div>
        )}
        {saveError && (
          <div className="error-message">
            ⚠️ Что-то пошло не так. Попробуйте еще раз
          </div>
        )}
      </div>

      <button onClick={handleSave} className="save-button">
        Сохранить изменения
      </button>
    </div>
  );
};

export default ProfilePage;
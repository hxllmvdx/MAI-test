import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Calendar, BookOpen, Building, Award, ExternalLink } from 'lucide-react';
import './OlympiadDetailPage.css';
import { Olympiad } from "../types/olympiad.ts"

interface Comment {
  id: number;
  text: string;
  created_at: string;
  author_id: number;
  author_name?: string;
}

const OlympiadDetail: React.FC = () => {
 const { olympiadId } = useParams<{ olympiadId: string }>();
  const [olympiad, setOlympiad] = useState<Olympiad | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    console.log(olympiadId)
    const fetchData = async () => {
      if (!olympiadId) {
        setError('Invalid olympiad ID');
        setLoading(false);
        return;
      }

      try {
        const [olympiadResponse, commentsResponse] = await Promise.all([
          axios.get(`http://localhost:8000/olympiads/${olympiadId}`),
          axios.get(`http://localhost:8000/olympiads/${olympiadId}/comments`)
        ]);

        const commentsWithAuthors = commentsResponse.data.map((comment: any) => ({
            ...comment,
            author_name: comment.author?.username || `User ${comment.author_id}`
        }));

        setOlympiad(olympiadResponse.data);
        setComments(commentsWithAuthors);
        setUserLoggedIn(!localStorage.getItem('guest_mode'));
      } catch (err) {
        setError('Failed to fetch olympiad details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [olympiadId]);

 const handleSubmitComment = async () => {
    if (!newComment.trim() || !olympiadId) return;

    setSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/olympiads/${olympiadId}/comments`,
        { text: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setComments(prevComments => [...prevComments, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';

    try {
      const [day, month, year] = dateStr.split('.');
      const date = new Date(`${year}-${month}-${day}`);
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (err) {
      return dateStr;
    }
  };

  if (loading) {
    return <div className="olympiad-detail-loading">Загрузка...</div>;
  }

  if (error || !olympiad) {
    return (
      <div className="olympiad-detail-error">
        <h2>Ошибка загрузки данных</h2>
        <p>{error || 'Не удалось загрузить информацию об олимпиаде'}</p>
        <Link to="/olympiads" className="back-link">Вернуться к списку олимпиад</Link>
      </div>
    );
  }

  return (
    <div className="olympiad-detail-container">
      <Link to="/olympiads" className="back-link">
        ← Вернуться к списку олимпиад
      </Link>

      <div className="olympiad-detail-card">
        <div className="olympiad-header">
          <h1>{olympiad.title}</h1>
          <span
            className="level-badge"
            style={{ backgroundColor: getLevelColor(olympiad.level) }}
          >
            {getLevelLabel(olympiad.level)}
          </span>
        </div>

        <div className="olympiad-university">
          <Building size={18} />
          <span>{olympiad.university}</span>
        </div>

        <div className="olympiad-info-grid">
          <div className="info-item">
            <Calendar size={18} />
            <div>
              <strong>Начало</strong>
              <p>{formatDate(olympiad.start_date)}</p>
            </div>
          </div>

          <div className="info-item">
            <Calendar size={18} />
            <div>
              <strong>Окончание</strong>
              <p>{formatDate(olympiad.end_date)}</p>
            </div>
          </div>

          <div className="info-item">
            <Clock size={18} />
            <div>
              <strong>Длительность</strong>
              <p>{olympiad.duration}</p>
            </div>
          </div>

          <div className="info-item">
            <Award size={18} />
            <div>
              <strong>Статус</strong>
              <p className={`status-${olympiad.status}`}>
                {olympiad.status === 'completed' ? 'Завершена' : 'Предстоит'}
              </p>
            </div>
          </div>
        </div>

        <div className="olympiad-subjects">
          <BookOpen size={18} />
          <div>
            <strong>Предметы</strong>
            <div className="subject-tags">
              {olympiad.subjects.length > 0 ? (
                olympiad.subjects.map((subject, index) => (
                  <span key={index} className="subject-tag">{subject}</span>
                ))
              ) : (
                <span className="no-subjects">Нет данных о предметах</span>
              )}
            </div>
          </div>
        </div>

        <a
          href={olympiad.registration_link}
          target="_blank"
          rel="noopener noreferrer"
          className="registration-button"
        >
          Регистрация <ExternalLink size={16} />
        </a>
      </div>

      <div className="comments-section">
        <h2>Комментарии</h2>

        {comments.length > 0 ? (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.author_name || `Пользователь ${comment.author_id}`}
                  </span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-comments">
            Пока нет комментариев. Будьте первым!
          </div>
        )}

        {userLoggedIn ? (
          <div className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите ваш комментарий..."
              className="comment-input"
              disabled={submitting}
            />
            <button
              onClick={handleSubmitComment}
              className="comment-submit"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? 'Отправка...' : 'Оставить комментарий'}
            </button>
          </div>
        ) : (
          <div className="login-prompt">
            <p>Войдите в систему, чтобы оставить комментарий</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OlympiadDetail;
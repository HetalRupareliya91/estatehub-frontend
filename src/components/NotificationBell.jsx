import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  async function loadCount() {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setCount(data.count);
    } catch {
      // silently ignore - bell just won't update this cycle
    }
  }

  async function loadRecent() {
    try {
      const { data } = await api.get('/notifications', { params: { unreadOnly: true } });
      setRecent(data.slice(0, 5));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!open) loadRecent();
    setOpen(!open);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="sidebar-logout"
        onClick={toggleOpen}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}
      >
        Notifications{count > 0 ? ` (${count})` : ''}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', width: 260, maxHeight: 300, overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 60,
          }}
        >
          {recent.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-soft)' }}>No unread notifications.</div>
          ) : (
            recent.map((n) => (
              <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--ink)' }}>
                <div style={{ fontWeight: 600 }}>{n.title}</div>
                {n.message && <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{n.message}</div>}
              </div>
            ))
          )}
          <button
            className="btn btn-secondary"
            style={{ width: '100%', borderRadius: 0, borderTop: 'none' }}
            onClick={() => { setOpen(false); navigate('/notifications'); }}
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}


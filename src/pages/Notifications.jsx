import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: unreadOnly ? { unreadOnly: true } : {} });
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [unreadOnly]);

  async function handleMarkRead(id) {
    await api.patch(`/notifications/${id}/read`);
    load();
  }

  async function handleMarkAllRead() {
    await api.patch('/notifications/read-all');
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/notifications/${id}`);
    load();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">Updates on your leads and listings.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleMarkAllRead}>Mark all as read</button>
      </div>

      <div className="toolbar">
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Unread only
        </label>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">No notifications.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Title</th><th>Message</th><th>When</th><th></th></tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} style={{ fontWeight: n.isRead ? 400 : 700 }}>
                  <td>{n.title}</td>
                  <td>{n.message}</td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {!n.isRead && (
                      <button className="btn btn-secondary" onClick={() => handleMarkRead(n.id)} style={{ marginRight: 8 }}>Mark read</button>
                    )}
                    <button className="btn btn-danger" onClick={() => handleDelete(n.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}


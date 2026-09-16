import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Agents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/agents');
        setAgents(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Remove this team member?')) return;
    await api.delete(`/agents/${id}`);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Agents</h1>
          <p className="page-subtitle">Everyone with access to the CRM.</p>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading agents…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                {user?.role === 'admin' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{agent.phone || '—'}</td>
                  <td><span className="badge badge-available">{agent.role}</span></td>
                  {user?.role === 'admin' && (
                    <td style={{ textAlign: 'right' }}>
                      {agent.id !== user.id && (
                        <button className="btn btn-danger" onClick={() => handleDelete(agent.id)}>Remove</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}


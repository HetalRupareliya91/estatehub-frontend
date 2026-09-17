import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Reports() {
  const [revenue, setRevenue] = useState([]);
  const [bySource, setBySource] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rev, src, conv, perf] = await Promise.all([
          api.get('/reports/revenue'),
          api.get('/reports/leads-by-source'),
          api.get('/reports/conversions'),
          api.get('/reports/agent-performance'),
        ]);
        setRevenue(rev.data);
        setBySource(src.data);
        setConversions(conv.data);
        setPerformance(perf.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Revenue, lead sources, and agent performance at a glance.</p>
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Listings value by status</h2>
      <div className="table-wrap" style={{ marginBottom: 32 }}>
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : (
          <table>
            <thead>
              <tr><th>Status</th><th>Listings</th><th>Total value</th></tr>
            </thead>
            <tbody>
              {revenue.map((row) => (
                <tr key={row.status}>
                  <td><span className={`badge badge-${row.status}`}>{row.status.replace('_', ' ')}</span></td>
                  <td>{row.count}</td>
                  <td>${Number(row.total || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Leads by source</h2>
      <div className="table-wrap" style={{ marginBottom: 32 }}>
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : (
          <table>
            <thead><tr><th>Source</th><th>Leads</th></tr></thead>
            <tbody>
              {bySource.map((row) => (
                <tr key={row.source}><td>{row.source}</td><td>{row.count}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Monthly conversions (won deals)</h2>
      <div className="table-wrap" style={{ marginBottom: 32 }}>
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : conversions.length === 0 ? (
          <div className="empty-state">No won deals yet.</div>
        ) : (
          <table>
            <thead><tr><th>Month</th><th>Deals won</th></tr></thead>
            <tbody>
              {conversions.map((row) => (
                <tr key={row.month}>
                  <td>{new Date(row.month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Agent performance</h2>
      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : (
          <table>
            <thead>
              <tr><th>Agent</th><th>Listings</th><th>Sold</th><th>Leads</th><th>Won</th></tr>
            </thead>
            <tbody>
              {performance.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.totalListings}</td>
                  <td>{row.listingsSold}</td>
                  <td>{row.totalLeads}</td>
                  <td>{row.leadsWon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}


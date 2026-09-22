import { useEffect, useState } from 'react';
import api from '../api/axios';
import PipelineChart from '../components/PipelineChart';

export default function Dashboard() {
  const [totalListings, setTotalListings] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Listings are paginated now, so we don't fetch the full list just
        // to count it — a 1-row request still returns the true total in meta.
        const [totalRes, activeRes, pipelineRes] = await Promise.all([
          api.get('/listings', { params: { limit: 1 } }),
          api.get('/listings', { params: { limit: 1, status: 'available' } }),
          api.get('/leads/pipeline'), // already an all-leads aggregate, unaffected by pagination
        ]);
        setTotalListings(totalRes.data.meta.total);
        setActiveListings(activeRes.data.meta.total);
        setPipeline(pipelineRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const wonEntry = pipeline.find((p) => p.stage === 'won');
  const wonCount = wonEntry ? Number(wonEntry.count) : 0;
  const openLeads = pipeline
    .filter((p) => !['won', 'lost'].includes(p.stage))
    .reduce((sum, p) => sum + Number(p.count), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">A snapshot of your pipeline and portfolio.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-value">{loading ? '—' : totalListings}</div>
          <div className="stat-label">Total listings</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{loading ? '—' : activeListings}</div>
          <div className="stat-label">Available now</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{loading ? '—' : openLeads}</div>
          <div className="stat-label">Open leads</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{loading ? '—' : wonCount}</div>
          <div className="stat-label">Deals won</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Pipeline by stage</h2>
      {loading ? (
        <p className="page-subtitle">Loading pipeline…</p>
      ) : (
        <div className="table-wrap" style={{ padding: 20 }}>
          <PipelineChart pipeline={pipeline} />
        </div>
      )}
    </>
  );
}

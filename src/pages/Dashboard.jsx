import { useEffect, useState } from 'react';
import api from '../api/axios';

const STAGE_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [listings, setListings] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [leadsRes, listingsRes, pipelineRes] = await Promise.all([
          api.get('/leads'),
          api.get('/listings'),
          api.get('/leads/pipeline'),
        ]);
        setLeads(leadsRes.data);
        setListings(listingsRes.data);
        setPipeline(pipelineRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeListings = listings.filter((l) => l.status === 'available').length;
  const openLeads = leads.filter((l) => !['won', 'lost'].includes(l.stage)).length;
  const wonLeads = leads.filter((l) => l.stage === 'won').length;

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
          <div className="stat-value">{loading ? '—' : listings.length}</div>
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
          <div className="stat-value">{loading ? '—' : wonLeads}</div>
          <div className="stat-label">Deals won</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Pipeline by stage</h2>
      <div className="stat-grid">
        {Object.keys(STAGE_LABELS).map((stage) => {
          const found = pipeline.find((p) => p.stage === stage);
          return (
            <div className="stat-tile" key={stage}>
              <div className="stat-value">{loading ? '—' : found?.count || 0}</div>
              <div className="stat-label">{STAGE_LABELS[stage]}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}


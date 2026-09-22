const STAGE_META = {
  new: { label: 'New', color: '#64748b' },
  contacted: { label: 'Contacted', color: '#0ea5e9' },
  qualified: { label: 'Qualified', color: '#6366f1' },
  negotiation: { label: 'Negotiation', color: '#f59e0b' },
  won: { label: 'Won', color: '#22c55e' },
  lost: { label: 'Lost', color: '#ef4444' },
};

const STAGE_ORDER = ['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'];

// Plain div bars, no charting library needed. `pipeline` is the array the
// backend already returns from GET /leads/pipeline: [{ stage, count }, ...].
export default function PipelineChart({ pipeline }) {
  const counts = STAGE_ORDER.map((stage) => {
    const found = pipeline.find((p) => p.stage === stage);
    return { stage, count: found ? Number(found.count) : 0 };
  });
  const max = Math.max(...counts.map((c) => c.count), 1); // avoid divide-by-zero when empty

  return (
    <div className="pipeline-chart" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {counts.map(({ stage, count }) => {
        const meta = STAGE_META[stage];
        const pct = Math.round((count / max) * 100);
        return (
          <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 100, fontSize: 13, color: '#475569' }}>{meta.label}</div>
            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 6, height: 18, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: meta.color,
                  height: '100%',
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ width: 28, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{count}</div>
          </div>
        );
      })}
    </div>
  );
}

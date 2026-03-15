import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSearch } from 'react-icons/fi';
import { getDirectors } from '../../services/otherServices';
import useApi from '../../hooks/useApi';
import { getFileUrl } from '../../utils/helpers';
import { Skeleton } from '../../components/common/Skeletons';

const DirectorsPage = () => {
  const [search, setSearch] = useState('');
  const { data: directors, loading } = useApi(getDirectors);
  const navigate = useNavigate();

  const filtered = directors?.filter((d) =>
    d.directorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Music Directors</h1>
          <p className="page-subtitle">
            {directors ? `${directors.length} directors available` : '…'}
          </p>
        </div>
      </div>

      <div className="fade-in fade-in-delay-1" style={{ position: 'relative', maxWidth: 360, marginBottom: 32 }}>
        <FiSearch size={15} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)'
        }} />
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search directors…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="entity-grid fade-in fade-in-delay-2">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} height={200} borderRadius={12} />
            ))
          : filtered?.length === 0
            ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-title">No directors found</div>
              </div>
            )
            : filtered?.map((director) => (
              <div
                key={director._id}
                className="entity-card"
                onClick={() => navigate(`/directors/${director._id}`)}
              >
                <div className="entity-photo">
                  {director.directorPhoto ? (
                    <img src={getFileUrl(director.directorPhoto)} alt={director.directorName} />
                  ) : (
                    <div className="entity-photo-placeholder">
                      <FiUser size={32} />
                    </div>
                  )}
                </div>
                <div className="entity-info">
                  <h3 className="entity-name">{director.directorName}</h3>
                  <span className="badge badge-blue">Director</span>
                </div>
              </div>
            ))
        }
      </div>

      <style>{`
        .entity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 24px;
        }
        .entity-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: all var(--transition-bounce);
        }
        .entity-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-visible);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .entity-photo {
          width: 100%;
          aspect-ratio: 1;
          background: var(--bg-overlay);
          position: relative;
        }
        .entity-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .entity-photo-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        .entity-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .entity-name {
          font-weight: 600;
          font-size: 16px;
          color: var(--text-primary);
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default DirectorsPage;

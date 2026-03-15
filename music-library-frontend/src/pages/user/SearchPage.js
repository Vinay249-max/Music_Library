import React, { useState, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import SongCard from '../../components/songs/SongCard';
import { SongCardSkeleton } from '../../components/common/Skeletons';
import AddToPlaylistModal from './AddToPlaylistModal';
import { getSongs } from '../../services/songService';
import { getPlaylists } from '../../services/playlistService';
import useApi from '../../hooks/useApi';

const SEARCH_TYPES = [
  { key: 'search',   label: 'Song Name'      },
  { key: 'artist',   label: 'Artist'         },
  { key: 'album',    label: 'Album'          },
  { key: 'director', label: 'Music Director' },
];

const SearchPage = () => {
  const [query,       setQuery]       = useState('');
  const [searchType,  setSearchType]  = useState('search');
  const [activeQuery, setActiveQuery] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const inputRef = useRef(null);

  const { data: songs, loading } = useApi(
    getSongs,
    activeQuery,
    [JSON.stringify(activeQuery)]
  );
  const { data: playlists } = useApi(getPlaylists);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveQuery({ [searchType]: query.trim() });
  };

  const hasSearched = activeQuery !== null;

  return (
    <div>
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-subtitle">Find songs by name, artist, album, or director</p>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="search-form fade-in fade-in-delay-1">
        <div className="search-type-tabs">
          {SEARCH_TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`search-tab ${searchType === key ? 'active' : ''}`}
              onClick={() => { setSearchType(key); inputRef.current?.focus(); }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="search-input-row">
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch
              size={18}
              style={{
                position: 'absolute', left: 16, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }}
            />
            <input
              ref={inputRef}
              className="form-input"
              style={{ paddingLeft: 46, height: 52, fontSize: 16 }}
              placeholder={`Search by ${SEARCH_TYPES.find(t => t.key === searchType)?.label}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ height: 52, flexShrink: 0 }}>
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {hasSearched && (
        <div style={{ marginTop: 36 }}>
          <div className="page-header fade-in">
            <div>
              <h2 className="page-title" style={{ fontSize: 28 }}>Results</h2>
              {!loading && songs && (
                <p className="page-subtitle">
                  {songs.length} {songs.length === 1 ? 'song' : 'songs'} found for&nbsp;
                  <em style={{ color: 'var(--accent-primary)' }}>"{Object.values(activeQuery)[0]}"</em>
                </p>
              )}
            </div>
          </div>

          <div className="songs-grid fade-in">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SongCardSkeleton key={i} />)
              : songs?.length === 0
                ? (
                  <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-title">No results</div>
                    <p className="empty-state-text">
                      No songs matched your search. Try a different keyword or search type.
                    </p>
                  </div>
                )
                : songs.map((song) => (
                  <SongCard
                    key={song._id}
                    song={song}
                    onAddToPlaylist={setSelectedSong}
                  />
                ))
            }
          </div>
        </div>
      )}

      {!hasSearched && (
        <div className="search-hint fade-in fade-in-delay-2">
          <div className="search-hint-icon">🎵</div>
          <p>Start typing and hit <strong>Search</strong> to discover music</p>
        </div>
      )}

      {selectedSong && (
        <AddToPlaylistModal
          song={selectedSong}
          playlists={playlists || []}
          onClose={() => setSelectedSong(null)}
        />
      )}

      <style>{`
        .search-form { display: flex; flex-direction: column; gap: 12px; }
        .search-type-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .search-tab {
          padding: 6px 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-visible);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .search-tab:hover { background: var(--bg-overlay); color: var(--text-primary); }
        .search-tab.active {
          background: var(--accent-primary);
          color: var(--text-inverse);
          border-color: var(--accent-primary);
        }
        .search-input-row { display: flex; gap: 10px; }
        .search-hint {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 80px 20px;
          color: var(--text-muted); font-size: 14px; text-align: center;
        }
        .search-hint-icon { font-size: 52px; opacity: 0.3; }
      `}</style>
    </div>
  );
};

export default SearchPage;

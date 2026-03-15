import React from 'react';

// Generic skeleton block
export const Skeleton = ({ width = '100%', height = 16, borderRadius = 6, style = {} }) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius, ...style }}
  />
);

// Song card skeleton
export const SongCardSkeleton = () => (
  <div className="card" style={{ padding: '12px' }}>
    <Skeleton height={140} borderRadius={8} style={{ marginBottom: 10 }} />
    <Skeleton height={14} width="80%" style={{ marginBottom: 6 }} />
    <Skeleton height={12} width="55%" />
  </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <Skeleton height={14} width={i === 0 ? '60%' : '80%'} />
      </td>
    ))}
  </tr>
);

// Playlist card skeleton
export const PlaylistCardSkeleton = () => (
  <div className="card" style={{ padding: '16px' }}>
    <Skeleton height={16} width="70%" style={{ marginBottom: 8 }} />
    <Skeleton height={12} width="40%" style={{ marginBottom: 16 }} />
    <Skeleton height={36} />
  </div>
);

export default Skeleton;

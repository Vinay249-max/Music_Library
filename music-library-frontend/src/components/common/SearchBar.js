import React, { useState, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ placeholder = 'Search…', onSearch, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(v), 400);
  };

  const clear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <FiSearch
        size={16}
        style={{
          position: 'absolute', left: 12,
          color: 'var(--text-muted)', pointerEvents: 'none',
        }}
      />
      <input
        className="form-input"
        style={{ paddingLeft: 38, paddingRight: value ? 36 : 14, width: '100%' }}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {value && (
        <button
          onClick={clear}
          style={{
            position: 'absolute', right: 8,
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

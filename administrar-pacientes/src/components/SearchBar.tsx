import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Buscar por Nombre, Apellido o CC..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #0284c7',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  }
};
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading system data...', fullPage = false }) {
  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
        }}
      >
        <Loader2
          size={36}
          style={{
            color: 'var(--primary)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        color: 'var(--text-secondary)',
        fontSize: '13.5px',
      }}
    >
      <Loader2
        size={20}
        style={{
          color: 'var(--primary)',
          animation: 'spin 1s linear infinite',
        }}
      />
      <span>{message}</span>
    </div>
  );
}

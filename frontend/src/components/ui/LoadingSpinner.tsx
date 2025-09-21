interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeStyles = {
  sm: { height: '1rem', width: '1rem' },
  md: { height: '1.5rem', width: '1.5rem' },
  lg: { height: '2rem', width: '2rem' },
  xl: { height: '3rem', width: '3rem' },
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
      <div
        style={{
          ...sizeStyles[size],
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          border: '2px solid #d1d5db',
          borderTopColor: '#2563eb',
        }}
        className={className}
      />
      {text && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', animation: 'pulse 2s infinite' }}>{text}</p>
      )}
    </div>
  );
}

// Inline spinner for buttons
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div
      style={{
        animation: 'spin 1s linear infinite',
        borderRadius: '50%',
        border: '2px solid white',
        borderTopColor: 'transparent',
        height: '1rem',
        width: '1rem',
      }}
      className={className}
    />
  );
}

// Page loading spinner
export function PageSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="xl" />
        <p style={{ marginTop: '1rem', fontSize: '1.125rem', color: '#6b7280' }}>Loading...</p>
      </div>
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.75rem', 
      boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e5e7eb',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }}></div>
        <div style={{ height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '50%', marginBottom: '1rem' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}></div>
          <div style={{ height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '83%' }}></div>
          <div style={{ height: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '67%' }}></div>
        </div>
      </div>
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ animation: 'pulse 2s infinite' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '25%' }}></div>
            <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '33%' }}></div>
            <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '17%' }}></div>
            <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '25%' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
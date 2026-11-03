export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'default',
  trend,
  onClick,
}) {
  let variantClass = '';
  if (variant === 'pending') variantClass = 'alert-pending';
  else if (variant === 'acknowledged') variantClass = 'alert-ack';
  else if (variant === 'resolved') variantClass = 'alert-resolved';

  return (
    <div
      className={`stat-card ${variantClass}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-wrap">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-card-value">{value ?? 0}</div>

      {(subtitle || trend) && (
        <div className="stat-card-subtitle">
          {trend && (
            <span
              style={{
                color: trend.startsWith('+') ? 'var(--danger)' : 'var(--success)',
                fontWeight: 600,
              }}
            >
              {trend}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}

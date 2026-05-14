import styles from './EmptyState.module.css';

/**
 * Centered empty state with icon, title, description, and optional action.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 */
export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <section className={styles.container} aria-labelledby="empty-state-title">
      <div className={styles.glow} aria-hidden="true" />

      {icon ? (
        <div className={styles.icon}>
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
      ) : null}

      <h3 id="empty-state-title" className={styles.title}>
        {title}
      </h3>

      {message ? <p className={styles.message}>{message}</p> : null}

      {actionLabel && onAction ? (
        <button type="button" className={styles.actionBtn} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
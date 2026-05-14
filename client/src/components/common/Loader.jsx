import styles from './Loader.module.css';

/**
 * Full-page overlay loader.
 * @param {object} props
 * @param {string} [props.text]
 */
export function FullPageLoader({ text = 'Loading...' }) {
  return (
    <div className={styles.fullPageOverlay} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.loaderCard}>
        <div className={styles.spinnerWrap}>
          <span className={styles.spinnerRing} />
          <span className={styles.spinnerDot} />
        </div>

        {text ? <p className={styles.text}>{text}</p> : null}
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder card / block.
 * @param {object} props
 * @param {number|string} [props.height='160px']
 * @param {number|string} [props.width='100%']
 * @param {boolean} [props.rounded=true]
 */
export function SkeletonCard({ height = '160px', width = '100%', rounded = true }) {
  return (
    <div
      className={`${styles.skeleton} ${rounded ? styles.rounded : ''}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton table with 5 rows of 5 cells each.
 */
export function SkeletonTable() {
  return (
    <div className={styles.table} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <div key={rowIdx} className={styles.tableRow}>
          {Array.from({ length: 5 }).map((_, cellIdx) => (
            <div key={cellIdx} className={`${styles.skeleton} ${styles.tableCell}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Tiny spinner for buttons.
 */
export function ButtonLoader() {
  return <span className={styles.buttonSpinner} aria-hidden="true" />;
}
import React from 'react';
import styles from './Card.module.css';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'compact' | 'normal' | 'spacious';
  hoverable?: boolean;
  clickable?: boolean;
  glass?: boolean;
}

export function Card({
  padding = 'normal',
  hoverable = false,
  clickable = false,
  glass = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        styles[padding],
        hoverable && styles.hoverable,
        clickable && styles.clickable,
        glass && styles.glass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(styles.header, className)}>
      <div>
        <h3 className={styles.headerTitle}>{title}</h3>
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx(styles.footer, className)}>{children}</div>;
}

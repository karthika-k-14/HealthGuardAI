import EmptyState from '../common/EmptyState';
import { TableLoader } from '../common/Skeleton';
import { cn } from '../../utils/cn';

import React from 'react';

/**
 * Generic table renderer driven entirely by a `columns` config, so
 * any page needing tabular data (role management, audit logs, users,
 * facilities, etc.) can reuse this instead of hand-rolling a <table>.
 *
 * columns: [{ key, header, render?(row) => ReactNode, align?: 'left'|'center'|'right' }]
 */
export default function DataTable({ columns, rows, isLoading, emptyIcon, emptyTitle = 'Nothing to show', emptyDescription, rowKey = 'id' }) {
  if (isLoading) {
    return <TableLoader columns={columns.length} />;
  }

  if (!rows || rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="surface-card overflow-x-auto p-0">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-5 py-3 font-medium',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-5 py-3 text-slate-700 dark:text-slate-200',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';
import { LoadingOutlined, InboxOutlined } from '@ant-design/icons';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  title: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: string | ((record: T) => string);
  onRowClick?: (record: T) => void;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyText = 'Không có dữ liệu',
  rowKey = 'id',
  onRowClick,
  className,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  const getValue = (record: T, key: string): unknown => {
    return key.split('.').reduce((obj: Record<string, unknown>, k: string) => 
      obj?.[k] as Record<string, unknown>, record as Record<string, unknown>);
  };

  if (loading) {
    return (
      <div className={clsx('table-container', className)}>
        <div className="flex items-center justify-center py-12">
          <LoadingOutlined className="text-4xl text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={clsx('table-container', className)}>
        <div className="empty-state">
          <InboxOutlined className="empty-state-icon" />
          <p className="empty-state-title">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('table-container', className)}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={clsx(
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr
              key={getRowKey(record, index)}
              onClick={() => onRowClick?.(record)}
              className={clsx(onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx(
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.render
                    ? col.render(getValue(record, col.key), record, index)
                    : (getValue(record, col.key) as React.ReactNode) ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;




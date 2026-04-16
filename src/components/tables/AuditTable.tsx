'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuditTable() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await fetch('/api/audit');
        const data = await response.json();
        setAuditLogs(data || []);
      } catch (error) {
        console.error('Failed to fetch audit logs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Audit Log</h2>
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">User</th>
            <th className="text-left py-2">Action</th>
            <th className="text-left py-2">Table</th>
            <th className="text-left py-2">Record ID</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No audit logs
              </td>
            </tr>
          ) : (
            auditLogs.map((log, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2">{log.createdAt}</td>
                <td className="py-2">{log.userId}</td>
                <td className="py-2">{log.action}</td>
                <td className="py-2">{log.tableName}</td>
                <td className="py-2">{log.recordId}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

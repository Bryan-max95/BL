import { query } from './db';

export interface AuditLog {
  user_id: number;
  action: string;
  entity: string;
  entity_id?: number;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}

export async function logAudit(data: AuditLog) {
  const result = await query(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.user_id,
      data.action,
      data.entity,
      data.entity_id || null,
      data.old_values ? JSON.stringify(data.old_values) : null,
      data.new_values ? JSON.stringify(data.new_values) : null,
      data.ip_address || null,
      data.user_agent || null
    ]
  );
  return result.rows[0];
}

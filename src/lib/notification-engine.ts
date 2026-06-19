import { readDb, writeDb, generateId } from '@/lib/db';

interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
  type: 'reminder' | 'warning' | 'info' | 'approval';
}

export function createNotification(userId: string, title: string, content: string, type: Notification['type'] = 'info'): Notification {
  const notifications = readDb<Notification>('notifications');
  const newNotification: Notification = {
    id: `n${generateId()}`,
    userId,
    title,
    content,
    readStatus: false,
    createdAt: new Date().toISOString(),
    type,
  };
  notifications.push(newNotification);
  writeDb('notifications', notifications);
  return newNotification;
}

export function createBulkNotifications(userIds: string[], title: string, content: string, type: Notification['type'] = 'info'): Notification[] {
  return userIds.map(userId => createNotification(userId, title, content, type));
}

export function checkDeadlineWarnings(): Notification[] {
  const today = new Date();
  const notifications: Notification[] = [];
  const planItems = readDb<{ id: string; planId: string; dueDate: string }>('plan-items');
  const plans = readDb<{ id: string; ownerId: string; status: string }>('plans');
  const users = readDb<{ id: string; fullName: string }>('users');

  planItems.forEach(item => {
    if (!item.dueDate) return;
    const due = new Date(item.dueDate);
    const daysUntil = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      const plan = plans.find(p => p.id === item.planId);
      if (plan) {
        const existing = readDb<Notification>('notifications');
        const alreadyNotified = existing.some(n =>
          n.userId === plan.ownerId &&
          n.title.includes('quá hạn') &&
          n.content.includes(item.id)
        );
        if (!alreadyNotified) {
          notifications.push(createNotification(
            plan.ownerId,
            `Cảnh báo: KPI ${item.id} đã quá hạn ${Math.abs(daysUntil)} ngày`,
            `KPI ${item.id} đã quá hạn thực hiện. Vui lòng cập nhật tiến độ.`,
            'warning'
          ));
        }
      }
    } else if (daysUntil <= 7 && daysUntil >= 0) {
      const plan = plans.find(p => p.id === item.planId);
      if (plan) {
        const existing = readDb<Notification>('notifications');
        const alreadyNotified = existing.some(n =>
          n.userId === plan.ownerId &&
          n.title.includes('sắp đến hạn') &&
          n.content.includes(item.id)
        );
        if (!alreadyNotified) {
          notifications.push(createNotification(
            plan.ownerId,
            `Nhắc nhở: KPI ${item.id} sắp đến hạn (còn ${daysUntil} ngày)`,
            `KPI ${item.id} sẽ hết hạn trong ${daysUntil} ngày. Vui lòng cập nhật tiến độ.`,
            'reminder'
          ));
        }
      }
    }
  });

  return notifications;
}

export function checkMissingEvidence(): Notification[] {
  const notifications: Notification[] = [];
  const planItems = readDb<{ id: string; planId: string }>('plan-items');
  const evidences = readDb<{ planItemIds: string[] }>('evidences');
  const plans = readDb<{ id: string; ownerId: string }>('plans');

  const evidencePlanItemIds = new Set(evidences.flatMap(e => e.planItemIds || []));

  planItems.forEach(item => {
    if (!evidencePlanItemIds.has(item.id)) {
      const plan = plans.find(p => p.id === item.planId);
      if (plan) {
        const existing = readDb<Notification>('notifications');
        const alreadyNotified = existing.some(n =>
          n.userId === plan.ownerId &&
          n.title.includes('thiếu minh chứng') &&
          n.content.includes(item.id)
        );
        if (!alreadyNotified) {
          notifications.push(createNotification(
            plan.ownerId,
            `Cảnh báo: KPI ${item.id} thiếu minh chứng`,
            `KPI ${item.id} chưa có minh chứng đính kèm. Vui lòng nộp minh chứng.`,
            'warning'
          ));
        }
      }
    }
  });

  return notifications;
}

export function runAllChecks(): { deadlineWarnings: number; missingEvidence: number } {
  const deadlineWarnings = checkDeadlineWarnings().length;
  const missingEvidence = checkMissingEvidence().length;
  return { deadlineWarnings, missingEvidence };
}

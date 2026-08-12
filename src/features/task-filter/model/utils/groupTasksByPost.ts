import type { Task } from '@/entities';

const getPostGroupKey = (task: Task): string => {
  if (task.postId) return task.postId;

  const title = task.post?.title?.trim();
  if (title) return `title:${title}`;

  return `task:${task.id}`;
};

/** Одна «титульная» задача на объявление — с самым свежим updatedAt. */
export const pickRepresentativeTasksByPost = (tasks: Task[]): Task[] => {
  const winners = new Map<string, Task>();

  for (const task of tasks) {
    const key = getPostGroupKey(task);
    const existing = winners.get(key);

    if (
      !existing ||
      new Date(task.updatedAt).getTime() > new Date(existing.updatedAt).getTime()
    ) {
      winners.set(key, task);
    }
  }

  const seen = new Set<string>();
  const result: Task[] = [];

  for (const task of tasks) {
    const key = getPostGroupKey(task);
    const winner = winners.get(key);

    if (!winner || winner.id !== task.id || seen.has(key)) continue;

    seen.add(key);
    result.push(winner);
  }

  return result;
};

export const countTasksByPostId = (tasks: Task[]): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    if (!task.postId) continue;
    counts.set(task.postId, (counts.get(task.postId) ?? 0) + 1);
  }

  return counts;
};

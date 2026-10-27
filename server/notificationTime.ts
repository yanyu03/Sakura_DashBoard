export function notificationTime(user: Record<string, any>, now = new Date()) {
  if (!user.dnd_enabled) return now.toISOString();
  const shifted = new Date(now.getTime() + 8 * 3600000),
    minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    start = String(user.dnd_start_time || "18:00")
      .split(":")
      .map(Number),
    threshold = start[0] * 60 + start[1];
  if (minutes >= threshold || minutes < 480) {
    if (minutes >= threshold) shifted.setUTCDate(shifted.getUTCDate() + 1);
    shifted.setUTCHours(8, 0, 0, 0);
    return new Date(shifted.getTime() - 8 * 3600000).toISOString();
  }
  return now.toISOString();
}

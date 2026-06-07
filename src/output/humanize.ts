export function humanMB(mb: number): string {
  if (mb < 1024) {
    return `${mb} MB`;
  }
  return `${(mb / 1024).toFixed(1)} GB`;
}

export function humanSeconds(s: number): string {
  if (s < 60) {
    return '< 1m';
  }
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) { parts.push(`${days}d`); }
  if (hours > 0) { parts.push(`${hours}h`); }
  if (minutes > 0) { parts.push(`${minutes}m`); }
  return parts.join(' ');
}

export function humanBytes(b: number): string {
  const gb = b / (1024 ** 3);
  if (gb >= 1024) {
    return `${(gb / 1024).toFixed(1)} TB`;
  }
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  }
  return `${Math.round(b / (1024 ** 2))} MB`;
}

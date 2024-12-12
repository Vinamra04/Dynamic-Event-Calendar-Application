export const adjustColor = (color, amount) => {
  const hex = color.replace('#', '');
  const r = Math.max(Math.min(parseInt(hex.slice(0, 2), 16) + amount, 255), 0);
  const g = Math.max(Math.min(parseInt(hex.slice(2, 4), 16) + amount, 255), 0);
  const b = Math.max(Math.min(parseInt(hex.slice(4, 6), 16) + amount, 255), 0);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}; 
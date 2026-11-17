export function filterMediaItems(items, filters) {
  const query = String(filters.query || '').trim().toLocaleLowerCase();
  const from = filters.fromDate || '';
  const to = filters.toDate || '';

  return items.filter((item) => {
    const searchableText = [item.title, item.description, item.team, item.sport, item.opponent]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
    if (query && !searchableText.includes(query)) return false;

    if (from || to) {
      const value = item.publishedAtRaw || item.date || item.publishedAt;
      const date = value ? new Date(value) : null;
      if (!date || Number.isNaN(date.getTime())) return false;
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit',
      }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
      const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
      if (from && dateKey < from) return false;
      if (to && dateKey > to) return false;
    }
    return true;
  });
}

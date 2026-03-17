export const TYPE_META = {
  feature: {
    label: 'Feature',
    line: 'bg-[#E2231A]',
    pill: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  improvement: {
    label: 'Melhoria',
    line: 'bg-emerald-500',
    pill: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  fix: {
    label: 'Correcao',
    line: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  security: {
    label: 'Seguranca',
    line: 'bg-red-600',
    pill: 'bg-red-600/10 text-red-600 border-red-600/20',
  },
};

export function formatNewsDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getArchiveNewsItems(newsItems) {
  return [...(newsItems || [])].sort((left, right) => {
    const leftTime = new Date(`${left?.date || ''}T12:00:00`).getTime();
    const rightTime = new Date(`${right?.date || ''}T12:00:00`).getTime();
    return rightTime - leftTime;
  });
}

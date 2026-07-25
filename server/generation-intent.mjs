function safeKind(value, fallback = 'object') {
  return typeof value === 'string' && value ? value : fallback;
}

export function inferPreferredKind(prompt, fallback = 'object') {
  const text = typeof prompt === 'string' ? prompt.toLowerCase() : '';

  if (
    /\b(component|html|css|javascript|js|vue|react|button|form|counter|widget|calculator|input|modal|simulate|simulation|simulator)\b/.test(
      text,
    )
  ) {
    return 'component';
  }

  if (/\b(video|animation|animated|clip|movie|trailer|gif)\b/.test(text)) {
    return 'video';
  }

  if (/\b(image|photo|picture|illustration|poster|logo|icon|draw|drawing|visual)\b/.test(text)) {
    return 'image';
  }

  if (/\b(write|text|story|poem|essay|article|copy|headline|markdown|explain|summary)\b/.test(text)) {
    return 'text';
  }

  if (
    /\b(map|atlas|explorer|builder|planner|timeline)\b/.test(text) ||
    /\binteractive\s+(?:experience|scene|world|diagram|map|atlas|explorer|builder|planner|timeline)\b/.test(
      text,
    )
  ) {
    return 'component';
  }

  const normalizedFallback = safeKind(fallback);
  return ['text', 'object', 'image', 'video', 'component'].includes(normalizedFallback)
    ? normalizedFallback
    : 'object';
}

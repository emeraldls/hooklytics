export const getEnvMeta = () => ({
  language: navigator.language,
  page_title: document.title,
  pathname: window.location.pathname,
  querystring: window.location.search,
  referrer: document.referrer,
  screen_height: window.innerHeight,
  screen_width: window.innerWidth,
  user_agent: navigator.userAgent,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  url: window.location.href,
});

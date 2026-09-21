export const AppPaths = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  notFound: '/not-found',
  scan: (token: string): string => `/t/${encodeURIComponent(token)}`,
  activate: (token: string): string => `/t/${encodeURIComponent(token)}/activate`,
  passport: (token: string): string => `/t/${encodeURIComponent(token)}/passport`,
  verify: (token: string): string => `/t/${encodeURIComponent(token)}/verify`,
} as const;

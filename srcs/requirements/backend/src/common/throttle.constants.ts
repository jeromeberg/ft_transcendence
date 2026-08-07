const isProd = process.env.NODE_ENV === 'production';

export const THROTTLE_LIMIT_AUTH_GLOBAL = { ttl: 60000, limit: isProd ? 1000 : 99999 };
export const THROTTLE_LIMIT_AUTH = { ttl: 60000, limit: isProd ? 10 : 99999 };
export const THROTTLE_LIMIT_UP_AVATAR = { ttl: 60000, limit: isProd ? 5 : 99999 };
export const THROTTLE_LIMIT_SETTINGS = { ttl: 60000, limit: isProd ? 20 : 99999 };

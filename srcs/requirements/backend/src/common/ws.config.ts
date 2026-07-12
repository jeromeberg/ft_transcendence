export const WS_CORS = {
    origin: [process.env.DOMAIN ? `https://${process.env.DOMAIN}` : '', 'http://localhost:5173'],
    credentials: true,
};

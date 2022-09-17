import cors from 'cors';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors());
app.use(
  '/api/',
  createProxyMiddleware({
    target: 'https://ttm.lafin.me',
    changeOrigin: true,
    secure: false,
  }),
);
app.listen(3001);

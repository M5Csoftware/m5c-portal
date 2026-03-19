// middleware.js
import { NextResponse } from 'next/server';

// In-memory store for rate limiting (Reset on server restart)
const rateLimitStore = new Map();

// Configuration
const CONFIG = {
  GLOBAL: { limit: 100, window: 60 * 1000 }, // 100 req per minute
  AUTH: { limit: 5, window: 5 * 60 * 1000 },    // 5 attempts per 5 minutes
};

function getRateLimit(ip, type = 'GLOBAL') {
  const now = Date.now();
  const key = `${ip}:${type}`;
  const config = CONFIG[type];
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.window });
    return { success: true, remaining: config.limit - 1, reset: config.window };
  }

  const data = rateLimitStore.get(key);

  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + config.window;
    return { success: true, remaining: config.limit - 1, reset: config.window };
  }

  if (data.count >= config.limit) {
    return { success: false, remaining: 0, reset: data.resetTime - now };
  }

  data.count += 1;
  return { success: true, remaining: config.limit - data.count, reset: data.resetTime - now };
}

// Cleanup store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function middleware(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Protect NextAuth endpoints
  if (path.startsWith('/api/auth')) {
    const limitCheck = getRateLimit(ip, 'AUTH');

    if (!limitCheck.success) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Too many login attempts. Please try again in 5 minutes.',
          retryAfter: Math.ceil(limitCheck.reset / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(limitCheck.reset / 1000).toString()
          } 
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', CONFIG.AUTH.limit.toString());
    response.headers.set('X-RateLimit-Remaining', limitCheck.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(limitCheck.reset / 1000).toString());
    
    // Set a cookie so the client-side can read the remaining attempts (since NextAuth hides headers)
    response.cookies.set('ratelimit_remaining', limitCheck.remaining.toString(), { maxAge: 300 });
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/auth/:path*',
};

import { UAParser } from 'ua-parser-js';

export function getClientInfo(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.ip || '127.0.0.1');
  const userAgentStr = req.headers.get('user-agent') || '';
  const parser = new UAParser(userAgentStr);
  const result = parser.getResult();
  
  return {
    ip,
    userAgent: userAgentStr,
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
  };
}

const sharp = require('sharp');
const path = require('path');
const assetsDir = path.join(__dirname, '..', '..', 'OldTime', 'assets');

async function generate() {
  // 主图标 - 沙漏符号（代表时光/回忆）+ 高端质感
  const svgIcon = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1A0E08"/>
        <stop offset="40%" stop-color="#3D1A00"/>
        <stop offset="100%" stop-color="#0D0705"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F5E6A3"/>
        <stop offset="25%" stop-color="#D4AF37"/>
        <stop offset="50%" stop-color="#C9981E"/>
        <stop offset="75%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#F5E6A3"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <!-- 深色背景 -->
    <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
    <!-- 内框 -->
    <rect x="36" y="36" width="952" height="952" rx="195" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.25"/>
    <!-- 沙漏图标 -->
    <g transform="translate(512,480)" filter="url(#glow)">
      <!-- 顶部 -->
      <path d="M-140,-180 L140,-180 L60,-40 L-60,-40 Z" fill="none" stroke="url(#gold)" stroke-width="6" stroke-linejoin="round"/>
      <!-- 底部 -->
      <path d="M-140,180 L140,180 L60,40 L-60,40 Z" fill="none" stroke="url(#gold)" stroke-width="6" stroke-linejoin="round"/>
      <!-- 中间连接 -->
      <line x1="-60" y1="-40" x2="60" y2="-40" stroke="url(#gold)" stroke-width="4"/>
      <line x1="-60" y1="40" x2="60" y2="40" stroke="url(#gold)" stroke-width="4"/>
      <!-- 沙子 -->
      <path d="M-40,-30 Q0,-10 40,-30 Q20,0 0,10 Q-20,0 -40,-30" fill="url(#gold)" opacity="0.4"/>
      <path d="M-30,50 Q0,30 30,50 Q15,60 0,65 Q-15,60 -30,50" fill="url(#gold)" opacity="0.3"/>
      <!-- 顶部装饰 -->
      <line x1="-140" y1="-185" x2="140" y2="-185" stroke="url(#gold)" stroke-width="3"/>
      <line x1="-140" y1="185" x2="140" y2="185" stroke="url(#gold)" stroke-width="3"/>
    </g>
    <!-- 底部文字 -->
    <text x="512" y="770" text-anchor="middle" font-family="serif" font-size="72" fill="url(#gold)" opacity="0.5" letter-spacing="24">OldTime</text>
  </svg>`;

  await sharp(Buffer.from(svgIcon)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'icon.png'));
  console.log('icon.png done');

  // 前景 - 沙漏符号
  const svgFg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F5E6A3"/>
        <stop offset="25%" stop-color="#D4AF37"/>
        <stop offset="50%" stop-color="#C9981E"/>
        <stop offset="75%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#F5E6A3"/>
      </linearGradient>
    </defs>
    <g transform="translate(512,512)">
      <path d="M-140,-180 L140,-180 L60,-40 L-60,-40 Z" fill="none" stroke="url(#gold)" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-140,180 L140,180 L60,40 L-60,40 Z" fill="none" stroke="url(#gold)" stroke-width="6" stroke-linejoin="round"/>
      <line x1="-60" y1="-40" x2="60" y2="-40" stroke="url(#gold)" stroke-width="4"/>
      <line x1="-60" y1="40" x2="60" y2="40" stroke="url(#gold)" stroke-width="4"/>
      <path d="M-40,-30 Q0,-10 40,-30 Q20,0 0,10 Q-20,0 -40,-30" fill="url(#gold)" opacity="0.4"/>
      <path d="M-30,50 Q0,30 30,50 Q15,60 0,65 Q-15,60 -30,50" fill="url(#gold)" opacity="0.3"/>
      <line x1="-140" y1="-185" x2="140" y2="-185" stroke="url(#gold)" stroke-width="3"/>
      <line x1="-140" y1="185" x2="140" y2="185" stroke="url(#gold)" stroke-width="3"/>
    </g>
  </svg>`;
  await sharp(Buffer.from(svgFg)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('foreground done');

  // 背景
  const svgBg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1A0E08"/>
        <stop offset="40%" stop-color="#3D1A00"/>
        <stop offset="100%" stop-color="#0D0705"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)"/>
  </svg>`;
  await sharp(Buffer.from(svgBg)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-background.png'));
  console.log('background done');

  // 单色
  const svgMono = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(512,512)">
      <path d="M-140,-180 L140,-180 L60,-40 L-60,-40 Z" fill="none" stroke="#000" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-140,180 L140,180 L60,40 L-60,40 Z" fill="none" stroke="#000" stroke-width="6" stroke-linejoin="round"/>
      <line x1="-60" y1="-40" x2="60" y2="-40" stroke="#000" stroke-width="4"/>
      <line x1="-60" y1="40" x2="60" y2="40" stroke="#000" stroke-width="4"/>
      <line x1="-140" y1="-185" x2="140" y2="-185" stroke="#000" stroke-width="3"/>
      <line x1="-140" y1="185" x2="140" y2="185" stroke="#000" stroke-width="3"/>
    </g>
  </svg>`;
  await sharp(Buffer.from(svgMono)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  console.log('monochrome done');

  // favicon
  await sharp(Buffer.from(svgIcon)).resize(48, 48).png().toFile(path.join(assetsDir, 'favicon.png'));
  console.log('favicon done');

  // splash
  const svgSplash = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F5E6A3"/>
        <stop offset="25%" stop-color="#D4AF37"/>
        <stop offset="50%" stop-color="#C9981E"/>
        <stop offset="75%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#F5E6A3"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="#F8F5EE"/>
    <g transform="translate(512,420)">
      <path d="M-120,-160 L120,-160 L50,-30 L-50,-30 Z" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linejoin="round"/>
      <path d="M-120,160 L120,160 L50,30 L-50,30 Z" fill="none" stroke="url(#gold)" stroke-width="5" stroke-linejoin="round"/>
      <line x1="-50" y1="-30" x2="50" y2="-30" stroke="url(#gold)" stroke-width="3"/>
      <line x1="-50" y1="30" x2="50" y2="30" stroke="url(#gold)" stroke-width="3"/>
      <line x1="-120" y1="-165" x2="120" y2="-165" stroke="url(#gold)" stroke-width="2.5"/>
      <line x1="-120" y1="165" x2="120" y2="165" stroke="url(#gold)" stroke-width="2.5"/>
    </g>
    <text x="512" y="680" text-anchor="middle" font-family="serif" font-size="48" fill="#999999" letter-spacing="16">旧时光 · 新珍藏</text>
  </svg>`;
  await sharp(Buffer.from(svgSplash)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('splash done');

  console.log('All premium symbol icons generated!');
}

generate().catch(console.error);

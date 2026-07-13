#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple PNG generator for the favicon
// This creates a 48x48 PNG with the ascent diamond logo

const width = 48;
const height = 48;

// PNG file signature
const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

// Simple approach: create a minimal PNG with canvas fallback
try {
  // Try with canvas if available
  const canvas = require('canvas');
  const cvs = canvas.createCanvas(width, height);
  const ctx = cvs.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, width, height);

  // Red color
  const red = '#d41f2e';

  // Draw outer diamond
  ctx.strokeStyle = red;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(24, 2);
  ctx.lineTo(46, 24);
  ctx.lineTo(24, 46);
  ctx.lineTo(2, 24);
  ctx.closePath();
  ctx.stroke();

  // Draw inner diamond
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 8);
  ctx.lineTo(40, 24);
  ctx.lineTo(24, 40);
  ctx.lineTo(8, 24);
  ctx.closePath();
  ctx.stroke();

  // Draw center cross
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(24, 14);
  ctx.lineTo(24, 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, 24);
  ctx.lineTo(34, 24);
  ctx.stroke();

  // Draw corner ornaments
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.arc(24, 8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(40, 24, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(24, 40, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, 24, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Save PNG
  const buffer = cvs.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../assets/favicon.png'), buffer);
  console.log('✓ Favicon generated successfully at assets/favicon.png');
} catch (e) {
  console.error('Canvas not available. Please convert ascent-favicon.svg to PNG manually.');
  console.error('You can use: https://cloudconvert.com/svg-to-png or any online SVG to PNG converter');
  console.error('Target: 48x48 PNG saved as assets/favicon.png');
}

// utils/qrScan.js
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const fs = require('fs');

async function scanQRCodeFromImage(imagePath) {
  const image = await Jimp.read(fs.readFileSync(imagePath));

  return new Promise((resolve, reject) => {
    const qr = new QrCode();
    qr.callback = (err, value) => {
      if (err) return reject(err);
      resolve(value?.result ?? null);
    };
    qr.decode(image.bitmap);
  });
}

module.exports = {
  scanQRCodeFromImage,
};

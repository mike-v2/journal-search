const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../public/images/images_interesting');
let imagePaths = [];

const readImages = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      readImages(fullPath);
    } else if (/\.(jpg|jpeg|png|gif)$/.test(file)) {
      const path = fullPath.replace(__dirname, '').split('public')[1];
      imagePaths.push(path);
    }
  });
};

readImages(directoryPath);

fs.writeFileSync('imagePaths.json', JSON.stringify(imagePaths));

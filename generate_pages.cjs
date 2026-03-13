const fs = require('fs');
const path = require('path');

const stickersContent = fs.readFileSync(path.join(__dirname, 'src/pages/Stickers.tsx'), 'utf8');

const pages = [
  { 
    name: 'Labels', 
    title: 'Custom labels', 
    lower: 'custom labels', 
    single: 'label',
    types: [
      { name: 'Roll labels', image: 'https://picsum.photos/seed/roll/200/200' },
      { name: 'Sheet labels', image: 'https://picsum.photos/seed/sheet/200/200' },
      { name: 'Die cut labels', image: 'https://picsum.photos/seed/diecutl/200/200' },
      { name: 'Circle labels', image: 'https://picsum.photos/seed/circlel/200/200' },
      { name: 'Rectangle labels', image: 'https://picsum.photos/seed/rectl/200/200' },
      { name: 'Square labels', image: 'https://picsum.photos/seed/squarel/200/200' },
      { name: 'Oval labels', image: 'https://picsum.photos/seed/ovall/200/200' },
      { name: 'Clear labels', image: 'https://picsum.photos/seed/clearl/200/200' },
    ]
  },
  { 
    name: 'Magnets', 
    title: 'Custom magnets', 
    lower: 'custom magnets', 
    single: 'magnet',
    types: [
      { name: 'Car magnets', image: 'https://picsum.photos/seed/carmag/200/200' },
      { name: 'Refrigerator magnets', image: 'https://picsum.photos/seed/refmag/200/200' },
      { name: 'Die cut magnets', image: 'https://picsum.photos/seed/diecutmag/200/200' },
      { name: 'Circle magnets', image: 'https://picsum.photos/seed/circlemag/200/200' },
      { name: 'Rectangle magnets', image: 'https://picsum.photos/seed/rectmag/200/200' },
      { name: 'Square magnets', image: 'https://picsum.photos/seed/squaremag/200/200' },
      { name: 'Oval magnets', image: 'https://picsum.photos/seed/ovalmag/200/200' },
    ]
  },
  { 
    name: 'Buttons', 
    title: 'Custom buttons', 
    lower: 'custom buttons', 
    single: 'button',
    types: [
      { name: 'Round buttons', image: 'https://picsum.photos/seed/roundbtn/200/200' },
      { name: 'Square buttons', image: 'https://picsum.photos/seed/squarebtn/200/200' },
      { name: 'Oval buttons', image: 'https://picsum.photos/seed/ovalbtn/200/200' },
      { name: 'Rectangle buttons', image: 'https://picsum.photos/seed/rectbtn/200/200' },
    ]
  },
  { 
    name: 'Packaging', 
    title: 'Custom packaging', 
    lower: 'custom packaging', 
    single: 'packaging',
    types: [
      { name: 'Poly mailers', image: 'https://picsum.photos/seed/poly/200/200' },
      { name: 'Bubble mailers', image: 'https://picsum.photos/seed/bubble/200/200' },
      { name: 'Custom tape', image: 'https://picsum.photos/seed/tape/200/200' },
      { name: 'Mailer boxes', image: 'https://picsum.photos/seed/box/200/200' },
    ]
  },
  { 
    name: 'Apparel', 
    title: 'Custom apparel', 
    lower: 'custom apparel', 
    single: 'apparel',
    types: [
      { name: 'T-shirts', image: 'https://picsum.photos/seed/tshirt/200/200' },
      { name: 'Hoodies', image: 'https://picsum.photos/seed/hoodie/200/200' },
      { name: 'Sweatshirts', image: 'https://picsum.photos/seed/sweat/200/200' },
      { name: 'Canvas bags', image: 'https://picsum.photos/seed/bag/200/200' },
    ]
  },
  { 
    name: 'Acrylics', 
    title: 'Custom acrylics', 
    lower: 'custom acrylics', 
    single: 'acrylic',
    types: [
      { name: 'Acrylic charms', image: 'https://picsum.photos/seed/charm/200/200' },
      { name: 'Acrylic keychains', image: 'https://picsum.photos/seed/keychain/200/200' },
      { name: 'Acrylic pins', image: 'https://picsum.photos/seed/pin/200/200' },
      { name: 'Acrylic stands', image: 'https://picsum.photos/seed/stand/200/200' },
    ]
  },
  { 
    name: 'MoreProducts', 
    title: 'More products', 
    lower: 'more products', 
    single: 'product',
    types: [
      { name: 'Custom coasters', image: 'https://picsum.photos/seed/coaster/200/200' },
      { name: 'Custom puzzles', image: 'https://picsum.photos/seed/puzzle/200/200' },
      { name: 'Custom mousepads', image: 'https://picsum.photos/seed/mousepad/200/200' },
      { name: 'Custom wall graphics', image: 'https://picsum.photos/seed/wall/200/200' },
    ]
  }
];

pages.forEach(page => {
  let content = stickersContent;
  
  // Replace component name
  content = content.replace(/export default function Stickers\(\)/g, `export default function ${page.name}()`);
  
  // Replace titles and texts
  content = content.replace(/Custom stickers/g, page.title);
  content = content.replace(/custom stickers/g, page.lower);
  content = content.replace(/Sticker Mule/g, 'Our Store');
  
  // Replace stickerTypes with specific types
  const typesString = JSON.stringify(page.types, null, 2);
  content = content.replace(/const stickerTypes = \[[\s\S]*?\];/g, `const productTypes = ${typesString};`);
  content = content.replace(/stickerTypes\.map/g, `productTypes.map`);
  
  // Replace "stickers" in reviews and FAQs where appropriate
  content = content.replace(/Reviews for custom stickers/g, `Reviews for ${page.lower}`);
  content = content.replace(/Related to custom stickers/g, `Related to ${page.lower}`);
  
  fs.writeFileSync(path.join(__dirname, `src/pages/${page.name}.tsx`), content);
  console.log(`Created ${page.name}.tsx`);
});

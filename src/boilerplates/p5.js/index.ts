import index from './index.html?raw';
import main from './main.js?raw';
import style from './style.css?inline';

export default {
  title: 'p5.js',
  homepage: 'https://p5js.org/',
  icon: 'p5',
  packages: [
    {
      name: 'p5',
      version: '1.4.1'
    }
  ],
  files: [
    {
      name: 'main',
      value: main,
      active: !0,
      extension: '.js'
    },
    {
      name: 'index',
      value: index,
      active: !1,
      extension: '.html'
    },
    {
      name: 'style',
      value: style,
      active: !1,
      extension: '.css'
    }
  ]
};

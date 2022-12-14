import { defineTemplate } from '..';
import main from './main.js?raw';
import style from './style.css?inline';

export default defineTemplate({
  title: 'PixiJS',
  homepage: 'https://pixijs.com/',
  icon: 'pixi',
  packages: [
    {
      name: 'pixi.js',
      version: '7.0.4'
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
      name: 'style',
      value: style,
      active: !1,
      extension: '.css'
    },
    {
      name: 'santa',
      value:
        'https://hsto.org/files/447/9b4/6d3/4479b46d397e439a9613ce122a66a506.png',
      active: !1,
      hidden: !0,
      extension: '.png'
    }
    // {
    //   name: 'package',
    //   value: '{\n  "dependencies": {\n    "pixi.js": "6.3.0"\n  }\n}',
    //   active: !1,
    //   hidden: !0,
    //   extension: '.json'
    // }
  ]
});

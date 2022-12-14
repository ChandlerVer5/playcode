//  from playcode.io

import type { Package } from '~/utils/pkg';
import type { Settings } from '~/configs/settings';

// deno
import deno from './deno';

// POPULAR TEMPLATES
import javascript from './javascript';
import svelte from './svelte';
import solidjs from './solidjs';
import nanojsx from './nano-jsx';
// TODO add more frameworks, save to tencent cloud
// https://github.com/jorgebucaran/hyperapp
// https://github.com/preactjs/preact

// JAVASCRIPT LIBRARIES
import rxjs from './rxjs';

// VUE
import angular from './angular';

// VUE
import vue from './vue';
import vue_vueuse from './vue_vueuse';
import vue_element_plus from './vue_element_plus';

// REACT
import react from './react';
import react_mui from './react_mui';
import react_mobx from './react_mobx';
import react_ts_hooks from './react_ts_hooks';
import react_ts_classes from './react_ts_classes';
import react_redux_toolkit from './react_redux_toolkit';

// CSS FRAMEWORKS
import bulma from './bulma';
import tailwindcss from './tailwindcss';

// GRAPHICS
import canvas from './canvas';
import p5 from './p5.js';
import pixi from './pixi.js';
import threejs from './threejs';

// OTHER LANGUAGE
import rust from './rust';

// NODE
import node from './node';
import remix from './remix';
import adonis from './adonisjs';
import nestjs from './nestjs';
import nextjs from './nextjs';
import nuxtjs from './nuxtjs';

// ===========================================

export type KeyList = keyof typeof templateList;

interface Template {
  title: string;
  homepage: string;
  icon: string;
  packages: Array<Package> | [];
  files: {
    name: string; // 文件名
    value: string; // 内容
    extension: string; // 扩展名
    active: boolean; // 默认打开
    hidden?: boolean; // 隐藏文件
  }[];
  configs?: Settings;
}

export function defineTemplate(template: Template) {
  return template;
}

export const templateList: Record<string, Template> = {
  node,
  deno,
  rust,
  javascript,
  nanojsx,
  svelte,
  solidjs,
  bulma,
  canvas,
  lodash: {
    title: 'Lodash',
    homepage: '',
    icon: 'lodash',
    configs: { preview: false },
    packages: [
      {
        name: 'lodash',
        version: '4.17.21'
      }
    ],
    files: [
      {
        name: 'main',
        value:
          "import _ from 'lodash'\n    \nconst message = _.capitalize('hello world')\n\nconsole.log(message)",
        active: !0,
        extension: '.js'
      }
    ]
  },
  react,
  react_mui,
  react_mobx,
  react_redux_toolkit,
  react_ts_classes,
  react_ts_hooks,
  vue,
  vue_vueuse,
  vue_element_plus,
  angular,
  rxjs,
  p5,
  pixi,
  tailwindcss,
  threejs,
  adonis,
  nestjs,
  nextjs,
  nuxtjs,
  remix,
  pug: {
    title: 'pug',
    icon: 'pug',
    packages: [{ name: '', version: '1' }],
    files: [
      {
        name: 'App',
        value: '',
        active: !0,
        extension: '.pug'
      }
    ]
  },
  pwa: {
    title: 'pwa',
    icon: 'pwa',
    packages: [{ name: '', version: '1' }],
    files: [
      {
        name: 'App',
        value: '',
        active: !0,
        extension: '.js'
      }
    ]
  }
};

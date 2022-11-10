(() => {
  window.__modules__ = {};
  window.__export__ = (mod, key, get) => {
    Object.defineProperty(mod, key, {
      enumerable: true,
      configurable: true,
      get
    });
  };
  window.__dynamic_import__ = (key) => {
    return Promise.resolve(window.__modules__[key]);
  };

  window.__update__ = (type, name, content) => {
    if (type === 'script') {
      document.getElementsByTagName(type)[name]?.remove();
      const scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'module');
      scriptEl.setAttribute('id', name);
      scriptEl.innerHTML = `${content}`;
      document.head.appendChild(scriptEl);
    } else {
      document.getElementsByTagName(type)[name].innerHTML = content;
    }
  };
  window.__updateStyles = (key, content) => {
    document.getElementById(key).innerHTML = content;
  };

  async function handle_message(ev) {
    const { action, cmd_id } = ev.data;
    const send_message = (payload) =>
      parent.postMessage({ ...payload }, ev.origin);
    const send_reply = (payload) => send_message({ ...payload, cmd_id });
    const send_ok = () => send_reply({ action: 'cmd_ok' });
    const send_error = (message, stack) =>
      send_reply({ action: 'cmd_error', message, stack });

    if (action === 'eval') {
      try {
        document.getElementById(':update:')?.remove();
        let { script: scripts } = ev.data.args;
        if (typeof scripts === 'string') scripts = [scripts];
        for (const scriptStr of scripts) {
          const [id, ...script] = scriptStr.split(':_:');
          const scriptEl = document.createElement('script');
          scriptEl.setAttribute('type', 'module');
          scriptEl.setAttribute('id', ':update:');
          script.length > 0 && scriptEl.setAttribute('id', id);
          // send ok in the module script to ensure sequential evaluation
          // of multiple proxy.eval() calls
          const done = new Promise((resolve) => {
            window.__next__ = resolve;
          });
          scriptEl.innerHTML = `${script.join('') || id}\nwindow.__next__();`;
          document.head.appendChild(scriptEl);
          scriptEl.onerror = (err) => send_error(err.message, err.stack);
          await done;
        }
        // window.__next__ = undefined
        send_ok();
      } catch (e) {
        send_error(e.message, e.stack);
      }
    }

    if (action === 'catch_clicks') {
      try {
        const top_origin = ev.origin;
        document.body.addEventListener('click', (event) => {
          if (event.which !== 1) return;
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          if (event.defaultPrevented) return;

          // ensure target is a link
          let el = event.target;
          while (el && el.nodeName !== 'A') el = el.parentNode;
          if (!el || el.nodeName !== 'A') return;

          if (
            el.hasAttribute('download') ||
            el.getAttribute('rel') === 'external' ||
            el.target
          )
            return;

          event.preventDefault();

          if (el.href.startsWith(top_origin)) {
            const url = new URL(el.href);
            if (url.hash[0] === '#') {
              window.location.hash = url.hash;
              return;
            }
          }

          window.open(el.href, '_blank');
        });
        send_ok();
      } catch (e) {
        send_error(e.message, e.stack);
      }
    }
  }

  window.addEventListener('message', handle_message, false);

  window.onerror = function (msg, url, lineNo, columnNo, error) {
    if (msg.includes('module specifier “vue”')) {
      // firefox only error, ignore
      return false;
    }
    try {
      parent.postMessage({ action: 'error', value: error }, '*');
    } catch (e) {
      parent.postMessage({ action: 'error', value: msg }, '*');
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason.message.includes('Cross-origin')) {
      event.preventDefault();
      return;
    }
    try {
      parent.postMessage(
        { action: 'unhandledrejection', value: event.reason },
        '*'
      );
    } catch (e) {
      parent.postMessage(
        { action: 'unhandledrejection', value: event.reason.message },
        '*'
      );
    }
  });

  let previous = { level: null, args: null };

  function stringify(args) {
    try {
      return JSON.stringify(args);
    } catch (error) {
      return null;
    }
  }
  ['clear', 'log', 'info', 'dir', 'warn', 'error', 'table'].forEach((level) => {
    const original = window.console[level];
    window.console[level] = (...args) => {
      const msg = String(args[0]);
      if (
        msg.includes('You are running a development build of Vue') ||
        msg.includes('You are running the esm-bundler build of Vue')
      )
        return;

      const stringifiedArgs = stringify(args);
      if (
        previous.level === level &&
        previous.args &&
        previous.args === stringifiedArgs
      ) {
        parent.postMessage({ action: 'console', level, duplicate: true }, '*');
      } else {
        previous = { level, args: stringifiedArgs };

        try {
          parent.postMessage({ action: 'console', level, args }, '*');
        } catch (err) {
          parent.postMessage(
            {
              action: 'console',
              level,
              args: args.map((a) => {
                return a instanceof Error ? a.message : String(a);
              })
            },
            '*'
          );
        }
      }

      original(...args);
    };
  });

  [
    { method: 'group', action: 'console_group' },
    { method: 'groupEnd', action: 'console_group_end' },
    { method: 'groupCollapsed', action: 'console_group_collapsed' }
  ].forEach((group_action) => {
    const original = console[group_action.method];
    console[group_action.method] = (label) => {
      parent.postMessage({ action: group_action.action, label }, '*');

      original(label);
    };
  });

  const timers = new Map();
  const original_time = console.time;
  const original_timelog = console.timeLog;
  const original_timeend = console.timeEnd;

  console.time = (label = 'default') => {
    original_time(label);
    timers.set(label, performance.now());
  };
  console.timeLog = (label = 'default') => {
    original_timelog(label);
    const now = performance.now();
    if (timers.has(label))
      parent.postMessage(
        {
          action: 'console',
          level: 'system-log',
          args: [`${label}: ${now - timers.get(label)}ms`]
        },
        '*'
      );
    else
      parent.postMessage(
        {
          action: 'console',
          level: 'system-warn',
          args: [`Timer '${label}' does not exist`]
        },
        '*'
      );
  };
  console.timeEnd = (label = 'default') => {
    original_timeend(label);
    const now = performance.now();
    if (timers.has(label))
      parent.postMessage(
        {
          action: 'console',
          level: 'system-log',
          args: [`${label}: ${now - timers.get(label)}ms`]
        },
        '*'
      );
    else
      parent.postMessage(
        {
          action: 'console',
          level: 'system-warn',
          args: [`Timer '${label}' does not exist`]
        },
        '*'
      );

    timers.delete(label);
  };

  const original_assert = console.assert;
  console.assert = (condition, ...args) => {
    if (condition) {
      const stack = new Error().stack;
      parent.postMessage(
        { action: 'console', level: 'assert', args, stack },
        '*'
      );
    }
    original_assert(condition, ...args);
  };

  const counter = new Map();
  const original_count = console.count;
  const original_countreset = console.countReset;

  console.count = (label = 'default') => {
    counter.set(label, (counter.get(label) || 0) + 1);
    parent.postMessage(
      {
        action: 'console',
        level: 'system-log',
        args: `${label}: ${counter.get(label)}`
      },
      '*'
    );
    original_count(label);
  };

  console.countReset = (label = 'default') => {
    if (counter.has(label)) counter.set(label, 0);
    else
      parent.postMessage(
        {
          action: 'console',
          level: 'system-warn',
          args: `Count for '${label}' does not exist`
        },
        '*'
      );

    original_countreset(label);
  };

  const original_trace = console.trace;

  console.trace = (...args) => {
    const stack = new Error().stack;
    parent.postMessage({ action: 'console', level: 'trace', args, stack }, '*');
    original_trace(...args);
  };
})();

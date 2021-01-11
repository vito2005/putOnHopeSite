
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var Join = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10.5882 10.875C7.57819 10.875 5.12939 8.43577 5.12939 5.4375C5.12939 2.43923 7.57819 0 10.5882 0C13.5982 0 16.047 2.43923 16.047 5.4375C16.047 8.43577 13.5982 10.875 10.5882 10.875Z\" fill=\"#EE2424\"/>\n<path d=\"M12.7059 14.8593C12.7059 13.6556 13.0452 12.5293 13.6333 11.5702C12.715 12.0246 11.6813 12.2812 10.5882 12.2812C9.17045 12.2812 7.85167 11.8512 6.75628 11.1152C5.40183 11.6382 4.15929 12.4414 3.10127 13.4953C1.10136 15.4873 0 18.1358 0 20.953V23.2968C0 23.6851 0.316047 24 0.705882 24H20.4706C20.8604 24 21.1765 23.6851 21.1765 23.2968V20.953C21.1765 20.9108 21.1753 20.8684 21.1748 20.8261C20.5126 21.0598 19.8004 21.1875 19.0588 21.1875C15.5558 21.1875 12.7059 18.3487 12.7059 14.8593Z\" fill=\"#EE2424\"/>\n<path d=\"M19.0589 9.9375C16.3343 9.9375 14.1177 12.1455 14.1177 14.8594C14.1177 17.5733 16.3343 19.7812 19.0589 19.7812C21.7834 19.7812 24 17.5733 24 14.8594C24 12.1455 21.7834 9.9375 19.0589 9.9375ZM20.4706 15.5625H19.7647V16.2656C19.7647 16.6539 19.4487 16.9688 19.0589 16.9688C18.669 16.9688 18.353 16.6539 18.353 16.2656V15.5625H17.6471C17.2573 15.5625 16.9412 15.2477 16.9412 14.8594C16.9412 14.4711 17.2573 14.1562 17.6471 14.1562H18.353V13.4531C18.353 13.0648 18.669 12.75 19.0589 12.75C19.4487 12.75 19.7647 13.0648 19.7647 13.4531V14.1562H20.4706C20.8605 14.1562 21.1765 14.4711 21.1765 14.8594C21.1765 15.2477 20.8605 15.5625 20.4706 15.5625Z\" fill=\"#EE2424\"/>\n</svg>";

    var Logo = "<svg\n    class=\"articul-media\"\n    width=\"128\"\n    height=\"24\"\n    viewBox=\"0 0 128 24\"\n    fill=\"none\"\n    xmlns=\"http://www.w3.org/2000/svg\"\n    xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n>\n    <rect width=\"128\" height=\"24\" fill=\"url(#pattern0)\" />\n    <defs>\n    <pattern\n        id=\"pattern0\"\n        patternContentUnits=\"objectBoundingBox\"\n        width=\"1\"\n        height=\"1\"\n    >\n        <use\n        xlink:href=\"#image0\"\n        transform=\"translate(0 -0.00666667) scale(0.005 0.0266667)\"\n        />\n    </pattern>\n    <image\n        id=\"image0\"\n        width=\"200\"\n        height=\"38\"\n        xlink:href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAmCAYAAACBFtRsAAAGyElEQVR4nO2ceYhVVRzHv+OujU5pik42FuZSKZapGEzZYiZaQf9kSWaLIWLYRmSEFYVYVNQfabQSWlEqWeZSRmRmlIWo00KaaVpMuTSN+zb1i0PfCz8O951338x7c99zfh+4zDvnnXPuWe7vnN9y35SJiMAwjFha2bQYRmZMQAwjgAmIYQQwATGMACYghhHABMQwApiAGEaAliAgLs7zb5YyhwA0NFN/QvxTBH1oLKH5c+M6XNzdj+dkFZA9AN4EcDOASgC/B8reA6ALgF4APm/GPoLC+wWARwCMZF9KlcEAxgN4DsAWNYalALoBOBXArFIb28kaSX8IwJMqvQNAVUy5HwGcr9IjAKxrhv5F7OODEzENwLxmvH8+6QNgJ9urpuA7zgHwCz+XAagF0LNUBmU2iNGclJWaGtnSBeQ8AI8DOIU73QtF0KeTjZd4ejs19lkAZ5TS+NoUQR/SZlYp6sYlxJVUcUuSNAXEGXJLvLyOAE4DMIRGX1mg/gHaC9sB1NNT5QzySTFlX/R0/TEALuTnp1S+O1Gujam/m/eq5b00Y3nf11WeM7hHeeVWAdig0kkN8iMAFgBYCeAneoOcQ+FSAHfy5PsQwDsANtIj1x3AMAA3ArgsQ7trAbwNYD2AvXwWqlj+1iw7/Q+8V53yTu3PUHaxskHaq3E7VesZr2wbrlM/AMP5PKSLpMcO5x8IXH1FZGFM7+pFZLqIdIypO4NlZmZpe55qT+dP9O61TUSuF5HWgbY2iUiNlzczpt/TvDL1vHTeNK/OZhE5O3Dv9iJySZaxThKRBtXmMY4zVKdcRObHjGGFiAzKUtdd1arOeJVf4bU3ONCGKztLRI6k+IxKmjZIFXfsTLhd5wYAz6vvD3DnnMud1WdMHvu3lSfBkoBhWcmTrhAIx79dte1O1AqVPqa8RY62AMq9vizw5vBunhyaTp42cRDAZABrVN4rdON+n8exjg185zx8TwC4Js0YVdo2iDOKf1Zppyb9CuBlAH8z70E+KJX0sdeo8hdRjejC9BUZ7jMHQFeVrk7Qt3upWkW4hRrtHftnZlEDm4Ib5yZVfxwf7AqqeuOp5kQ41/ZjANoxf5RSe+YDuB/AXwBeU3UGUQUawLlfxNhRAwX0aW5I9VSNopCAc2rcAWAggNbq/nU5jncqVUTNXvZ3M/M+Zfr2As1zkLQF5HJePi42cQvzjgP4GMBtAJapci749CX12mxMzBAHyYR7QD5S342mnt+c+MHNCer0qOTuqwXkJgqH4wKefquYjuITLu5zQtWZTOEAPZoTaJNFttJ6/l3tRcJdjOkur3+zGyEgfXn5TKWdFfV1eUsVkI186Gs9NWavV26X99fRP6FwNAb/1ZN+BbpPLuS6Vm3V52jn9w3pD7wT3PGH+hwJxZ9emXyplW49F1KdPep9114JyO6Yus1CmgLyQIwXIxdaN6Gu8T9reWXDf9siH3O/nCfWoWJei7SM9E+aKBxGcRPnQNEcpDu+qIUDKQrI+156KY1E4VWToV5S2nrlmroQ2d4GTmKox73z5u/EJ2LK5BNfJZ2r5jzuimI+uc7n8Szfr1FOGMcMCpXuQy42Y8FIS0AOeOkhefYG+Z6RRTnWr/ACi5/FBAg1vbz0tpgyW9XnNvQElTMwGvE1XbeFor/X7sqEQunP5+IMAp8U3xZy3rAOBRx3o0nLBjnXS4+kyzZyoe5rYvvXMZq8h+lHaQz25S46JUHMZIpSA7fwbdVh9J5FVHP368bI77fMX0QX8NU8fVbQXRkxWs39RO7kYIzhDXpxCoHbla+iigs6SPpwg+qs7jfW8xpV09sVuV5fpWdroFoz37ESwl//+wC8520WubRXOFIKUO4Ske4JIrLRNYf1qjJEa+NYLSKdmxBJPyQio7P0S5dfJyKdEoylMyPvEXVeRDnq2zKv3lveGP23BWq87zNFsH8TkQFZ+jg0Zj6/E5GeCddrcIJ+jMth/bOtdcFIS8XqQT10TAG9UaPo93f++t6NqN+J8Rf3jtXFMXq4zwj+4GpooMxQ7rzaTep2za8APAzgrEb0M1d6M84xm/GmuGdgQ4xrdRDfwZoZo3I1hncBTI+J/BcVxfCDqSP0h4cM4a60CXaq+EQHBsySsl8d26er6Lu2F8opvHEcZ/2jCcp/w1dAamlbRS8XDk/Q16Mc22Ev/tDDe5jqPLuotwoUgnWjOEargPAdZoTdt0Xc3IbsgoOcj7h1a6c2pWz9aOD6h2yvXNc6b9j/5jWMAC39B1OGEcQExDACmIAYRgATEMMIYAJiGAFMQAwjgAmIYQQwATGMACYghpEJAP8B/Xa134MygkcAAAAASUVORK5CYII=\"\n    />\n    </defs>\n</svg>";

    var arrowRight = "<svg width=\"9\" height=\"11\" viewBox=\"0 0 9 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.70711 8.70711C9.09763 8.31658 9.09763 7.68342 8.70711 7.29289L2.34315 0.928932C1.95262 0.538408 1.31946 0.538408 0.928932 0.928932C0.538408 1.31946 0.538408 1.95262 0.928932 2.34315L6.58579 8L0.928932 13.6569C0.538408 14.0474 0.538408 14.6805 0.928932 15.0711C1.31946 15.4616 1.95262 15.4616 2.34315 15.0711L8.70711 8.70711ZM7 9H8V7H7V9Z\" fill=\"white\"/>\n</svg>";

    /* src/components/Button.svelte generated by Svelte v3.31.0 */
    const file = "src/components/Button.svelte";

    // (18:2) {#if arrow}
    function create_if_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "arrow-right svelte-16kriw8");
    			add_location(span, file, 18, 4, 378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = arrowRight;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:2) {#if arrow}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let a;
    	let t0;
    	let t1;
    	let a_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*arrow*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(a, "href", /*href*/ ctx[2]);
    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*color*/ ctx[1]) + " svelte-16kriw8"));
    			add_location(a, file, 16, 0, 292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			if (if_block) if_block.m(a, null);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click*/ ctx[4]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t0, /*text*/ ctx[0]);

    			if (/*arrow*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(a, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*href*/ 4) {
    				attr_dev(a, "href", /*href*/ ctx[2]);
    			}

    			if (dirty & /*color*/ 2 && a_class_value !== (a_class_value = "" + (null_to_empty(/*color*/ ctx[1]) + " svelte-16kriw8"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	const dispatch = createEventDispatcher();
    	let { text = "" } = $$props;
    	let { color = "white" } = $$props;
    	let { href = "" } = $$props;
    	let { arrow } = $$props;

    	function click(e) {
    		dispatch("click");
    	}

    	const writable_props = ["text", "color", "href", "arrow"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    		if ("arrow" in $$props) $$invalidate(3, arrow = $$props.arrow);
    	};

    	$$self.$capture_state = () => ({
    		arrowRight,
    		createEventDispatcher,
    		dispatch,
    		text,
    		color,
    		href,
    		arrow,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("href" in $$props) $$invalidate(2, href = $$props.href);
    		if ("arrow" in $$props) $$invalidate(3, arrow = $$props.arrow);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, color, href, arrow, click];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { text: 0, color: 1, href: 2, arrow: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*arrow*/ ctx[3] === undefined && !("arrow" in props)) {
    			console.warn("<Button> was created without expected prop 'arrow'");
    		}
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrow() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrow(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Arrow.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/components/Arrow.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let path;
    	let path_fill_value;
    	let svg_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M6 36L11.7735 26L0.226498 26L6 36ZM7 27L7 4.37114e-08L5 -4.37114e-08L5 27L7 27Z");
    			attr_dev(path, "fill", path_fill_value = /*disabled*/ ctx[1] ? "#3f3f3f" : "white");
    			add_location(path, file$1, 23, 2, 381);
    			attr_dev(svg, "class", svg_class_value = "arrow arrow_" + /*type*/ ctx[0] + " svelte-mlhs1n");
    			attr_dev(svg, "width", "12");
    			attr_dev(svg, "height", "36");
    			attr_dev(svg, "viewBox", "0 0 12 36");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			toggle_class(svg, "disabled", /*disabled*/ ctx[1]);
    			add_location(svg, file$1, 13, 0, 207);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 2 && path_fill_value !== (path_fill_value = /*disabled*/ ctx[1] ? "#3f3f3f" : "white")) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*type*/ 1 && svg_class_value !== (svg_class_value = "arrow arrow_" + /*type*/ ctx[0] + " svelte-mlhs1n")) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*type, disabled*/ 3) {
    				toggle_class(svg, "disabled", /*disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Arrow", slots, []);
    	let { type = "bottom" } = $$props;
    	let { disabled = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function click() {
    		dispatch("click");
    	}

    	const writable_props = ["type", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		type,
    		disabled,
    		dispatch,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, disabled, click];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { type: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arrow",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get type() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Slider.svelte generated by Svelte v3.31.0 */
    const file$2 = "src/components/Slider.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (17:2) {#if !isMobile}
    function create_if_block_1(ctx) {
    	let arrow;
    	let current;

    	arrow = new Arrow({
    			props: {
    				type: "top",
    				disabled: !/*current*/ ctx[0]
    			},
    			$$inline: true
    		});

    	arrow.$on("click", /*dec*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(arrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(arrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const arrow_changes = {};
    			if (dirty & /*current*/ 1) arrow_changes.disabled = !/*current*/ ctx[0];
    			arrow.$set(arrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(arrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(17:2) {#if !isMobile}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#each [...Array(pages)] as page, index}
    function create_each_block(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*index*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "page-point svelte-fmn42t");
    			toggle_class(div, "current", /*current*/ ctx[0] === /*index*/ ctx[8]);
    			add_location(div, file$2, 22, 6, 406);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*current*/ 1) {
    				toggle_class(div, "current", /*current*/ ctx[0] === /*index*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(22:4) {#each [...Array(pages)] as page, index}",
    		ctx
    	});

    	return block;
    }

    // (30:2) {#if !isMobile}
    function create_if_block$1(ctx) {
    	let arrow;
    	let current;

    	arrow = new Arrow({
    			props: {
    				type: "bottom",
    				disabled: /*current*/ ctx[0] >= /*pages*/ ctx[1] - 1
    			},
    			$$inline: true
    		});

    	arrow.$on("click", /*inc*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(arrow.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(arrow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const arrow_changes = {};
    			if (dirty & /*current, pages*/ 3) arrow_changes.disabled = /*current*/ ctx[0] >= /*pages*/ ctx[1] - 1;
    			arrow.$set(arrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(arrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:2) {#if !isMobile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let current;
    	let if_block0 = !/*isMobile*/ ctx[2] && create_if_block_1(ctx);
    	let each_value = [...Array(/*pages*/ ctx[1])];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block1 = !/*isMobile*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "pages svelte-fmn42t");
    			add_location(div0, file$2, 20, 2, 335);
    			attr_dev(div1, "class", "slider svelte-fmn42t");
    			add_location(div1, file$2, 15, 0, 225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*isMobile*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*isMobile*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*current, pages*/ 3) {
    				each_value = [...Array(/*pages*/ ctx[1])];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!/*isMobile*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isMobile*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slider", slots, []);
    	let { pages = 6 } = $$props;
    	let { current = 0 } = $$props;
    	let { isMobile = false } = $$props;

    	function inc() {
    		pages - 1 > current && $$invalidate(0, current++, current);
    	}

    	function dec() {
    		current && $$invalidate(0, current--, current);
    	}

    	const writable_props = ["pages", "current", "isMobile"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => $$invalidate(0, current = index);

    	$$self.$$set = $$props => {
    		if ("pages" in $$props) $$invalidate(1, pages = $$props.pages);
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("isMobile" in $$props) $$invalidate(2, isMobile = $$props.isMobile);
    	};

    	$$self.$capture_state = () => ({
    		pages,
    		current,
    		isMobile,
    		Arrow,
    		inc,
    		dec
    	});

    	$$self.$inject_state = $$props => {
    		if ("pages" in $$props) $$invalidate(1, pages = $$props.pages);
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("isMobile" in $$props) $$invalidate(2, isMobile = $$props.isMobile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [current, pages, isMobile, inc, dec, click_handler];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { pages: 1, current: 0, isMobile: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get pages() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pages(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMobile() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMobile(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Socials/Socials.svelte generated by Svelte v3.31.0 */

    const file$3 = "src/components/Socials/Socials.svelte";

    function create_fragment$3(ctx) {
    	let a0;
    	let svg0;
    	let path0;
    	let t0;
    	let a1;
    	let svg1;
    	let path1;
    	let t1;
    	let a2;
    	let svg2;
    	let path2;
    	let path3;
    	let path4;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "clip-rule", "evenodd");
    			attr_dev(path0, "d", "M20.0299 1.74817C20.1707 1.27848 20.0299 0.93335 19.3595 0.93335H17.1429C16.5792 0.93335 16.3194 1.23149 16.1785 1.56025C16.1785 1.56025 15.0512 4.3079 13.4543 6.09267C12.9377 6.60931 12.7028 6.77369 12.421 6.77369C12.2801 6.77369 12.0687 6.60931 12.0687 6.13966V1.74817C12.0687 1.18454 11.9126 0.93335 11.4429 0.93335H7.95952C7.60731 0.93335 7.39548 1.19494 7.39548 1.44286C7.39548 1.97717 8.19389 2.10038 8.27619 3.60339V6.86767C8.27619 7.58335 8.14694 7.7131 7.86513 7.7131C7.11367 7.7131 5.28574 4.95319 4.2016 1.79512C3.98914 1.1813 3.77604 0.93335 3.20952 0.93335H0.992857C0.359524 0.93335 0.232849 1.23149 0.232849 1.56025C0.232849 2.14737 0.98435 5.0594 3.73195 8.91076C5.56368 11.5409 8.14446 12.9667 10.4929 12.9667C11.9019 12.9667 12.0762 12.65 12.0762 12.1046V10.1167C12.0762 9.48335 12.2097 9.35695 12.6559 9.35695C12.9846 9.35695 13.5483 9.52133 14.8634 10.7895C16.3663 12.2924 16.6141 12.9667 17.4595 12.9667H19.6762C20.3095 12.9667 20.6262 12.65 20.4435 12.0251C20.2436 11.4023 19.526 10.4986 18.5739 9.4274C18.0572 8.81682 17.2822 8.1593 17.0474 7.83046C16.7186 7.4078 16.8125 7.21988 17.0474 6.84417C17.0474 6.84417 19.7481 3.03976 20.0299 1.74817Z");
    			attr_dev(path0, "fill", "#2D3031");
    			attr_dev(path0, "class", "svelte-bgmkvr");
    			add_location(path0, file$3, 8, 4, 162);
    			attr_dev(svg0, "width", "21");
    			attr_dev(svg0, "height", "13");
    			attr_dev(svg0, "viewBox", "0 0 22 13");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-bgmkvr");
    			add_location(svg0, file$3, 1, 2, 39);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "social__item vk svelte-bgmkvr");
    			add_location(a0, file$3, 0, 0, 0);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "clip-rule", "evenodd");
    			attr_dev(path1, "d", "M6.98014 21.1716V10.8346H9.8336L10.2118 7.27239H6.98014L6.98499 5.48948C6.98499 4.56041 7.07326 4.06259 8.40768 4.06259H10.1915V0.5H7.33768C3.90972 0.5 2.70317 2.22804 2.70317 5.13407V7.2728H0.566406V10.835H2.70317V21.1716H6.98014Z");
    			attr_dev(path1, "fill", "#2D3031");
    			attr_dev(path1, "class", "svelte-bgmkvr");
    			add_location(path1, file$3, 25, 4, 1615);
    			attr_dev(svg1, "class", "fb svelte-bgmkvr");
    			attr_dev(svg1, "width", "11");
    			attr_dev(svg1, "height", "22");
    			attr_dev(svg1, "viewBox", "0 0 9 20");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$3, 17, 2, 1478);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "social__item fb svelte-bgmkvr");
    			add_location(a1, file$3, 16, 0, 1439);
    			attr_dev(path2, "fill-rule", "evenodd");
    			attr_dev(path2, "clip-rule", "evenodd");
    			attr_dev(path2, "d", "M8.10876 15.9793C7.50942 15.9793 7.61126 15.753 7.40455 15.1824L5.64209 9.38191L19.2088 1.3335");
    			attr_dev(path2, "fill", "white");
    			attr_dev(path2, "class", "svelte-bgmkvr");
    			add_location(path2, file$3, 42, 4, 2131);
    			attr_dev(path3, "fill-rule", "evenodd");
    			attr_dev(path3, "clip-rule", "evenodd");
    			attr_dev(path3, "d", "M8.10791 15.9791C8.57041 15.9791 8.77476 15.7676 9.03291 15.5166L11.4996 13.1181L8.42272 11.2627");
    			attr_dev(path3, "fill", "#2D3031");
    			attr_dev(path3, "class", "svelte-bgmkvr");
    			add_location(path3, file$3, 48, 4, 2324);
    			attr_dev(path4, "fill-rule", "evenodd");
    			attr_dev(path4, "clip-rule", "evenodd");
    			attr_dev(path4, "d", "M8.42269 11.2631L15.8782 16.7713C16.729 17.2407 17.343 16.9977 17.5549 15.9815L20.5897 1.68049C20.9004 0.434793 20.1148 -0.130198 19.3009 0.239309L1.48082 7.11067C0.264425 7.59856 0.271517 8.27719 1.25909 8.57957L5.83214 10.0069L16.4192 3.32762C16.919 3.02455 17.3777 3.18749 17.0012 3.52163");
    			attr_dev(path4, "fill", "#2D3031");
    			attr_dev(path4, "class", "svelte-bgmkvr");
    			add_location(path4, file$3, 54, 4, 2521);
    			attr_dev(svg2, "class", "tg svelte-bgmkvr");
    			attr_dev(svg2, "width", "21");
    			attr_dev(svg2, "height", "18");
    			attr_dev(svg2, "viewBox", "0 0 21 16");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg2, file$3, 34, 2, 1993);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "social__item svelte-bgmkvr");
    			add_location(a2, file$3, 33, 0, 1957);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a2, anchor);
    			append_dev(a2, svg2);
    			append_dev(svg2, path2);
    			append_dev(svg2, path3);
    			append_dev(svg2, path4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Socials", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Socials> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Socials extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Socials",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/BecomeVolunteer.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/components/BecomeVolunteer.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t1;
    	let t2;
    	let button;
    	let t3;
    	let div2;
    	let current;

    	button = new Button({
    			props: { color: "red", text: "Стать добровольцем" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Стань диджитал добровольцем!";
    			t1 = text("\n    И помогай находить пропавших без вести людей");
    			t2 = space();
    			create_component(button.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "become-volunteer__text_header svelte-1don5a8");
    			add_location(div0, file$4, 23, 4, 504);
    			attr_dev(div1, "class", "become-volunteer__text svelte-1don5a8");
    			add_location(div1, file$4, 22, 2, 463);
    			attr_dev(div2, "class", "become-volunteer__line svelte-1don5a8");
    			add_location(div2, file$4, 29, 2, 705);
    			attr_dev(div3, "class", "become-volunteer svelte-1don5a8");
    			add_location(div3, file$4, 21, 0, 402);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			mount_component(button, div3, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			/*div3_binding*/ ctx[2](div3);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(button);
    			/*div3_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BecomeVolunteer", slots, []);
    	let { show } = $$props;
    	let becomeVolunteer;

    	onMount(() => {
    		document.addEventListener("click", hideBecomeVolunteer);
    		return () => document.removeEventListener("click", hideBecomeVolunteer);
    	});

    	function hideBecomeVolunteer({ target }) {
    		if (target === becomeVolunteer) {
    			return;
    		}

    		show && $$invalidate(1, show = false);
    	}

    	const writable_props = ["show"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BecomeVolunteer> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			becomeVolunteer = $$value;
    			$$invalidate(0, becomeVolunteer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("show" in $$props) $$invalidate(1, show = $$props.show);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Button,
    		show,
    		becomeVolunteer,
    		hideBecomeVolunteer
    	});

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(1, show = $$props.show);
    		if ("becomeVolunteer" in $$props) $$invalidate(0, becomeVolunteer = $$props.becomeVolunteer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [becomeVolunteer, show, div3_binding];
    }

    class BecomeVolunteer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { show: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BecomeVolunteer",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*show*/ ctx[1] === undefined && !("show" in props)) {
    			console.warn("<BecomeVolunteer> was created without expected prop 'show'");
    		}
    	}

    	get show() {
    		throw new Error("<BecomeVolunteer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<BecomeVolunteer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/App.svelte generated by Svelte v3.31.0 */

    const { window: window_1 } = globals;
    const file$5 = "src/App.svelte";

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[42] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[42] = i;
    	return child_ctx;
    }

    // (264:2) {:else}
    function create_else_block(ctx) {
    	let div0;
    	let div0_resize_listener;
    	let t0;
    	let div1;
    	let video;
    	let source;
    	let source_src_value;
    	let t1;
    	let div2;
    	let span;
    	let t3;
    	let t4;
    	let t5;
    	let div3;
    	let slider;
    	let updating_current;
    	let t6;
    	let div6;
    	let div5;
    	let div4;
    	let t8;
    	let html_tag;
    	let t9;
    	let div7;
    	let socials;
    	let t10;
    	let div8;
    	let button;
    	let t11;
    	let t12;
    	let if_block2_anchor;
    	let current;
    	let each_value_3 = /*pages*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let if_block0 = /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && create_if_block_7(ctx);

    	function slider_current_binding_1(value) {
    		/*slider_current_binding_1*/ ctx[24].call(null, value);
    	}

    	let slider_props = {
    		pages: /*pagesLength*/ ctx[10],
    		isMobile: /*isMobile*/ ctx[11]
    	};

    	if (/*current*/ ctx[2] !== void 0) {
    		slider_props.current = /*current*/ ctx[2];
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, "current", slider_current_binding_1));
    	socials = new Socials({ $$inline: true });

    	button = new Button({
    			props: { color: "red", text: "Стать добровольцем" },
    			$$inline: true
    		});

    	let if_block1 = /*current*/ ctx[2] === 0 && create_if_block_6(ctx);
    	let if_block2 = /*showBecomeVolunterBlock*/ ctx[7] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			video = element("video");
    			source = element("source");
    			t1 = space();
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "ОДЕТЬ";
    			t3 = text(" НАДЕЖДУ");
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			div3 = element("div");
    			create_component(slider.$$.fragment);
    			t6 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Lisa Alert";
    			t8 = space();
    			t9 = space();
    			div7 = element("div");
    			create_component(socials.$$.fragment);
    			t10 = space();
    			div8 = element("div");
    			create_component(button.$$.fragment);
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(div0, "class", "container svelte-wnnac8");
    			set_style(div0, "transform", "translate3d(0px, -" + /*current*/ ctx[2] * 100 + "%, 0px)");
    			set_style(div0, "transition", "transform 500ms ease 0s");
    			add_render_callback(() => /*div0_elementresize_handler_1*/ ctx[23].call(div0));
    			add_location(div0, file$5, 264, 4, 6746);
    			if (source.src !== (source_src_value = "./previewcity.mp4")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$5, 317, 8, 8438);
    			video.autoplay = true;
    			video.loop = true;
    			video.muted = true;
    			video.controls = "";
    			set_style(video, "height", /*containerHeight*/ ctx[4] + "px");
    			add_location(video, file$5, 310, 6, 8306);
    			attr_dev(div1, "class", "video-box svelte-wnnac8");
    			add_location(div1, file$5, 309, 4, 8276);
    			attr_dev(span, "class", "logo_red svelte-wnnac8");
    			add_location(span, file$5, 321, 22, 8539);
    			attr_dev(div2, "class", "logo svelte-wnnac8");
    			add_location(div2, file$5, 321, 4, 8521);
    			attr_dev(div3, "class", "slider-wrapper svelte-wnnac8");
    			set_style(div3, "margin-top", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "0px" || "2px");
    			add_location(div3, file$5, 328, 4, 8750);
    			attr_dev(div4, "class", "text_logo svelte-wnnac8");
    			add_location(div4, file$5, 336, 8, 9014);
    			html_tag = new HtmlTag(null);
    			attr_dev(div5, "class", "company-data svelte-wnnac8");
    			add_location(div5, file$5, 335, 6, 8979);
    			attr_dev(div6, "class", "company svelte-wnnac8");
    			add_location(div6, file$5, 334, 4, 8951);
    			attr_dev(div7, "class", "socials svelte-wnnac8");
    			add_location(div7, file$5, 340, 4, 9103);
    			attr_dev(div8, "class", "buttons svelte-wnnac8");
    			set_style(div8, "margin-left", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "3px");
    			set_style(div8, "background", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "#2d3031" || "");

    			set_style(div8, "top", (/*current*/ ctx[2] === 0 || /*current*/ ctx[2] === 5
    			? 56.5
    			: 0) + "%");

    			set_style(div8, "left", (/*current*/ ctx[2] === 0 || /*current*/ ctx[2] === 5
    			? 7.5
    			: 200) + "%");

    			set_style(div8, "align-items", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "flex-start" || "center");

    			set_style(div8, "justify-content", /*current*/ ctx[2] === 0
    			? "space-between"
    			: /*current*/ ctx[2] === 5 ? "center" : "flex-end");

    			set_style(div8, "height", /*current*/ ctx[2] === 5 && "13%" && /*current*/ ctx[2] === 0 && "16%");
    			add_location(div8, file$5, 343, 4, 9158);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler_1*/ ctx[23].bind(div0));
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video);
    			append_dev(video, source);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span);
    			append_dev(div2, t3);
    			insert_dev(target, t4, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(slider, div3, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t8);
    			html_tag.m(Logo, div5);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			mount_component(socials, div7, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div8, anchor);
    			mount_component(button, div8, null);
    			append_dev(div8, t11);
    			if (if_block1) if_block1.m(div8, null);
    			insert_dev(target, t12, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*current, pages, disableGlitch, glitchAnimation, emptySquareBorder, inVisibleBlocks*/ 17221) {
    				each_value_3 = /*pages*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div0, "transform", "translate3d(0px, -" + /*current*/ ctx[2] * 100 + "%, 0px)");
    			}

    			if (!current || dirty[0] & /*containerHeight*/ 16) {
    				set_style(video, "height", /*containerHeight*/ ctx[4] + "px");
    			}

    			if (/*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*current*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t5.parentNode, t5);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const slider_changes = {};
    			if (dirty[0] & /*pagesLength*/ 1024) slider_changes.pages = /*pagesLength*/ ctx[10];
    			if (dirty[0] & /*isMobile*/ 2048) slider_changes.isMobile = /*isMobile*/ ctx[11];

    			if (!updating_current && dirty[0] & /*current*/ 4) {
    				updating_current = true;
    				slider_changes.current = /*current*/ ctx[2];
    				add_flush_callback(() => updating_current = false);
    			}

    			slider.$set(slider_changes);

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div3, "margin-top", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "0px" || "2px");
    			}

    			if (/*current*/ ctx[2] === 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*current*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div8, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div8, "margin-left", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "3px");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div8, "background", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "#2d3031" || "");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div8, "top", (/*current*/ ctx[2] === 0 || /*current*/ ctx[2] === 5
    				? 56.5
    				: 0) + "%");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div8, "left", (/*current*/ ctx[2] === 0 || /*current*/ ctx[2] === 5
    				? 7.5
    				: 200) + "%");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div8, "align-items", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "flex-start" || "center");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div8, "justify-content", /*current*/ ctx[2] === 0
    				? "space-between"
    				: /*current*/ ctx[2] === 5 ? "center" : "flex-end");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div8, "height", /*current*/ ctx[2] === 5 && "13%" && /*current*/ ctx[2] === 0 && "16%");
    			}

    			if (/*showBecomeVolunterBlock*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*showBecomeVolunterBlock*/ 128) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(slider.$$.fragment, local);
    			transition_in(socials.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(slider.$$.fragment, local);
    			transition_out(socials.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			div0_resize_listener();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			destroy_component(slider);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			destroy_component(socials);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div8);
    			destroy_component(button);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t12);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(264:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (171:2) {#if !isMobile}
    function create_if_block$2(ctx) {
    	let div0;
    	let div0_resize_listener;
    	let t0;
    	let div1;
    	let video;
    	let source;
    	let source_src_value;
    	let t1;
    	let div2;
    	let span;
    	let t3;
    	let t4;
    	let div3;
    	let slider;
    	let updating_current;
    	let t5;
    	let div6;
    	let socials;
    	let t6;
    	let div5;
    	let div4;
    	let t8;
    	let html_tag;
    	let t9;
    	let div7;
    	let button;
    	let t10;
    	let current;
    	let each_value = /*pages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function slider_current_binding(value) {
    		/*slider_current_binding*/ ctx[21].call(null, value);
    	}

    	let slider_props = { pages: /*pagesLength*/ ctx[10] };

    	if (/*current*/ ctx[2] !== void 0) {
    		slider_props.current = /*current*/ ctx[2];
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, "current", slider_current_binding));
    	socials = new Socials({ $$inline: true });

    	button = new Button({
    			props: { color: "red", text: "Стать добровольцем" },
    			$$inline: true
    		});

    	let if_block = /*current*/ ctx[2] === 0 && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			video = element("video");
    			source = element("source");
    			t1 = space();
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "ОДЕТЬ";
    			t3 = text(" НАДЕЖДУ");
    			t4 = space();
    			div3 = element("div");
    			create_component(slider.$$.fragment);
    			t5 = space();
    			div6 = element("div");
    			create_component(socials.$$.fragment);
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Lisa Alert";
    			t8 = space();
    			t9 = space();
    			div7 = element("div");
    			create_component(button.$$.fragment);
    			t10 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "container svelte-wnnac8");
    			set_style(div0, "transform", "translate3d(0px, -" + /*current*/ ctx[2] * 100 + "%, 0px)");
    			set_style(div0, "transition", "transform 1000ms ease 0s");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[19].call(div0));
    			add_location(div0, file$5, 171, 4, 3784);
    			if (source.src !== (source_src_value = "./previewcity.mp4")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$5, 225, 8, 5526);
    			video.autoplay = true;
    			video.loop = true;
    			video.muted = true;
    			video.controls = "";
    			set_style(video, "width", /*containerWidth*/ ctx[3] + 200 + "px");
    			add_location(video, file$5, 218, 6, 5390);
    			attr_dev(div1, "class", "video-box svelte-wnnac8");
    			add_location(div1, file$5, 217, 4, 5360);
    			attr_dev(span, "class", "logo_red svelte-wnnac8");
    			add_location(span, file$5, 229, 22, 5627);
    			attr_dev(div2, "class", "logo svelte-wnnac8");
    			add_location(div2, file$5, 229, 4, 5609);
    			attr_dev(div3, "class", "slider-wrapper svelte-wnnac8");
    			set_style(div3, "margin-top", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "0px" || "2px");
    			add_location(div3, file$5, 231, 4, 5682);
    			attr_dev(div4, "class", "text_logo svelte-wnnac8");
    			add_location(div4, file$5, 240, 8, 5944);
    			html_tag = new HtmlTag(null);
    			attr_dev(div5, "class", "company-data svelte-wnnac8");
    			add_location(div5, file$5, 239, 6, 5909);
    			attr_dev(div6, "class", "company svelte-wnnac8");
    			add_location(div6, file$5, 237, 4, 5863);
    			attr_dev(div7, "class", "buttons svelte-wnnac8");
    			set_style(div7, "margin-left", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "3px");
    			set_style(div7, "background", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "#2d3031" || "");

    			set_style(div7, "top", (/*current*/ ctx[2] === 0 || /*current*/ ctx[2] === 5
    			? 50
    			: 0) + "%");

    			set_style(div7, "left", (/*current*/ ctx[2] === 0
    			? 18.75
    			: /*current*/ ctx[2] === 5 ? 62.5 : 75) + "%");

    			set_style(div7, "align-items", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "flex-start" || "center");

    			set_style(div7, "justify-content", /*current*/ ctx[2] === 0
    			? "flex-start"
    			: /*current*/ ctx[2] === 5 ? "center" : "flex-end");

    			add_location(div7, file$5, 244, 4, 6033);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[19].bind(div0));
    			/*div0_binding*/ ctx[20](div0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video);
    			append_dev(video, source);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span);
    			append_dev(div2, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(slider, div3, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div6, anchor);
    			mount_component(socials, div6, null);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t8);
    			html_tag.m(Logo, div5);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			mount_component(button, div7, null);
    			append_dev(div7, t10);
    			if (if_block) if_block.m(div7, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*current, pages, disableGlitch, glitchAnimation, emptySquareBorder, inVisibleBlocks, hover*/ 21317) {
    				each_value = /*pages*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div0, "transform", "translate3d(0px, -" + /*current*/ ctx[2] * 100 + "%, 0px)");
    			}

    			if (!current || dirty[0] & /*containerWidth*/ 8) {
    				set_style(video, "width", /*containerWidth*/ ctx[3] + 200 + "px");
    			}

    			const slider_changes = {};
    			if (dirty[0] & /*pagesLength*/ 1024) slider_changes.pages = /*pagesLength*/ ctx[10];

    			if (!updating_current && dirty[0] & /*current*/ 4) {
    				updating_current = true;
    				slider_changes.current = /*current*/ ctx[2];
    				add_flush_callback(() => updating_current = false);
    			}

    			slider.$set(slider_changes);

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div3, "margin-top", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "0px" || "2px");
    			}

    			if (/*current*/ ctx[2] === 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*current*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div7, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div7, "margin-left", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "3px");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div7, "background", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "#2d3031" || "");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div7, "top", (/*current*/ ctx[2] === 0 || /*current*/ ctx[2] === 5
    				? 50
    				: 0) + "%");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div7, "left", (/*current*/ ctx[2] === 0
    				? 18.75
    				: /*current*/ ctx[2] === 5 ? 62.5 : 75) + "%");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div7, "align-items", /*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5 && "flex-start" || "center");
    			}

    			if (!current || dirty[0] & /*current*/ 4) {
    				set_style(div7, "justify-content", /*current*/ ctx[2] === 0
    				? "flex-start"
    				: /*current*/ ctx[2] === 5 ? "center" : "flex-end");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			transition_in(socials.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			transition_out(socials.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			div0_resize_listener();
    			/*div0_binding*/ ctx[20](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			destroy_component(slider);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div6);
    			destroy_component(socials);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			destroy_component(button);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(171:2) {#if !isMobile}",
    		ctx
    	});

    	return block;
    }

    // (272:10) {#each [...Array(66)] as emptySquare, i}
    function create_each_block_5(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "empty-square svelte-wnnac8");
    			attr_dev(div, "style", div_style_value = /*emptySquareBorder*/ ctx[14](/*i*/ ctx[42], /*index*/ ctx[36]));

    			toggle_class(div, "disabled", [
    				0,
    				1,
    				2,
    				23,
    				29,
    				35,
    				41,
    				46,
    				60,
    				61,
    				65,
    				64,
    				/*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5
    				? 6
    				: 100
    			].includes(/*i*/ ctx[42]));

    			toggle_class(div, "invisible", /*inVisibleBlocks*/ ctx[6].includes(/*i*/ ctx[42]));
    			add_location(div, file$5, 272, 12, 7076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*current*/ 4) {
    				toggle_class(div, "disabled", [
    					0,
    					1,
    					2,
    					23,
    					29,
    					35,
    					41,
    					46,
    					60,
    					61,
    					65,
    					64,
    					/*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5
    					? 6
    					: 100
    				].includes(/*i*/ ctx[42]));
    			}

    			if (dirty[0] & /*inVisibleBlocks*/ 64) {
    				toggle_class(div, "invisible", /*inVisibleBlocks*/ ctx[6].includes(/*i*/ ctx[42]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(272:10) {#each [...Array(66)] as emptySquare, i}",
    		ctx
    	});

    	return block;
    }

    // (283:12) {#if glitchAnimation}
    function create_if_block_10(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*page*/ ctx[34].title + "";
    	let t0;
    	let t1;
    	let t2_value = /*page*/ ctx[34].title + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4_value = /*page*/ ctx[34].title + "";
    	let t4;
    	let glitch_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = text(t4_value);
    			attr_dev(span0, "aria-hidden", "true");
    			attr_dev(span0, "class", "svelte-wnnac8");
    			add_location(span0, file$5, 284, 16, 7586);
    			attr_dev(span1, "aria-hidden", "true");
    			attr_dev(span1, "class", "svelte-wnnac8");
    			add_location(span1, file$5, 286, 16, 7676);
    			attr_dev(div, "class", "glitch svelte-wnnac8");
    			toggle_class(div, "disable", /*disableGlitch*/ ctx[9]);
    			add_location(div, file$5, 283, 14, 7508);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, span1);
    			append_dev(span1, t4);

    			if (!mounted) {
    				dispose = action_destroyer(glitch_action = /*glitch*/ ctx[16].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1 && t0_value !== (t0_value = /*page*/ ctx[34].title + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*pages*/ 1 && t2_value !== (t2_value = /*page*/ ctx[34].title + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*pages*/ 1 && t4_value !== (t4_value = /*page*/ ctx[34].title + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*disableGlitch*/ 512) {
    				toggle_class(div, "disable", /*disableGlitch*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(283:12) {#if glitchAnimation}",
    		ctx
    	});

    	return block;
    }

    // (291:10) {#if page.subtitle}
    function create_if_block_9(ctx) {
    	let div;
    	let t0_value = /*page*/ ctx[34].subtitle + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*page*/ ctx[34].subtitle_red + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "text__subtitle_red svelte-wnnac8");
    			add_location(span, file$5, 293, 14, 7892);
    			attr_dev(div, "class", "text__subtitle svelte-wnnac8");
    			add_location(div, file$5, 291, 12, 7819);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1 && t0_value !== (t0_value = /*page*/ ctx[34].subtitle + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*pages*/ 1 && t2_value !== (t2_value = /*page*/ ctx[34].subtitle_red + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(291:10) {#if page.subtitle}",
    		ctx
    	});

    	return block;
    }

    // (297:10) {#if page.info}
    function create_if_block_8(ctx) {
    	let div;
    	let each_value_4 = /*page*/ ctx[34].info;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "info svelte-wnnac8");
    			add_location(div, file$5, 297, 12, 8025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1) {
    				each_value_4 = /*page*/ ctx[34].info;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(297:10) {#if page.info}",
    		ctx
    	});

    	return block;
    }

    // (299:14) {#each page.info as infoItem}
    function create_each_block_4(ctx) {
    	let span;
    	let html_tag;
    	let raw_value = /*infoItem*/ ctx[37] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = space();
    			html_tag = new HtmlTag(t);
    			add_location(span, file$5, 299, 16, 8104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			html_tag.m(raw_value, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1 && raw_value !== (raw_value = /*infoItem*/ ctx[37] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(299:14) {#each page.info as infoItem}",
    		ctx
    	});

    	return block;
    }

    // (270:6) {#each pages as page, index}
    function create_each_block_3(ctx) {
    	let section;
    	let t0;
    	let div;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_5 = [...Array(66)];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let if_block0 = /*glitchAnimation*/ ctx[8] && create_if_block_10(ctx);
    	let if_block1 = /*page*/ ctx[34].subtitle && create_if_block_9(ctx);
    	let if_block2 = /*page*/ ctx[34].info && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			attr_dev(div, "class", "text svelte-wnnac8");
    			add_location(div, file$5, 281, 10, 7441);
    			attr_dev(section, "class", "svelte-wnnac8");
    			toggle_class(section, "active", /*current*/ ctx[2] === /*index*/ ctx[36]);
    			add_location(section, file$5, 270, 8, 6970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(section, t0);
    			append_dev(section, div);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(section, t1);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(section, t2);
    			if (if_block2) if_block2.m(section, null);
    			append_dev(section, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*emptySquareBorder, current, inVisibleBlocks*/ 16452) {
    				each_value_5 = [...Array(66)];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (/*glitchAnimation*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_10(ctx);
    					if_block0.c();
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*page*/ ctx[34].subtitle) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9(ctx);
    					if_block1.c();
    					if_block1.m(section, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*page*/ ctx[34].info) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_8(ctx);
    					if_block2.c();
    					if_block2.m(section, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*current*/ 4) {
    				toggle_class(section, "active", /*current*/ ctx[2] === /*index*/ ctx[36]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(270:6) {#each pages as page, index}",
    		ctx
    	});

    	return block;
    }

    // (323:4) {#if current > 0 && current < 5}
    function create_if_block_7(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "join svelte-wnnac8");
    			add_location(div, file$5, 323, 6, 8632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = Join;
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clickJoin*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(323:4) {#if current > 0 && current < 5}",
    		ctx
    	});

    	return block;
    }

    // (356:6) {#if current === 0}
    function create_if_block_6(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Как это работает", arrow: true },
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_1*/ ctx[25]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(356:6) {#if current === 0}",
    		ctx
    	});

    	return block;
    }

    // (364:4) {#if showBecomeVolunterBlock}
    function create_if_block_5(ctx) {
    	let div;
    	let becomevolunteer;
    	let updating_show;
    	let div_transition;
    	let current;

    	function becomevolunteer_show_binding(value) {
    		/*becomevolunteer_show_binding*/ ctx[26].call(null, value);
    	}

    	let becomevolunteer_props = {};

    	if (/*showBecomeVolunterBlock*/ ctx[7] !== void 0) {
    		becomevolunteer_props.show = /*showBecomeVolunterBlock*/ ctx[7];
    	}

    	becomevolunteer = new BecomeVolunteer({
    			props: becomevolunteer_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(becomevolunteer, "show", becomevolunteer_show_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(becomevolunteer.$$.fragment);
    			attr_dev(div, "class", "become-volunter-wrapper svelte-wnnac8");
    			add_location(div, file$5, 364, 6, 9961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(becomevolunteer, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const becomevolunteer_changes = {};

    			if (!updating_show && dirty[0] & /*showBecomeVolunterBlock*/ 128) {
    				updating_show = true;
    				becomevolunteer_changes.show = /*showBecomeVolunterBlock*/ ctx[7];
    				add_flush_callback(() => updating_show = false);
    			}

    			becomevolunteer.$set(becomevolunteer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(becomevolunteer.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(becomevolunteer.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(becomevolunteer);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(364:4) {#if showBecomeVolunterBlock}",
    		ctx
    	});

    	return block;
    }

    // (181:10) {#each [...Array(32)] as emptySquare, i}
    function create_each_block_2(ctx) {
    	let div;
    	let div_style_value;
    	let mounted;
    	let dispose;

    	function mouseenter_handler() {
    		return /*mouseenter_handler*/ ctx[18](/*i*/ ctx[42]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "empty-square svelte-wnnac8");
    			attr_dev(div, "style", div_style_value = /*emptySquareBorder*/ ctx[14](/*i*/ ctx[42], /*index*/ ctx[36]));

    			toggle_class(div, "disabled", [
    				15,
    				23,
    				24,
    				25,
    				/*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5
    				? 6
    				: 100
    			].includes(/*i*/ ctx[42]));

    			toggle_class(div, "invisible", /*inVisibleBlocks*/ ctx[6].includes(/*i*/ ctx[42]));
    			add_location(div, file$5, 181, 12, 4183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "mouseenter", mouseenter_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*current*/ 4) {
    				toggle_class(div, "disabled", [
    					15,
    					23,
    					24,
    					25,
    					/*current*/ ctx[2] > 0 && /*current*/ ctx[2] < 5
    					? 6
    					: 100
    				].includes(/*i*/ ctx[42]));
    			}

    			if (dirty[0] & /*inVisibleBlocks*/ 64) {
    				toggle_class(div, "invisible", /*inVisibleBlocks*/ ctx[6].includes(/*i*/ ctx[42]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(181:10) {#each [...Array(32)] as emptySquare, i}",
    		ctx
    	});

    	return block;
    }

    // (191:12) {#if glitchAnimation}
    function create_if_block_4(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*page*/ ctx[34].title + "";
    	let t0;
    	let t1;
    	let t2_value = /*page*/ ctx[34].title + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4_value = /*page*/ ctx[34].title + "";
    	let t4;
    	let glitch_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = text(t4_value);
    			attr_dev(span0, "aria-hidden", "true");
    			attr_dev(span0, "class", "svelte-wnnac8");
    			add_location(span0, file$5, 192, 16, 4664);
    			attr_dev(span1, "aria-hidden", "true");
    			attr_dev(span1, "class", "svelte-wnnac8");
    			add_location(span1, file$5, 194, 16, 4754);
    			attr_dev(div, "class", "glitch svelte-wnnac8");
    			toggle_class(div, "disable", /*disableGlitch*/ ctx[9]);
    			add_location(div, file$5, 191, 14, 4586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, span1);
    			append_dev(span1, t4);

    			if (!mounted) {
    				dispose = action_destroyer(glitch_action = /*glitch*/ ctx[16].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1 && t0_value !== (t0_value = /*page*/ ctx[34].title + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*pages*/ 1 && t2_value !== (t2_value = /*page*/ ctx[34].title + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*pages*/ 1 && t4_value !== (t4_value = /*page*/ ctx[34].title + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*disableGlitch*/ 512) {
    				toggle_class(div, "disable", /*disableGlitch*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(191:12) {#if glitchAnimation}",
    		ctx
    	});

    	return block;
    }

    // (198:12) {#if page.subtitle}
    function create_if_block_3(ctx) {
    	let div;
    	let t0_value = /*page*/ ctx[34].subtitle + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*page*/ ctx[34].subtitle_red + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "text__subtitle_red svelte-wnnac8");
    			add_location(span, file$5, 200, 16, 4961);
    			attr_dev(div, "class", "text__subtitle svelte-wnnac8");
    			add_location(div, file$5, 198, 14, 4884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1 && t0_value !== (t0_value = /*page*/ ctx[34].subtitle + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*pages*/ 1 && t2_value !== (t2_value = /*page*/ ctx[34].subtitle_red + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(198:12) {#if page.subtitle}",
    		ctx
    	});

    	return block;
    }

    // (205:10) {#if page.info}
    function create_if_block_2(ctx) {
    	let div;
    	let each_value_1 = /*page*/ ctx[34].info;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "info svelte-wnnac8");
    			add_location(div, file$5, 205, 12, 5115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1) {
    				each_value_1 = /*page*/ ctx[34].info;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(205:10) {#if page.info}",
    		ctx
    	});

    	return block;
    }

    // (207:14) {#each page.info as infoItem}
    function create_each_block_1(ctx) {
    	let p;
    	let html_tag;
    	let raw_value = /*infoItem*/ ctx[37] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = space();
    			html_tag = new HtmlTag(t);
    			add_location(p, file$5, 207, 16, 5194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			html_tag.m(raw_value, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pages*/ 1 && raw_value !== (raw_value = /*infoItem*/ ctx[37] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(207:14) {#each page.info as infoItem}",
    		ctx
    	});

    	return block;
    }

    // (179:6) {#each pages as page, index}
    function create_each_block$1(ctx) {
    	let section;
    	let t0;
    	let div;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_2 = [...Array(32)];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block0 = /*glitchAnimation*/ ctx[8] && create_if_block_4(ctx);
    	let if_block1 = /*page*/ ctx[34].subtitle && create_if_block_3(ctx);
    	let if_block2 = /*page*/ ctx[34].info && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			attr_dev(div, "class", "text svelte-wnnac8");
    			add_location(div, file$5, 189, 10, 4519);
    			attr_dev(section, "class", "svelte-wnnac8");
    			toggle_class(section, "active", /*current*/ ctx[2] === /*index*/ ctx[36]);
    			add_location(section, file$5, 179, 8, 4077);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(section, t0);
    			append_dev(section, div);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(section, t2);
    			if (if_block2) if_block2.m(section, null);
    			append_dev(section, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*emptySquareBorder, current, inVisibleBlocks, hover*/ 20548) {
    				each_value_2 = [...Array(32)];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (/*glitchAnimation*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*page*/ ctx[34].subtitle) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*page*/ ctx[34].info) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(section, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*current*/ 4) {
    				toggle_class(section, "active", /*current*/ ctx[2] === /*index*/ ctx[36]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(179:6) {#each pages as page, index}",
    		ctx
    	});

    	return block;
    }

    // (256:6) {#if current === 0}
    function create_if_block_1$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Как это работает", arrow: true },
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[22]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(256:6) {#if current === 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[17]);
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*isMobile*/ ctx[11]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-wnnac8");
    			add_location(main, file$5, 169, 0, 3755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "mousewheel", /*scroll*/ ctx[13], false, false, false),
    					listen_dev(window_1, "resize", /*onwindowresize*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const animationTime = 1000;
    const animationTimeM = 1000;

    function randomInteger(min, max) {
    	let rand = min + Math.random() * (max + 1 - min);
    	return Math.floor(rand);
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { pages } = $$props;
    	let outerWidth;
    	let containerWidth;
    	let containerHeight;
    	let container;
    	let touchstart = 0;
    	let touchend = 0;
    	let current = 0;
    	let lastAnimation = 0;
    	let lastAnimationM = 0;
    	let inVisibleBlocks = [];
    	let showBecomeVolunterBlock = false;
    	let glitchAnimation = false;
    	let disableGlitch = false;
    	let beta, gamma;
    	const userAgent = window.navigator.userAgent;

    	onMount(() => {
    		window.addEventListener("touchstart", e => {
    			touchstart = typeof e.pageY !== "undefined" && (e.pageY || e.pageX)
    			? e.pageY
    			: e.touches[0].pageY;
    		});

    		window.addEventListener("touchmove", scroll);

    		window.addEventListener(
    			"deviceorientation",
    			function (event) {
    				let timeNowM = new Date().getTime(), quietPeriodM = 300;

    				// Cancel scroll if currently animating or within quiet period
    				if (timeNowM - lastAnimationM < quietPeriodM + animationTimeM) {
    					e.preventDefault();
    					return;
    				}

    				if (event.beta < -15) {
    					hover(2);
    				}

    				if (event.beta > 15) {
    					hover(62);
    				}

    				if (event.gamma > 15) {
    					hover(34);
    				}

    				if (event.gamma < -15) {
    					hover(26);
    				}

    				beta = event.beta;
    				gamma = event.gamma;
    				hover(Math.floor((gamma + beta) / 4));
    				lastAnimationM = timeNowM;
    			},
    			false
    		);
    	});

    	function hover(index) {
    		$$invalidate(6, inVisibleBlocks = []);
    		inVisibleBlocks.push(index);
    		inVisibleBlocks.push(randomInteger(index, index + 5));
    		inVisibleBlocks.push(randomInteger(index, index - 5));
    		$$invalidate(6, inVisibleBlocks = [...inVisibleBlocks]);
    	}

    	function scroll(e) {
    		let delta;
    		delta = e.wheelDelta || -e.detail;

    		if (isMobile) {
    			touchend = typeof e.pageY !== "undefined" && (e.pageY || e.pageX)
    			? e.pageY
    			: e.touches[0].pageY;

    			delta = touchend - touchstart;
    		}

    		var deltaOfInterest = delta,
    			timeNow = new Date().getTime(),
    			quietPeriod = isMobile ? 200 : 500;

    		// Cancel scroll if currently animating or within quiet period
    		if (timeNow - lastAnimation < quietPeriod + animationTime) {
    			e.preventDefault();
    			return;
    		}

    		if (deltaOfInterest < 0) {
    			current < pagesLength - 1 && $$invalidate(2, current++, current);
    		} else {
    			current > 0 && $$invalidate(2, current--, current);
    		}

    		lastAnimation = timeNow;
    	}

    	function emptySquareBorder(i, p) {
    		const br = "border-right: 2px solid #3f3f3f;";
    		const bb = "border-bottom: 2px solid #3f3f3f;";

    		let borderMap = {
    			7: br,
    			15: p > 0 && p < 5 ? "border-top-color: #2d3031" : "",
    			25: bb,
    			31: "border-right: 2px solid #3f3f3f; border-bottom: 2px solid #3f3f3f;"
    		};

    		if (isMobile) {
    			borderMap = {
    				5: br,
    				11: br,
    				17: br,
    				53: br,
    				59: br,
    				62: bb,
    				63: bb
    			};
    		}

    		return i > 25 && i < 31 ? borderMap[25] : borderMap[i];
    	}

    	function clickJoin(e) {
    		setTimeout(() => $$invalidate(7, showBecomeVolunterBlock = true));
    	}

    	function glitch(node) {
    		setTimeout(() => $$invalidate(9, disableGlitch = true), 2000);
    	}

    	const writable_props = ["pages"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(1, outerWidth = window_1.outerWidth);
    	}

    	const mouseenter_handler = i => hover(i);

    	function div0_elementresize_handler() {
    		containerWidth = this.offsetWidth;
    		containerHeight = this.offsetHeight;
    		$$invalidate(3, containerWidth);
    		$$invalidate(4, containerHeight);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(5, container);
    		});
    	}

    	function slider_current_binding(value) {
    		current = value;
    		$$invalidate(2, current);
    	}

    	const click_handler = () => $$invalidate(2, current = 1);

    	function div0_elementresize_handler_1() {
    		containerHeight = this.offsetHeight;
    		$$invalidate(4, containerHeight);
    	}

    	function slider_current_binding_1(value) {
    		current = value;
    		$$invalidate(2, current);
    	}

    	const click_handler_1 = () => $$invalidate(2, current = 1);

    	function becomevolunteer_show_binding(value) {
    		showBecomeVolunterBlock = value;
    		$$invalidate(7, showBecomeVolunterBlock);
    	}

    	$$self.$$set = $$props => {
    		if ("pages" in $$props) $$invalidate(0, pages = $$props.pages);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Join,
    		Logo,
    		Button,
    		Slider,
    		Socials,
    		BecomeVolunteer,
    		fly,
    		pages,
    		outerWidth,
    		containerWidth,
    		containerHeight,
    		container,
    		touchstart,
    		touchend,
    		current,
    		lastAnimation,
    		lastAnimationM,
    		inVisibleBlocks,
    		showBecomeVolunterBlock,
    		glitchAnimation,
    		disableGlitch,
    		animationTime,
    		animationTimeM,
    		beta,
    		gamma,
    		userAgent,
    		hover,
    		randomInteger,
    		scroll,
    		emptySquareBorder,
    		clickJoin,
    		glitch,
    		pagesLength,
    		isMobile
    	});

    	$$self.$inject_state = $$props => {
    		if ("pages" in $$props) $$invalidate(0, pages = $$props.pages);
    		if ("outerWidth" in $$props) $$invalidate(1, outerWidth = $$props.outerWidth);
    		if ("containerWidth" in $$props) $$invalidate(3, containerWidth = $$props.containerWidth);
    		if ("containerHeight" in $$props) $$invalidate(4, containerHeight = $$props.containerHeight);
    		if ("container" in $$props) $$invalidate(5, container = $$props.container);
    		if ("touchstart" in $$props) touchstart = $$props.touchstart;
    		if ("touchend" in $$props) touchend = $$props.touchend;
    		if ("current" in $$props) $$invalidate(2, current = $$props.current);
    		if ("lastAnimation" in $$props) lastAnimation = $$props.lastAnimation;
    		if ("lastAnimationM" in $$props) lastAnimationM = $$props.lastAnimationM;
    		if ("inVisibleBlocks" in $$props) $$invalidate(6, inVisibleBlocks = $$props.inVisibleBlocks);
    		if ("showBecomeVolunterBlock" in $$props) $$invalidate(7, showBecomeVolunterBlock = $$props.showBecomeVolunterBlock);
    		if ("glitchAnimation" in $$props) $$invalidate(8, glitchAnimation = $$props.glitchAnimation);
    		if ("disableGlitch" in $$props) $$invalidate(9, disableGlitch = $$props.disableGlitch);
    		if ("beta" in $$props) beta = $$props.beta;
    		if ("gamma" in $$props) gamma = $$props.gamma;
    		if ("pagesLength" in $$props) $$invalidate(10, pagesLength = $$props.pagesLength);
    		if ("isMobile" in $$props) $$invalidate(11, isMobile = $$props.isMobile);
    	};

    	let pagesLength;
    	let isMobile;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*pages*/ 1) {
    			 $$invalidate(10, pagesLength = pages.length);
    		}

    		if ($$self.$$.dirty[0] & /*outerWidth*/ 2) {
    			 $$invalidate(11, isMobile = outerWidth < 800 || userAgent.match(/iPad/i) || userAgent.match(/iPhone/i));
    		}

    		if ($$self.$$.dirty[0] & /*current*/ 4) {
    			 {
    				if (current || current == 0) {
    					$$invalidate(8, glitchAnimation = false);
    				}

    				setTimeout(() => $$invalidate(8, glitchAnimation = true));
    			}
    		}
    	};

    	return [
    		pages,
    		outerWidth,
    		current,
    		containerWidth,
    		containerHeight,
    		container,
    		inVisibleBlocks,
    		showBecomeVolunterBlock,
    		glitchAnimation,
    		disableGlitch,
    		pagesLength,
    		isMobile,
    		hover,
    		scroll,
    		emptySquareBorder,
    		clickJoin,
    		glitch,
    		onwindowresize,
    		mouseenter_handler,
    		div0_elementresize_handler,
    		div0_binding,
    		slider_current_binding,
    		click_handler,
    		div0_elementresize_handler_1,
    		slider_current_binding_1,
    		click_handler_1,
    		becomevolunteer_show_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { pages: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pages*/ ctx[0] === undefined && !("pages" in props)) {
    			console.warn("<App> was created without expected prop 'pages'");
    		}
    	}

    	get pages() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pages(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        pages: [
          {
            title: 'Стань диджитал добровольцем',
            subtitle: 'И помогай находить пропавших без вести людей вместе с',
            subtitle_red: 'Liza Alert',
          },
          {
            title: 'есть проблема',
            info: [
              `В ориентировке пропавший изображен в одной одежде,а в графе «во что
        одет»`,
              `описана совсем другая. Люди исчезают неожиданно, и снимкам`,
              `в актуальной одежде взяться неоткуда`,
            ],
          },
          {
            title: 'Одежда - важный элемент образа',
            info: [
              'После быстрой встречи с незнакомым человеком,',
              'ты скорее запомнишь его красную футболку с медведем,',
              'нежели черты лица',
            ],
          },
          {
            title: 'что в итоге ?',
            info: [
              'Противоречие в ориентировке запутывает',
              'и не способствует ни запоминанию, ни поиску пропавшего',
            ],
          },
          {
            title: 'Мы решили исправить ситуацию',
            info: [
              'И начали «переодевать» пропавших в ту одежду, в которой они исчезли.',
              'Это занимает 15-20 минут в графическом редакторе, а результат бесценен!',
            ],
          },
          {
            title: 'Присоединяйся! ',
            info: [
              `          Каждый год в России пропадает около
      <span class="info_red">7О ООО</span>
      человек`,
              'и нам просто не хватает рук. Нужна твоя помощь!',
            ],
          },
        ],
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

var st = (s) => {
  throw TypeError(s);
};
var He = (s, e, t) => e.has(s) || st("Cannot " + t);
var h = (s, e, t) => (He(s, e, "read from private field"), t ? t.call(s) : e.get(s)), w = (s, e, t) => e.has(s) ? st("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), y = (s, e, t, i) => (He(s, e, "write to private field"), i ? i.call(s, t) : e.set(s, t), t), se = (s, e, t) => (He(s, e, "access private method"), t);
var $e = (s, e, t, i) => ({
  set _(r) {
    y(s, e, r, t);
  },
  get _() {
    return h(s, e, i);
  }
});
import { UmbBlockActionBase as Ut, UMB_BLOCK_MANAGER_CONTEXT as Bt } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as mt } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_WORKSPACE_CONTEXT as Rt, UMB_WORKSPACE_CONDITION_ALIAS as it } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as Te } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_DATASET_CONTEXT as Ht } from "@umbraco-cms/backoffice/property";
import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS as Ct } from "@umbraco-cms/backoffice/block-grid";
import { UMB_BLOCK_LIST_TYPE_WORKSPACE_ALIAS as Nt } from "@umbraco-cms/backoffice/block-list";
const qe = "kraftvaerk:toggle-preview";
class Mt extends Ut {
  async execute() {
    d.useBeamFallback = !d.useBeamFallback, window.dispatchEvent(new CustomEvent(qe));
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ge = globalThis, Ge = ge.ShadowRoot && (ge.ShadyCSS === void 0 || ge.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Fe = Symbol(), rt = /* @__PURE__ */ new WeakMap();
let _t = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== Fe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Ge && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = rt.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && rt.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const It = (s) => new _t(typeof s == "string" ? s : s + "", void 0, Fe), bt = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new _t(t, s, Fe);
}, Lt = (s, e) => {
  if (Ge) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), r = ge.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = t.cssText, s.appendChild(i);
  }
}, nt = Ge ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return It(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: qt, defineProperty: Dt, getOwnPropertyDescriptor: Wt, getOwnPropertyNames: xt, getOwnPropertySymbols: Kt, getPrototypeOf: Vt } = Object, W = globalThis, ot = W.trustedTypes, jt = ot ? ot.emptyScript : "", Ce = W.reactiveElementPolyfillSupport, ne = (s, e) => s, ke = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? jt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, Je = (s, e) => !qt(s, e), at = { attribute: !0, type: String, converter: ke, reflect: !1, useDefault: !1, hasChanged: Je };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), W.litPropertyMetadata ?? (W.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Y = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = at) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, t);
      r !== void 0 && Dt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: r, set: n } = Wt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: r, set(o) {
      const a = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(e, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? at;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ne("elementProperties"))) return;
    const e = Vt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ne("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ne("properties"))) {
      const t = this.properties, i = [...xt(t), ...Kt(t)];
      for (const r of i) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, r] of t) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const r = this._$Eu(t, i);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) t.unshift(nt(r));
    } else e !== void 0 && t.push(nt(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Lt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostConnected) == null ? void 0 : i.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostDisconnected) == null ? void 0 : i.call(t);
    });
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    var n;
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : ke).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, o;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = i.getPropertyOptions(r), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : ke;
      this._$Em = r, this[r] = l.fromAttribute(t, a.type) ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(e, t, i) {
    var r;
    if (e !== void 0) {
      const n = this.constructor, o = this[e];
      if (i ?? (i = n.getPropertyOptions(e)), !((i.hasChanged ?? Je)(o, t) || i.useDefault && i.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(e)) && !this.hasAttribute(n._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: r, wrapped: n }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [n, o] of r) {
        const { wrapped: a } = o, l = this[n];
        a !== !0 || this._$AL.has(n) || l === void 0 || this.C(n, void 0, o, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
      }), this.update(t)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((i) => {
      var r;
      return (r = i.hostUpdated) == null ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
Y.elementStyles = [], Y.shadowRootOptions = { mode: "open" }, Y[ne("elementProperties")] = /* @__PURE__ */ new Map(), Y[ne("finalized")] = /* @__PURE__ */ new Map(), Ce == null || Ce({ ReactiveElement: Y }), (W.reactiveElementVersions ?? (W.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = globalThis, Pe = oe.trustedTypes, lt = Pe ? Pe.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, yt = "$lit$", H = `lit$${Math.random().toFixed(9).slice(2)}$`, $t = "?" + H, zt = `<${$t}>`, G = document, ce = () => G.createComment(""), he = (s) => s === null || typeof s != "object" && typeof s != "function", Ye = Array.isArray, Gt = (s) => Ye(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", Ne = `[ 	
\f\r]`, ie = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ct = /-->/g, ht = />/g, x = RegExp(`>|${Ne}(?:([^\\s"'>=/]+)(${Ne}*=${Ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), dt = /'/g, ut = /"/g, vt = /^(?:script|style|textarea|title)$/i, Ft = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), De = Ft(1), F = Symbol.for("lit-noChange"), b = Symbol.for("lit-nothing"), pt = /* @__PURE__ */ new WeakMap(), K = G.createTreeWalker(G, 129);
function gt(s, e) {
  if (!Ye(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return lt !== void 0 ? lt.createHTML(e) : e;
}
const Jt = (s, e) => {
  const t = s.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = ie;
  for (let a = 0; a < t; a++) {
    const l = s[a];
    let u, p, m = -1, g = 0;
    for (; g < l.length && (o.lastIndex = g, p = o.exec(l), p !== null); ) g = o.lastIndex, o === ie ? p[1] === "!--" ? o = ct : p[1] !== void 0 ? o = ht : p[2] !== void 0 ? (vt.test(p[2]) && (r = RegExp("</" + p[2], "g")), o = x) : p[3] !== void 0 && (o = x) : o === x ? p[0] === ">" ? (o = r ?? ie, m = -1) : p[1] === void 0 ? m = -2 : (m = o.lastIndex - p[2].length, u = p[1], o = p[3] === void 0 ? x : p[3] === '"' ? ut : dt) : o === ut || o === dt ? o = x : o === ct || o === ht ? o = ie : (o = x, r = void 0);
    const U = o === x && s[a + 1].startsWith("/>") ? " " : "";
    n += o === ie ? l + zt : m >= 0 ? (i.push(u), l.slice(0, m) + yt + l.slice(m) + H + U) : l + H + (m === -2 ? a : U);
  }
  return [gt(s, n + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class de {
  constructor({ strings: e, _$litType$: t }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = e.length - 1, l = this.parts, [u, p] = Jt(e, t);
    if (this.el = de.createElement(u, i), K.currentNode = this.el.content, t === 2 || t === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (r = K.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const m of r.getAttributeNames()) if (m.endsWith(yt)) {
          const g = p[o++], U = r.getAttribute(m).split(H), ye = /([.?@])?(.*)/.exec(g);
          l.push({ type: 1, index: n, name: ye[2], strings: U, ctor: ye[1] === "." ? Xt : ye[1] === "?" ? Qt : ye[1] === "@" ? Zt : Be }), r.removeAttribute(m);
        } else m.startsWith(H) && (l.push({ type: 6, index: n }), r.removeAttribute(m));
        if (vt.test(r.tagName)) {
          const m = r.textContent.split(H), g = m.length - 1;
          if (g > 0) {
            r.textContent = Pe ? Pe.emptyScript : "";
            for (let U = 0; U < g; U++) r.append(m[U], ce()), K.nextNode(), l.push({ type: 2, index: ++n });
            r.append(m[g], ce());
          }
        }
      } else if (r.nodeType === 8) if (r.data === $t) l.push({ type: 2, index: n });
      else {
        let m = -1;
        for (; (m = r.data.indexOf(H, m + 1)) !== -1; ) l.push({ type: 7, index: n }), m += H.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = G.createElement("template");
    return i.innerHTML = e, i;
  }
}
function ee(s, e, t = s, i) {
  var o, a;
  if (e === F) return e;
  let r = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const n = he(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = r : t._$Cl = r), r !== void 0 && (e = ee(s, r._$AS(s, e.values), r, i)), e;
}
class Yt {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? G).importNode(t, !0);
    K.currentNode = r;
    let n = K.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let u;
        l.type === 2 ? u = new _e(n, n.nextSibling, this, e) : l.type === 1 ? u = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (u = new es(n, this, e)), this._$AV.push(u), l = i[++a];
      }
      o !== (l == null ? void 0 : l.index) && (n = K.nextNode(), o++);
    }
    return K.currentNode = G, r;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class _e {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, r) {
    this.type = 2, this._$AH = b, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = ee(this, e, t), he(e) ? e === b || e == null || e === "" ? (this._$AH !== b && this._$AR(), this._$AH = b) : e !== this._$AH && e !== F && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Gt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== b && he(this._$AH) ? this._$AA.nextSibling.data = e : this.T(G.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = de.createElement(gt(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(t);
    else {
      const o = new Yt(r, this), a = o.u(this.options);
      o.p(t), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = pt.get(e.strings);
    return t === void 0 && pt.set(e.strings, t = new de(e)), t;
  }
  k(e) {
    Ye(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, r = 0;
    for (const n of e) r === t.length ? t.push(i = new _e(this.O(ce()), this.O(ce()), this, this.options)) : i = t[r], i._$AI(n), r++;
    r < t.length && (this._$AR(i && i._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e && e !== this._$AB; ) {
      const r = e.nextSibling;
      e.remove(), e = r;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class Be {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, r, n) {
    this.type = 1, this._$AH = b, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = b;
  }
  _$AI(e, t = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = ee(this, e, t, 0), o = !he(e) || e !== this._$AH && e !== F, o && (this._$AH = e);
    else {
      const a = e;
      let l, u;
      for (e = n[0], l = 0; l < n.length - 1; l++) u = ee(this, a[i + l], t, l), u === F && (u = this._$AH[l]), o || (o = !he(u) || u !== this._$AH[l]), u === b ? e = b : e !== b && (e += (u ?? "") + n[l + 1]), this._$AH[l] = u;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === b ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Xt extends Be {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === b ? void 0 : e;
  }
}
class Qt extends Be {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== b);
  }
}
class Zt extends Be {
  constructor(e, t, i, r, n) {
    super(e, t, i, r, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = ee(this, e, t, 0) ?? b) === F) return;
    const i = this._$AH, r = e === b && i !== b || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== b && (i === b || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class es {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ee(this, e);
  }
}
const Me = oe.litHtmlPolyfillSupport;
Me == null || Me(de, _e), (oe.litHtmlVersions ?? (oe.litHtmlVersions = [])).push("3.3.0");
const ts = (s, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = r = new _e(e.insertBefore(ce(), n), n, void 0, t ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis;
let we = class extends Y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ts(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return F;
  }
};
var ft;
we._$litElement$ = !0, we.finalized = !0, (ft = z.litElementHydrateSupport) == null || ft.call(z, { LitElement: we });
const Ie = z.litElementPolyfillSupport;
Ie == null || Ie({ LitElement: we });
(z.litElementVersions ?? (z.litElementVersions = [])).push("4.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wt = (s) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(s, e);
  }) : customElements.define(s, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ss = { attribute: !0, type: String, converter: ke, reflect: !1, hasChanged: Je }, is = (s = ss, e, t) => {
  const { kind: i, metadata: r } = t;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), n.set(t.name, s), i === "accessor") {
    const { name: o } = t;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(o, l, s);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, s, a), a;
    } };
  }
  if (i === "setter") {
    const { name: o } = t;
    return function(a) {
      const l = this[o];
      e.call(this, a), this.requestUpdate(o, l, s);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function $(s) {
  return (e, t) => typeof t == "object" ? is(s, e, t) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function rs(s) {
  return $({ ...s, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ns = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, os = (s) => (...e) => ({ _$litDirective$: s, values: e });
class as {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, i) {
    this._$Ct = e, this._$AM = t, this._$Ci = i;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class We extends as {
  constructor(e) {
    if (super(e), this.it = b, e.type !== ns.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(e) {
    if (e === b || e == null) return this._t = void 0, this.it = e;
    if (e === F) return e;
    if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (e === this.it) return this._t;
    this.it = e;
    const t = [e];
    return t.raw = t, this._t = { _$litType$: this.constructor.resultType, strings: t, values: [] };
  }
}
We.directiveName = "unsafeHTML", We.resultType = 1;
const ls = os(We);
class cs {
  constructor(e) {
    this.config = e;
  }
}
class xe extends Error {
  constructor(e, t, i) {
    super(i), this.name = "ApiError", this.url = t.url, this.status = t.status, this.statusText = t.statusText, this.body = t.body, this.request = e;
  }
}
class Et extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var S, T, A, M, V, Z, I;
class hs {
  constructor(e) {
    w(this, S);
    w(this, T);
    w(this, A);
    w(this, M);
    w(this, V);
    w(this, Z);
    w(this, I);
    y(this, S, !1), y(this, T, !1), y(this, A, !1), y(this, M, []), y(this, V, new Promise((t, i) => {
      y(this, Z, t), y(this, I, i);
      const r = (a) => {
        h(this, S) || h(this, T) || h(this, A) || (y(this, S, !0), h(this, Z) && h(this, Z).call(this, a));
      }, n = (a) => {
        h(this, S) || h(this, T) || h(this, A) || (y(this, T, !0), h(this, I) && h(this, I).call(this, a));
      }, o = (a) => {
        h(this, S) || h(this, T) || h(this, A) || h(this, M).push(a);
      };
      return Object.defineProperty(o, "isResolved", {
        get: () => h(this, S)
      }), Object.defineProperty(o, "isRejected", {
        get: () => h(this, T)
      }), Object.defineProperty(o, "isCancelled", {
        get: () => h(this, A)
      }), e(r, n, o);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, t) {
    return h(this, V).then(e, t);
  }
  catch(e) {
    return h(this, V).catch(e);
  }
  finally(e) {
    return h(this, V).finally(e);
  }
  cancel() {
    if (!(h(this, S) || h(this, T) || h(this, A))) {
      if (y(this, A, !0), h(this, M).length)
        try {
          for (const e of h(this, M))
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      h(this, M).length = 0, h(this, I) && h(this, I).call(this, new Et("Request aborted"));
    }
  }
  get isCancelled() {
    return h(this, A);
  }
}
S = new WeakMap(), T = new WeakMap(), A = new WeakMap(), M = new WeakMap(), V = new WeakMap(), Z = new WeakMap(), I = new WeakMap();
const Xe = (s) => s != null, be = (s) => typeof s == "string", Le = (s) => be(s) && s !== "", Qe = (s) => typeof s == "object" && typeof s.type == "string" && typeof s.stream == "function" && typeof s.arrayBuffer == "function" && typeof s.constructor == "function" && typeof s.constructor.name == "string" && /^(Blob|File)$/.test(s.constructor.name) && /^(Blob|File)$/.test(s[Symbol.toStringTag]), At = (s) => s instanceof FormData, ds = (s) => {
  try {
    return btoa(s);
  } catch {
    return Buffer.from(s).toString("base64");
  }
}, us = (s) => {
  const e = [], t = (r, n) => {
    e.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(n))}`);
  }, i = (r, n) => {
    Xe(n) && (Array.isArray(n) ? n.forEach((o) => {
      i(r, o);
    }) : typeof n == "object" ? Object.entries(n).forEach(([o, a]) => {
      i(`${r}[${o}]`, a);
    }) : t(r, n));
  };
  return Object.entries(s).forEach(([r, n]) => {
    i(r, n);
  }), e.length > 0 ? `?${e.join("&")}` : "";
}, ps = (s, e) => {
  const t = s.ENCODE_PATH || encodeURI, i = e.url.replace("{api-version}", s.VERSION).replace(/{(.*?)}/g, (n, o) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(o) ? t(String(e.path[o])) : n;
  }), r = `${s.BASE}${i}`;
  return e.query ? `${r}${us(e.query)}` : r;
}, fs = (s) => {
  if (s.formData) {
    const e = new FormData(), t = (i, r) => {
      be(r) || Qe(r) ? e.append(i, r) : e.append(i, JSON.stringify(r));
    };
    return Object.entries(s.formData).filter(([i, r]) => Xe(r)).forEach(([i, r]) => {
      Array.isArray(r) ? r.forEach((n) => t(i, n)) : t(i, r);
    }), e;
  }
}, ve = async (s, e) => typeof e == "function" ? e(s) : e, ms = async (s, e) => {
  const [t, i, r, n] = await Promise.all([
    ve(e, s.TOKEN),
    ve(e, s.USERNAME),
    ve(e, s.PASSWORD),
    ve(e, s.HEADERS)
  ]), o = Object.entries({
    Accept: "application/json",
    ...n,
    ...e.headers
  }).filter(([a, l]) => Xe(l)).reduce((a, [l, u]) => ({
    ...a,
    [l]: String(u)
  }), {});
  if (Le(t) && (o.Authorization = `Bearer ${t}`), Le(i) && Le(r)) {
    const a = ds(`${i}:${r}`);
    o.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? o["Content-Type"] = e.mediaType : Qe(e.body) ? o["Content-Type"] = e.body.type || "application/octet-stream" : be(e.body) ? o["Content-Type"] = "text/plain" : At(e.body) || (o["Content-Type"] = "application/json")), new Headers(o);
}, _s = (s) => {
  var e;
  if (s.body !== void 0)
    return (e = s.mediaType) != null && e.includes("/json") ? JSON.stringify(s.body) : be(s.body) || Qe(s.body) || At(s.body) ? s.body : JSON.stringify(s.body);
}, bs = async (s, e, t, i, r, n, o) => {
  const a = new AbortController(), l = {
    headers: n,
    body: i ?? r,
    method: e.method,
    signal: a.signal
  };
  return s.WITH_CREDENTIALS && (l.credentials = s.CREDENTIALS), o(() => a.abort()), await fetch(t, l);
}, ys = (s, e) => {
  if (e) {
    const t = s.headers.get(e);
    if (be(t))
      return t;
  }
}, $s = async (s) => {
  if (s.status !== 204)
    try {
      const e = s.headers.get("Content-Type");
      if (e)
        return ["application/json", "application/problem+json"].some((r) => e.toLowerCase().startsWith(r)) ? await s.json() : await s.text();
    } catch (e) {
      console.error(e);
    }
}, vs = (s, e) => {
  const i = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    ...s.errors
  }[e.status];
  if (i)
    throw new xe(s, e, i);
  if (!e.ok) {
    const r = e.status ?? "unknown", n = e.statusText ?? "unknown", o = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new xe(
      s,
      e,
      `Generic Error: status: ${r}; status text: ${n}; body: ${o}`
    );
  }
}, gs = (s, e) => new hs(async (t, i, r) => {
  try {
    const n = ps(s, e), o = fs(e), a = _s(e), l = await ms(s, e);
    if (!r.isCancelled) {
      const u = await bs(s, e, n, a, o, l, r), p = await $s(u), m = ys(u, e.responseHeader), g = {
        url: n,
        ok: u.ok,
        status: u.status,
        statusText: u.statusText,
        body: m ?? p
      };
      vs(e, g), t(g.body);
    }
  } catch (n) {
    i(n);
  }
});
class ws extends cs {
  constructor(e) {
    super(e);
  }
  /**
   * Request method
   * @param options The request options from the service
   * @returns CancelablePromise<T>
   * @throws ApiError
   */
  request(e) {
    return gs(this.config, e);
  }
}
class Es {
  constructor(e) {
    this.httpRequest = e;
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  optionsApiV1KraftvaerkUmbracoHeadlessBlockpreview() {
    return this.httpRequest.request({
      method: "OPTIONS",
      url: "/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
    requestBody: e
  }) {
    return this.httpRequest.request({
      method: "POST",
      url: "/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/",
      body: e,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        500: "Internal Server Error"
      }
    });
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  getApiV1KraftvaerkUmbracoHeadlessBlockpreview({
    id: e
  }) {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/",
      query: {
        id: e
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns any OK
   * @throws ApiError
   */
  getApiV1KraftvaerkUmbracoHeadlessBlockpreviewSettings() {
    return this.httpRequest.request({
      method: "GET",
      url: "/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/settings",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @returns string OK
   * @throws ApiError
   */
  putApiV1KraftvaerkUmbracoHeadlessBlockpreview({
    requestBody: e
  }) {
    return this.httpRequest.request({
      method: "PUT",
      url: "/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/",
      body: e,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
}
class ue {
  constructor(e, t = ws) {
    this.request = new t({
      BASE: (e == null ? void 0 : e.BASE) ?? "",
      VERSION: (e == null ? void 0 : e.VERSION) ?? "1.0",
      WITH_CREDENTIALS: (e == null ? void 0 : e.WITH_CREDENTIALS) ?? !1,
      CREDENTIALS: (e == null ? void 0 : e.CREDENTIALS) ?? "include",
      TOKEN: e == null ? void 0 : e.TOKEN,
      USERNAME: e == null ? void 0 : e.USERNAME,
      PASSWORD: e == null ? void 0 : e.PASSWORD,
      HEADERS: e == null ? void 0 : e.HEADERS,
      ENCODE_PATH: e == null ? void 0 : e.ENCODE_PATH
    }), this.kraftvaerkUmbracoHeadlessBlockpreviewApiV1 = new Es(this.request);
  }
}
class Ze extends Error {
  constructor() {
    super("Preview request superseded"), this.name = "StalePreviewError";
  }
}
var L, P, j, O, St, Tt, Ke;
class As {
  constructor(e = 6) {
    w(this, O);
    w(this, L);
    w(this, P, 0);
    w(this, j, []);
    y(this, L, Math.max(1, e));
  }
  get maxConcurrent() {
    return h(this, L);
  }
  set maxConcurrent(e) {
    y(this, L, Math.max(1, Math.floor(e) || 1)), se(this, O, Ke).call(this);
  }
  get active() {
    return h(this, P);
  }
  get pending() {
    return h(this, j).length;
  }
  /**
   * Runs `task` when a slot is free. If `isStale()` reports true by then the task is skipped
   * and the returned promise rejects with StalePreviewError.
   */
  async run(e, t) {
    await se(this, O, St).call(this);
    try {
      if (t != null && t()) throw new Ze();
      return await e();
    } finally {
      se(this, O, Tt).call(this);
    }
  }
}
L = new WeakMap(), P = new WeakMap(), j = new WeakMap(), O = new WeakSet(), St = function() {
  return h(this, P) < h(this, L) ? ($e(this, P)._++, Promise.resolve()) : new Promise((e) => {
    h(this, j).push(() => {
      $e(this, P)._++, e();
    });
  });
}, Tt = function() {
  $e(this, P)._--, se(this, O, Ke).call(this);
}, Ke = function() {
  for (; h(this, P) < h(this, L) && h(this, j).length > 0; ) {
    const e = h(this, j).shift();
    e == null || e();
  }
};
var Ss = Object.defineProperty, Ts = Object.getOwnPropertyDescriptor, kt = (s) => {
  throw TypeError(s);
}, v = (s, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? Ts(e, t) : e, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && Ss(e, t, r), r;
}, et = (s, e, t) => e.has(s) || kt("Cannot " + t), c = (s, e, t) => (et(s, e, "read from private field"), e.get(s)), _ = (s, e, t) => e.has(s) ? kt("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), f = (s, e, t, i) => (et(s, e, "write to private field"), e.set(s, t), t), k = (s, e, t) => (et(s, e, "access private method"), t), ks = (s, e, t, i) => ({
  set _(r) {
    f(s, e, r);
  },
  get _() {
    return c(s, e);
  }
}), R, q, D, C, pe, Ee, Oe, X, re, B, Q, ae, le, fe, Ue, Ae, N, me, J, Se, E, Ve, je, tt, Pt, Re;
const Ps = "umb-headless-preview", ze = "blockbeam";
let d = class extends mt {
  constructor() {
    super(), _(this, E), _(this, R, null), _(this, q), _(this, D), _(this, C), _(this, pe), _(this, Ee), _(this, Oe), _(this, X), _(this, re, !1), _(this, B), _(this, Q, !1), _(this, ae, !1), _(this, le, !1), _(this, fe), _(this, Ue), _(this, Ae), _(this, N, !1), _(this, me, 0), _(this, J), _(this, Se, () => this.requestUpdate()), f(this, Ue, new Promise((s) => {
      f(this, Ae, s);
    })), this.init();
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener(qe, c(this, Se)), c(this, N) && !c(this, J) && c(this, C) === d.loadingBarHtml && k(this, E, Re).call(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener(qe, c(this, Se)), clearTimeout(c(this, pe)), clearTimeout(c(this, Ee)), k(this, E, tt).call(this);
  }
  updated(s) {
    super.updated(s), c(this, N) && (c(this, q) !== this.content || c(this, D) !== this.settings) && k(this, E, je).call(this);
  }
  render() {
    var s, e, t, i, r, n;
    return c(this, B) || f(this, B, d.blockSettings.find((o) => {
      var a;
      return o.id == ((a = this.blockType) == null ? void 0 : a.contentElementTypeKey);
    })), c(this, q) || f(this, q, this.content), c(this, D) || f(this, D, this.settings), d.useBeamFallback || c(this, C) === ze || c(this, re) && !((s = c(this, B)) != null && s.enabledNested) || !((e = c(this, B)) != null && e.enabledGrid) && c(this, Q) || !((t = c(this, B)) != null && t.enabledList) && c(this, ae) || !((i = c(this, B)) != null && i.enabledRTE) && c(this, le) || c(this, X) ? this.blockBeam(c(this, X)) : De`<div class="__headless-preview"><a href=${((r = this.config) != null && r.showContentEdit ? (n = this.config) == null ? void 0 : n.editContentPath : void 0) ?? ""}>${ls(c(this, C))}</a></div>`;
  }
  async init() {
    f(this, C, d.loadingBarHtml), this.consumeContext(Bt, (s) => {
      var t;
      f(this, Oe, (t = s == null ? void 0 : s.getVariantId()) == null ? void 0 : t.culture);
      const e = s == null ? void 0 : s.getHostElement().tagName;
      f(this, Q, e === "UMB-PROPERTY-EDITOR-UI-BLOCK-GRID"), f(this, ae, e === "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST"), f(this, le, e === "UMB-PROPERTY-EDITOR-UI-TIPTAP");
    }), this.consumeContext(Te, (s) => {
      s && (f(this, fe, s), c(this, Ae).call(this));
    }), this.consumeContext(Rt, (s) => {
      const e = s == null ? void 0 : s.getUnique();
      s && f(this, re, !1), c(this, N) ? e !== c(this, R) && (f(this, R, e), k(this, E, je).call(this)) : (f(this, R, e), k(this, E, Ve).call(this));
    }), f(this, Ee, window.setTimeout(() => {
      c(this, N) || ((c(this, R) === null || c(this, R) === void 0) && f(this, re, !0), k(this, E, Ve).call(this));
    }, d.readinessDelayMs));
  }
  resolveLabel(s) {
    if (!s) return "error";
    if (!this.content) return s;
    const e = this.content;
    return s.replace(/\{[=+!]([^}]+)\}/g, (t, i) => {
      const r = e == null ? void 0 : e[i];
      return r != null && r !== "" ? String(r) : "";
    });
  }
  blockBeam(s) {
    return De`
    <uui-ref-node .name=${this.resolveLabel(this.label)} .detail=${s ?? ""} title=${s ?? ""} standalone="">
      <uui-icon slot="icon" .name=${this.icon ?? "icon-plugin"} style="--uui-icon-color:var(--uui-palette-maroon-flush);"></uui-icon>
     </uui-ref-node>`;
  }
};
R = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
D = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
pe = /* @__PURE__ */ new WeakMap();
Ee = /* @__PURE__ */ new WeakMap();
Oe = /* @__PURE__ */ new WeakMap();
X = /* @__PURE__ */ new WeakMap();
re = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
Q = /* @__PURE__ */ new WeakMap();
ae = /* @__PURE__ */ new WeakMap();
le = /* @__PURE__ */ new WeakMap();
fe = /* @__PURE__ */ new WeakMap();
Ue = /* @__PURE__ */ new WeakMap();
Ae = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
me = /* @__PURE__ */ new WeakMap();
J = /* @__PURE__ */ new WeakMap();
Se = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakSet();
Ve = function() {
  c(this, N) || (f(this, N, !0), f(this, q, this.content), f(this, D, this.settings), k(this, E, Re).call(this));
};
je = function() {
  clearTimeout(c(this, pe)), f(this, pe, window.setTimeout(() => {
    f(this, q, this.content), f(this, D, this.settings), k(this, E, Re).call(this);
  }, d.editDebounceMs));
};
tt = function() {
  var s;
  ks(this, me)._++, (s = c(this, J)) == null || s.cancel(), f(this, J, void 0);
};
Pt = function() {
  return c(this, ae) ? "list" : c(this, le) ? "rte" : "grid";
};
Re = async function() {
  var r, n;
  k(this, E, tt).call(this);
  const s = c(this, me), e = () => s !== c(this, me), t = this.layout, i = {
    id: c(this, R),
    contentType: (r = this.blockType) == null ? void 0 : r.contentElementTypeKey,
    settingsType: ((n = this.blockType) == null ? void 0 : n.settingsElementTypeKey) ?? "",
    content: JSON.stringify(c(this, q)),
    settings: JSON.stringify(c(this, D) ?? {}),
    culture: c(this, Oe),
    editor: k(this, E, Pt).call(this),
    contentKey: this.contentKey ?? null,
    columnSpan: c(this, Q) ? (t == null ? void 0 : t.columnSpan) ?? null : null,
    rowSpan: c(this, Q) ? (t == null ? void 0 : t.rowSpan) ?? null : null
  };
  try {
    if (await c(this, Ue), e()) return;
    const o = await d.queue.run(async () => {
      var p, m;
      const a = await ((p = c(this, fe)) == null ? void 0 : p.getLatestToken());
      if (!a) throw new Error("Not authenticated");
      if (e()) throw new Ze();
      const u = new ue({
        BASE: ((m = c(this, fe)) == null ? void 0 : m.getServerUrl()) ?? "",
        TOKEN: a
      }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
        requestBody: i
      });
      return f(this, J, u), await u;
    }, e);
    if (e()) return;
    f(this, C, o.html ?? ze), f(this, X, void 0);
  } catch (o) {
    if (e() || Os(o)) return;
    f(this, C, ze), f(this, X, Us(o));
  } finally {
    e() || f(this, J, void 0);
  }
  this.requestUpdate();
};
d.useBeamFallback = !1;
d.loadingBarHtml = `
    <uui-ref-node name="Loading preview..." detail="" standalone href="">
      <uui-icon slot="icon" name="icon-plugin"></uui-icon>
      <uui-loader-bar style="color: #006eff;"></uui-loader-bar>
    </uui-ref-node>
  `;
d.blockSettings = [];
d.queue = new As(6);
d.readinessDelayMs = 500;
d.editDebounceMs = 150;
d.styles = [
  bt`
      .__headless-preview {
        border: 2px solid transparent;
        box-sizing: border-box;
        transition: border-color 0.2s ease-in-out;
        height: 100%;
      }
      .__headless-preview > a:first-of-type {
        display: flex;
        width: 100%;
        height: 100%;
      }
      .__headless-preview:hover {
        border: 2px solid var(--uui-palette-malibu);
      }

      .__block-preview {
        width: 100%;
        pointer-events: none;
      }
    `
];
v([
  $({ attribute: !1 })
], d.prototype, "content", 2);
v([
  $({ attribute: !1 })
], d.prototype, "settings", 2);
v([
  $({ attribute: !1 })
], d.prototype, "blockType", 2);
v([
  $({ attribute: !1 })
], d.prototype, "label", 2);
v([
  $({ attribute: !1 })
], d.prototype, "icon", 2);
v([
  $({ attribute: !1 })
], d.prototype, "config", 2);
v([
  $({ attribute: !1 })
], d.prototype, "contentKey", 2);
v([
  $({ attribute: !1 })
], d.prototype, "layout", 2);
v([
  $({ attribute: !1 })
], d.prototype, "contentInvalid", 2);
v([
  $({ attribute: !1 })
], d.prototype, "settingsInvalid", 2);
v([
  $({ attribute: !1 })
], d.prototype, "unsupported", 2);
v([
  $({ attribute: !1 })
], d.prototype, "unpublished", 2);
d = v([
  wt(Ps)
], d);
function Os(s) {
  return s instanceof Ze || s instanceof Et ? !0 : s instanceof Error && s.name === "AbortError";
}
function Us(s) {
  if (s instanceof xe) {
    const e = s.body;
    if (e && typeof e == "object") {
      const t = e.detail ?? e.title;
      if (t) return e.correlationId ? `${t} [${e.correlationId}]` : t;
    }
    return `${s.status} ${s.statusText || s.message}`.trim();
  }
  return s instanceof Error ? s.message : String(s);
}
var Bs = Object.defineProperty, Rs = Object.getOwnPropertyDescriptor, Ot = (s, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? Rs(e, t) : e, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && Bs(e, t, r), r;
};
const Hs = "umb-headless-preview-workspace-view";
let te = class extends mt {
  constructor() {
    super(), this.model = {
      id: "",
      enabled: !1,
      enabledNested: !1,
      enabledList: !1,
      enabledGrid: !1,
      enabledRTE: !1,
      advancedSettings: ""
    }, this.consumeContext(Ht, async (s) => {
      const e = s == null ? void 0 : s.getUnique();
      e && (this.model.id = e, await this.loadInitialState());
    });
  }
  async loadInitialState() {
    try {
      this.consumeContext(Te, async (s) => {
        const e = await (s == null ? void 0 : s.getLatestToken()) ?? "", t = (s == null ? void 0 : s.getServerUrl()) ?? "", r = await new ue({
          BASE: t,
          TOKEN: e
        }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.getApiV1KraftvaerkUmbracoHeadlessBlockpreview({
          id: this.model.id
        });
        this.model = {
          ...this.model,
          ...r
        };
      });
    } catch (s) {
      console.error("Error while fetching preview state", s);
    }
  }
  async updateModel(s) {
    this.model = { ...this.model, ...s }, this.consumeContext(Te, async (e) => {
      const t = await (e == null ? void 0 : e.getLatestToken()) ?? "", i = (e == null ? void 0 : e.getServerUrl()) ?? "";
      await new ue({
        BASE: i,
        TOKEN: t
      }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.putApiV1KraftvaerkUmbracoHeadlessBlockpreview({
        requestBody: this.model
      });
    });
  }
  handleMainToggle(s) {
    const e = s.target.checked;
    this.updateModel({
      enabled: e,
      enabledList: e,
      enabledGrid: e,
      enabledRTE: e
    });
  }
  handleSubToggle(s) {
    return (e) => {
      const t = e.target.checked;
      this.updateModel({ [s]: t });
    };
  }
  handleNestedToggle(s) {
    const e = s.target.checked;
    this.updateModel({ enabledNested: e });
  }
  /*
    private handleAdvancedSettingsChange(e: Event) {
      const advancedSettings = (e.target as HTMLTextAreaElement).value;
      this.updateModel({ advancedSettings });
    }
  */
  render() {
    return De`
      <uui-box headline="Workspace View">
        <uui-label>Enabled</uui-label>

        <uui-toggle
          label="Headless Block Preview"
          .checked=${this.model.enabled}
          @change=${this.handleMainToggle}>
        </uui-toggle>

        <div class="sub-toggle">
          <uui-label>Enabled for Block List</uui-label>
          <uui-toggle
            label="Enable for List"
            .checked=${this.model.enabledList}
            ?disabled=${!this.model.enabled}
            @change=${this.handleSubToggle("enabledList")}>
          </uui-toggle>

          <uui-label>Enabled for Block Grid</uui-label>
          <uui-toggle
            label="Enable for Grid"
            .checked=${this.model.enabledGrid}
            ?disabled=${!this.model.enabled}
            @change=${this.handleSubToggle("enabledGrid")}>
          </uui-toggle>

          <uui-label>Enabled for Rich Text Editor</uui-label>
          <uui-toggle
            label="Enable for RTE"
            .checked=${this.model.enabledRTE}
            ?disabled=${!this.model.enabled}
            @change=${this.handleSubToggle("enabledRTE")}>
          </uui-toggle>
        </div>

        <div class="advanced">
          <uui-label>Advanced Settings</uui-label>
          <hr />
          <uui-label>Enable Nested Preview</uui-label>
          <uui-toggle
            label="Enable Nested Blocks"
            .checked=${this.model.enabledNested}
            @change=${this.handleNestedToggle}>
          </uui-toggle>
        </div>
      </uui-box>
    `;
  }
};
te.styles = [
  bt`
      uui-toggle,
      uui-textarea {
        margin-top: var(--uui-size-space-3);
      }

      .sub-toggle {
        margin-left: var(--uui-size-space-3);
        display: block;
      }

      .advanced {
        margin-top: var(--uui-size-space-5);
      }

      .advanced p {
        font-size: 0.875rem;
        color: var(--uui-color-text-secondary);
        margin: 0;
      }
    `
];
Ot([
  rs()
], te.prototype, "model", 2);
te = Ot([
  wt(Hs)
], te);
const Fs = async (s, e) => {
  s.consumeContext(Te, async (t) => {
    const i = await (t == null ? void 0 : t.getLatestToken()) ?? "", r = (t == null ? void 0 : t.getServerUrl()) ?? "", n = await Cs(r, i);
    d.blockSettings = n, await Ns(r, i);
    const o = {
      alias: "Kraftvaerk.Umbraco.Headless.BlockPreview",
      name: "Umbraco Community Headless Block Preview",
      type: "blockEditorCustomView",
      element: d,
      forContentTypeAlias: n.filter((p) => p.enabled && p.alias).map((p) => p.alias) ?? []
    }, a = {
      type: "workspaceView",
      alias: "umb.workspaceView.headlessPreviewGrid",
      name: "Headless Preview",
      element: te,
      weight: 1100,
      meta: {
        label: "Block Preview",
        pathname: "preview",
        icon: "icon-settings"
      },
      conditions: [
        {
          alias: it,
          match: Ct
        }
      ]
    }, l = {
      type: "workspaceView",
      alias: "umb.workspaceView.headlessPreviewList",
      name: "Headless Preview",
      element: te,
      weight: 1100,
      meta: {
        label: "Block Preview",
        pathname: "preview",
        icon: "icon-settings"
      },
      conditions: [
        {
          alias: it,
          match: Nt
        }
      ]
    }, u = {
      type: "blockAction",
      kind: "default",
      alias: "Kraftvaerk.Umbraco.Headless.BlockPreview.ToggleAction",
      name: "Toggle Headless Preview",
      api: Mt,
      forContentTypeAlias: n.filter((p) => p.enabled && p.alias).map((p) => p.alias),
      meta: {
        icon: "icon-plugin",
        label: "Toggle Preview"
      }
    };
    e.register(o), e.register(u), e.register(a), e.register(l);
  });
};
async function Cs(s, e) {
  Ms();
  try {
    const i = await new ue({ BASE: s, TOKEN: e }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.optionsApiV1KraftvaerkUmbracoHeadlessBlockpreview();
    return console.debug("Headless BlockPreview: enabled blocks", i), i;
  } catch (t) {
    return console.error("Headless BlockPreview: could not load enabled blocks", t), [];
  }
}
async function Ns(s, e) {
  try {
    const i = await new ue({ BASE: s, TOKEN: e }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.getApiV1KraftvaerkUmbracoHeadlessBlockpreviewSettings();
    i != null && i.maxConcurrentPreviews && (d.queue.maxConcurrent = i.maxConcurrentPreviews), console.debug("Headless BlockPreview: settings", i);
  } catch (t) {
    console.debug("Headless BlockPreview: settings endpoint unavailable, using defaults", t);
  }
}
async function Ms() {
  const s = "/App_Plugins/global/global.css";
  try {
    if ((await fetch(s, { method: "HEAD" })).ok) {
      const t = document.createElement("link");
      t.rel = "stylesheet", t.href = s, document.head.appendChild(t);
    }
  } catch {
  }
}
export {
  Fs as onInit
};
//# sourceMappingURL=dist.js.map

var Be = (s) => {
  throw TypeError(s);
};
var Ne = (s, e, t) => e.has(s) || Be("Cannot " + t);
var c = (s, e, t) => (Ne(s, e, "read from private field"), t ? t.call(s) : e.get(s)), k = (s, e, t) => e.has(s) ? Be("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), y = (s, e, t, i) => (Ne(s, e, "write to private field"), i ? i.call(s, t) : e.set(s, t), t);
import { UmbBlockActionBase as ot, UMB_BLOCK_MANAGER_CONTEXT as at } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as Fe } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_WORKSPACE_CONTEXT as lt, UMB_WORKSPACE_CONDITION_ALIAS as Ce } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as de } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_DATASET_CONTEXT as ct } from "@umbraco-cms/backoffice/property";
import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS as ht } from "@umbraco-cms/backoffice/block-grid";
import { UMB_BLOCK_LIST_TYPE_WORKSPACE_ALIAS as dt } from "@umbraco-cms/backoffice/block-list";
const Ee = "kraftvaerk:toggle-preview";
class ut extends ot {
  async execute() {
    f.useBeamFallback = !f.useBeamFallback, window.dispatchEvent(new CustomEvent(Ee));
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ie = globalThis, Te = ie.ShadowRoot && (ie.ShadyCSS === void 0 || ie.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ke = Symbol(), Ie = /* @__PURE__ */ new WeakMap();
let Je = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ke) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Te && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = Ie.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Ie.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const pt = (s) => new Je(typeof s == "string" ? s : s + "", void 0, ke), Ye = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new Je(t, s, ke);
}, ft = (s, e) => {
  if (Te) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), r = ie.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = t.cssText, s.appendChild(i);
  }
}, Le = Te ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return pt(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: mt, defineProperty: _t, getOwnPropertyDescriptor: $t, getOwnPropertyNames: bt, getOwnPropertySymbols: yt, getPrototypeOf: vt } = Object, B = globalThis, Me = B.trustedTypes, gt = Me ? Me.emptyScript : "", $e = B.reactiveElementPolyfillSupport, F = (s, e) => s, ue = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? gt : null;
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
} }, Pe = (s, e) => !mt(s, e), De = { attribute: !0, type: String, converter: ue, reflect: !1, useDefault: !1, hasChanged: Pe };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), B.litPropertyMetadata ?? (B.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let V = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = De) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, t);
      r !== void 0 && _t(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: r, set: n } = $t(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? De;
  }
  static _$Ei() {
    if (this.hasOwnProperty(F("elementProperties"))) return;
    const e = vt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(F("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(F("properties"))) {
      const t = this.properties, i = [...bt(t), ...yt(t)];
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
      for (const r of i) t.unshift(Le(r));
    } else e !== void 0 && t.push(Le(e));
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
    return ft(e, this.constructor.elementStyles), e;
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
      const o = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : ue).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, o;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = i.getPropertyOptions(r), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : ue;
      this._$Em = r, this[r] = l.fromAttribute(t, a.type) ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(e, t, i) {
    var r;
    if (e !== void 0) {
      const n = this.constructor, o = this[e];
      if (i ?? (i = n.getPropertyOptions(e)), !((i.hasChanged ?? Pe)(o, t) || i.useDefault && i.reflect && o === ((r = this._$Ej) == null ? void 0 : r.get(e)) && !this.hasAttribute(n._$Eu(e, i)))) return;
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
V.elementStyles = [], V.shadowRootOptions = { mode: "open" }, V[F("elementProperties")] = /* @__PURE__ */ new Map(), V[F("finalized")] = /* @__PURE__ */ new Map(), $e == null || $e({ ReactiveElement: V }), (B.reactiveElementVersions ?? (B.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, pe = J.trustedTypes, qe = pe ? pe.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Xe = "$lit$", U = `lit$${Math.random().toFixed(9).slice(2)}$`, Ze = "?" + U, Et = `<${Ze}>`, D = document, Y = () => D.createComment(""), X = (s) => s === null || typeof s != "object" && typeof s != "function", Oe = Array.isArray, At = (s) => Oe(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", be = `[ 	
\f\r]`, G = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ve = /-->/g, je = />/g, N = RegExp(`>|${be}(?:([^\\s"'>=/]+)(${be}*=${be}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), We = /'/g, Ke = /"/g, Qe = /^(?:script|style|textarea|title)$/i, wt = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), Ae = wt(1), q = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), xe = /* @__PURE__ */ new WeakMap(), I = D.createTreeWalker(D, 129);
function et(s, e) {
  if (!Oe(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return qe !== void 0 ? qe.createHTML(e) : e;
}
const St = (s, e) => {
  const t = s.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = G;
  for (let a = 0; a < t; a++) {
    const l = s[a];
    let h, d, p = -1, b = 0;
    for (; b < l.length && (o.lastIndex = b, d = o.exec(l), d !== null); ) b = o.lastIndex, o === G ? d[1] === "!--" ? o = Ve : d[1] !== void 0 ? o = je : d[2] !== void 0 ? (Qe.test(d[2]) && (r = RegExp("</" + d[2], "g")), o = N) : d[3] !== void 0 && (o = N) : o === N ? d[0] === ">" ? (o = r ?? G, p = -1) : d[1] === void 0 ? p = -2 : (p = o.lastIndex - d[2].length, h = d[1], o = d[3] === void 0 ? N : d[3] === '"' ? Ke : We) : o === Ke || o === We ? o = N : o === Ve || o === je ? o = G : (o = N, r = void 0);
    const T = o === N && s[a + 1].startsWith("/>") ? " " : "";
    n += o === G ? l + Et : p >= 0 ? (i.push(h), l.slice(0, p) + Xe + l.slice(p) + U + T) : l + U + (p === -2 ? a : T);
  }
  return [et(s, n + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Z {
  constructor({ strings: e, _$litType$: t }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = e.length - 1, l = this.parts, [h, d] = St(e, t);
    if (this.el = Z.createElement(h, i), I.currentNode = this.el.content, t === 2 || t === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = I.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(Xe)) {
          const b = d[o++], T = r.getAttribute(p).split(U), te = /([.?@])?(.*)/.exec(b);
          l.push({ type: 1, index: n, name: te[2], strings: T, ctor: te[1] === "." ? kt : te[1] === "?" ? Pt : te[1] === "@" ? Ot : _e }), r.removeAttribute(p);
        } else p.startsWith(U) && (l.push({ type: 6, index: n }), r.removeAttribute(p));
        if (Qe.test(r.tagName)) {
          const p = r.textContent.split(U), b = p.length - 1;
          if (b > 0) {
            r.textContent = pe ? pe.emptyScript : "";
            for (let T = 0; T < b; T++) r.append(p[T], Y()), I.nextNode(), l.push({ type: 2, index: ++n });
            r.append(p[b], Y());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Ze) l.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(U, p + 1)) !== -1; ) l.push({ type: 7, index: n }), p += U.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = D.createElement("template");
    return i.innerHTML = e, i;
  }
}
function x(s, e, t = s, i) {
  var o, a;
  if (e === q) return e;
  let r = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const n = X(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = r : t._$Cl = r), r !== void 0 && (e = x(s, r._$AS(s, e.values), r, i)), e;
}
class Tt {
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
    const { el: { content: t }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? D).importNode(t, !0);
    I.currentNode = r;
    let n = I.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let h;
        l.type === 2 ? h = new Q(n, n.nextSibling, this, e) : l.type === 1 ? h = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (h = new Ut(n, this, e)), this._$AV.push(h), l = i[++a];
      }
      o !== (l == null ? void 0 : l.index) && (n = I.nextNode(), o++);
    }
    return I.currentNode = D, r;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class Q {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, r) {
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = x(this, e, t), X(e) ? e === m || e == null || e === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : e !== this._$AH && e !== q && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : At(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== m && X(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Z.createElement(et(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(t);
    else {
      const o = new Tt(r, this), a = o.u(this.options);
      o.p(t), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = xe.get(e.strings);
    return t === void 0 && xe.set(e.strings, t = new Z(e)), t;
  }
  k(e) {
    Oe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, r = 0;
    for (const n of e) r === t.length ? t.push(i = new Q(this.O(Y()), this.O(Y()), this, this.options)) : i = t[r], i._$AI(n), r++;
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
class _e {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, r, n) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = m;
  }
  _$AI(e, t = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = x(this, e, t, 0), o = !X(e) || e !== this._$AH && e !== q, o && (this._$AH = e);
    else {
      const a = e;
      let l, h;
      for (e = n[0], l = 0; l < n.length - 1; l++) h = x(this, a[i + l], t, l), h === q && (h = this._$AH[l]), o || (o = !X(h) || h !== this._$AH[l]), h === m ? e = m : e !== m && (e += (h ?? "") + n[l + 1]), this._$AH[l] = h;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class kt extends _e {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === m ? void 0 : e;
  }
}
class Pt extends _e {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== m);
  }
}
class Ot extends _e {
  constructor(e, t, i, r, n) {
    super(e, t, i, r, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = x(this, e, t, 0) ?? m) === q) return;
    const i = this._$AH, r = e === m && i !== m || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== m && (i === m || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ut {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    x(this, e);
  }
}
const ye = J.litHtmlPolyfillSupport;
ye == null || ye(Z, Q), (J.litHtmlVersions ?? (J.litHtmlVersions = [])).push("3.3.0");
const Rt = (s, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = r = new Q(e.insertBefore(Y(), n), n, void 0, t ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M = globalThis;
let re = class extends V {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Rt(t, this.renderRoot, this.renderOptions);
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
    return q;
  }
};
var Ge;
re._$litElement$ = !0, re.finalized = !0, (Ge = M.litElementHydrateSupport) == null || Ge.call(M, { LitElement: re });
const ve = M.litElementPolyfillSupport;
ve == null || ve({ LitElement: re });
(M.litElementVersions ?? (M.litElementVersions = [])).push("4.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tt = (s) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(s, e);
  }) : customElements.define(s, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ht = { attribute: !0, type: String, converter: ue, reflect: !1, hasChanged: Pe }, Bt = (s = Ht, e, t) => {
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
function g(s) {
  return (e, t) => typeof t == "object" ? Bt(s, e, t) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Nt(s) {
  return g({ ...s, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ct = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, It = (s) => (...e) => ({ _$litDirective$: s, values: e });
class Lt {
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
class we extends Lt {
  constructor(e) {
    if (super(e), this.it = m, e.type !== Ct.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(e) {
    if (e === m || e == null) return this._t = void 0, this.it = e;
    if (e === q) return e;
    if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (e === this.it) return this._t;
    this.it = e;
    const t = [e];
    return t.raw = t, this._t = { _$litType$: this.constructor.resultType, strings: t, values: [] };
  }
}
we.directiveName = "unsafeHTML", we.resultType = 1;
const Mt = It(we);
class Dt {
  constructor(e) {
    this.config = e;
  }
}
class ze extends Error {
  constructor(e, t, i) {
    super(i), this.name = "ApiError", this.url = t.url, this.status = t.status, this.statusText = t.statusText, this.body = t.body, this.request = e;
  }
}
class qt extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var A, w, v, R, L, K, H;
class Vt {
  constructor(e) {
    k(this, A);
    k(this, w);
    k(this, v);
    k(this, R);
    k(this, L);
    k(this, K);
    k(this, H);
    y(this, A, !1), y(this, w, !1), y(this, v, !1), y(this, R, []), y(this, L, new Promise((t, i) => {
      y(this, K, t), y(this, H, i);
      const r = (a) => {
        c(this, A) || c(this, w) || c(this, v) || (y(this, A, !0), c(this, K) && c(this, K).call(this, a));
      }, n = (a) => {
        c(this, A) || c(this, w) || c(this, v) || (y(this, w, !0), c(this, H) && c(this, H).call(this, a));
      }, o = (a) => {
        c(this, A) || c(this, w) || c(this, v) || c(this, R).push(a);
      };
      return Object.defineProperty(o, "isResolved", {
        get: () => c(this, A)
      }), Object.defineProperty(o, "isRejected", {
        get: () => c(this, w)
      }), Object.defineProperty(o, "isCancelled", {
        get: () => c(this, v)
      }), e(r, n, o);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, t) {
    return c(this, L).then(e, t);
  }
  catch(e) {
    return c(this, L).catch(e);
  }
  finally(e) {
    return c(this, L).finally(e);
  }
  cancel() {
    if (!(c(this, A) || c(this, w) || c(this, v))) {
      if (y(this, v, !0), c(this, R).length)
        try {
          for (const e of c(this, R))
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      c(this, R).length = 0, c(this, H) && c(this, H).call(this, new qt("Request aborted"));
    }
  }
  get isCancelled() {
    return c(this, v);
  }
}
A = new WeakMap(), w = new WeakMap(), v = new WeakMap(), R = new WeakMap(), L = new WeakMap(), K = new WeakMap(), H = new WeakMap();
const Ue = (s) => s != null, ee = (s) => typeof s == "string", ge = (s) => ee(s) && s !== "", Re = (s) => typeof s == "object" && typeof s.type == "string" && typeof s.stream == "function" && typeof s.arrayBuffer == "function" && typeof s.constructor == "function" && typeof s.constructor.name == "string" && /^(Blob|File)$/.test(s.constructor.name) && /^(Blob|File)$/.test(s[Symbol.toStringTag]), st = (s) => s instanceof FormData, jt = (s) => {
  try {
    return btoa(s);
  } catch {
    return Buffer.from(s).toString("base64");
  }
}, Wt = (s) => {
  const e = [], t = (r, n) => {
    e.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(n))}`);
  }, i = (r, n) => {
    Ue(n) && (Array.isArray(n) ? n.forEach((o) => {
      i(r, o);
    }) : typeof n == "object" ? Object.entries(n).forEach(([o, a]) => {
      i(`${r}[${o}]`, a);
    }) : t(r, n));
  };
  return Object.entries(s).forEach(([r, n]) => {
    i(r, n);
  }), e.length > 0 ? `?${e.join("&")}` : "";
}, Kt = (s, e) => {
  const t = s.ENCODE_PATH || encodeURI, i = e.url.replace("{api-version}", s.VERSION).replace(/{(.*?)}/g, (n, o) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(o) ? t(String(e.path[o])) : n;
  }), r = `${s.BASE}${i}`;
  return e.query ? `${r}${Wt(e.query)}` : r;
}, xt = (s) => {
  if (s.formData) {
    const e = new FormData(), t = (i, r) => {
      ee(r) || Re(r) ? e.append(i, r) : e.append(i, JSON.stringify(r));
    };
    return Object.entries(s.formData).filter(([i, r]) => Ue(r)).forEach(([i, r]) => {
      Array.isArray(r) ? r.forEach((n) => t(i, n)) : t(i, r);
    }), e;
  }
}, se = async (s, e) => typeof e == "function" ? e(s) : e, zt = async (s, e) => {
  const [t, i, r, n] = await Promise.all([
    se(e, s.TOKEN),
    se(e, s.USERNAME),
    se(e, s.PASSWORD),
    se(e, s.HEADERS)
  ]), o = Object.entries({
    Accept: "application/json",
    ...n,
    ...e.headers
  }).filter(([a, l]) => Ue(l)).reduce((a, [l, h]) => ({
    ...a,
    [l]: String(h)
  }), {});
  if (ge(t) && (o.Authorization = `Bearer ${t}`), ge(i) && ge(r)) {
    const a = jt(`${i}:${r}`);
    o.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? o["Content-Type"] = e.mediaType : Re(e.body) ? o["Content-Type"] = e.body.type || "application/octet-stream" : ee(e.body) ? o["Content-Type"] = "text/plain" : st(e.body) || (o["Content-Type"] = "application/json")), new Headers(o);
}, Gt = (s) => {
  var e;
  if (s.body !== void 0)
    return (e = s.mediaType) != null && e.includes("/json") ? JSON.stringify(s.body) : ee(s.body) || Re(s.body) || st(s.body) ? s.body : JSON.stringify(s.body);
}, Ft = async (s, e, t, i, r, n, o) => {
  const a = new AbortController(), l = {
    headers: n,
    body: i ?? r,
    method: e.method,
    signal: a.signal
  };
  return s.WITH_CREDENTIALS && (l.credentials = s.CREDENTIALS), o(() => a.abort()), await fetch(t, l);
}, Jt = (s, e) => {
  if (e) {
    const t = s.headers.get(e);
    if (ee(t))
      return t;
  }
}, Yt = async (s) => {
  if (s.status !== 204)
    try {
      const e = s.headers.get("Content-Type");
      if (e)
        return ["application/json", "application/problem+json"].some((r) => e.toLowerCase().startsWith(r)) ? await s.json() : await s.text();
    } catch (e) {
      console.error(e);
    }
}, Xt = (s, e) => {
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
    throw new ze(s, e, i);
  if (!e.ok) {
    const r = e.status ?? "unknown", n = e.statusText ?? "unknown", o = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new ze(
      s,
      e,
      `Generic Error: status: ${r}; status text: ${n}; body: ${o}`
    );
  }
}, Zt = (s, e) => new Vt(async (t, i, r) => {
  try {
    const n = Kt(s, e), o = xt(e), a = Gt(e), l = await zt(s, e);
    if (!r.isCancelled) {
      const h = await Ft(s, e, n, a, o, l, r), d = await Yt(h), p = Jt(h, e.responseHeader), b = {
        url: n,
        ok: h.ok,
        status: h.status,
        statusText: h.statusText,
        body: p ?? d
      };
      Xt(e, b), t(b.body);
    }
  } catch (n) {
    i(n);
  }
});
class Qt extends Dt {
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
    return Zt(this.config, e);
  }
}
class es {
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
        401: "The resource is protected and requires an authentication token"
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
class fe {
  constructor(e, t = Qt) {
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
    }), this.kraftvaerkUmbracoHeadlessBlockpreviewApiV1 = new es(this.request);
  }
}
var ts = Object.defineProperty, ss = Object.getOwnPropertyDescriptor, it = (s) => {
  throw TypeError(s);
}, E = (s, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? ss(e, t) : e, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && ts(e, t, r), r;
}, He = (s, e, t) => e.has(s) || it("Cannot " + t), u = (s, e, t) => (He(s, e, "read from private field"), e.get(s)), $ = (s, e, t) => e.has(s) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), _ = (s, e, t, i) => (He(s, e, "write to private field"), e.set(s, t), t), is = (s, e, t) => (He(s, e, "access private method"), t), j, O, C, S, me, ne, W, oe, P, ae, le, ce, he, Se, rt;
const rs = "umb-headless-preview";
let f = class extends Fe {
  constructor() {
    super(), $(this, Se), $(this, j, null), $(this, O), $(this, C), $(this, S), $(this, me), $(this, ne), $(this, W), $(this, oe, !1), $(this, P), $(this, ae, !1), $(this, le, !1), $(this, ce, !1), $(this, he, () => this.requestUpdate()), this.init();
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener(Ee, u(this, he));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener(Ee, u(this, he));
  }
  async updated(s) {
    super.updated(s), (u(this, O) !== this.content || u(this, C) !== this.settings) && is(this, Se, rt).call(this);
  }
  render() {
    var s, e, t, i, r, n;
    return u(this, P) || _(this, P, f.blockSettings.find((o) => {
      var a;
      return o.id == ((a = this.blockType) == null ? void 0 : a.contentElementTypeKey);
    })), u(this, O) || _(this, O, this.content), u(this, C) || _(this, C, this.settings), f.useBeamFallback || u(this, S) === "blockbeam" || u(this, oe) && !((s = u(this, P)) != null && s.enabledNested) || !((e = u(this, P)) != null && e.enabledGrid) && u(this, ae) || !((t = u(this, P)) != null && t.enabledList) && u(this, le) || !((i = u(this, P)) != null && i.enabledRTE) && u(this, ce) || u(this, W) ? this.blockBeam(u(this, W)) : Ae`<div class="__headless-preview"><a href=${((r = this.config) != null && r.showContentEdit ? (n = this.config) == null ? void 0 : n.editContentPath : void 0) ?? ""}>${Mt(u(this, S))}</a></div>`;
  }
  async init() {
    _(this, S, f.loadingBarHtml), this.consumeContext(at, (s) => {
      var e;
      _(this, ne, (e = s == null ? void 0 : s.getVariantId()) == null ? void 0 : e.culture), _(this, ae, (s == null ? void 0 : s.getHostElement().tagName) === "UMB-PROPERTY-EDITOR-UI-BLOCK-GRID"), _(this, le, (s == null ? void 0 : s.getHostElement().tagName) === "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST"), _(this, ce, (s == null ? void 0 : s.getHostElement().tagName) === "UMB-PROPERTY-EDITOR-UI-TIPTAP");
    }), this.consumeContext(lt, (s) => {
      _(this, j, s == null ? void 0 : s.getUnique()), _(this, O, this.content), this.getHtmlString().then(() => {
        this.requestUpdate();
      });
    }), this.checkReadiness();
  }
  checkReadiness() {
    setTimeout(() => {
      u(this, S) === f.loadingBarHtml ? ((u(this, j) === null || u(this, j) === void 0) && _(this, oe, !0), this.getHtmlString()) : this.checkReadiness();
    }, 500);
  }
  async getHtmlString() {
    var e, t;
    const s = {
      id: u(this, j),
      contentType: (e = this.blockType) == null ? void 0 : e.contentElementTypeKey,
      settingsType: ((t = this.blockType) == null ? void 0 : t.settingsElementTypeKey) ?? "",
      content: JSON.stringify(u(this, O)),
      settings: JSON.stringify(u(this, C) ?? {}),
      culture: u(this, ne)
    };
    try {
      this.consumeContext(de, async (i) => {
        const r = await (i == null ? void 0 : i.getLatestToken());
        if (r) {
          const n = new fe({
            TOKEN: r
          });
          try {
            const o = await n.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
              requestBody: s
            });
            _(this, S, o.html ?? "blockbeam");
          } catch (o) {
            _(this, S, "blockbeam"), _(this, W, o instanceof Error ? o.message : "Unknown error");
          }
          this.requestUpdate();
        }
      });
    } catch (i) {
      _(this, S, "blockbeam"), _(this, W, i instanceof Error ? i.message : "Unknown error");
    }
  }
  resolveLabel(s) {
    if (console.log("Resolving label", { label: s, content: this.content }), !s) return "error";
    if (!this.content) return s;
    const e = this.content;
    return s.replace(/\{[=+!]([^}]+)\}/g, (t, i) => {
      const r = e == null ? void 0 : e[i];
      return r != null && r !== "" ? String(r) : "";
    });
  }
  blockBeam(s) {
    return Ae`
    <uui-ref-node .name=${this.resolveLabel(this.label)} .detail=${s ?? ""} standalone="">
      <uui-icon slot="icon" .name=${this.icon ?? "icon-plugin"} style="--uui-icon-color:var(--uui-palette-maroon-flush);"></uui-icon>
     </uui-ref-node>`;
  }
};
j = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
me = /* @__PURE__ */ new WeakMap();
ne = /* @__PURE__ */ new WeakMap();
W = /* @__PURE__ */ new WeakMap();
oe = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
ae = /* @__PURE__ */ new WeakMap();
le = /* @__PURE__ */ new WeakMap();
ce = /* @__PURE__ */ new WeakMap();
he = /* @__PURE__ */ new WeakMap();
Se = /* @__PURE__ */ new WeakSet();
rt = function() {
  clearTimeout(u(this, me)), _(this, me, window.setTimeout(async () => {
    _(this, O, this.content), _(this, C, this.settings), await this.getHtmlString();
  }, 10));
};
f.useBeamFallback = !1;
f.loadingBarHtml = `
    <uui-ref-node name="Loading preview..." detail="" standalone href="">
      <uui-icon slot="icon" name="icon-plugin"></uui-icon>
      <uui-loader-bar style="color: #006eff;"></uui-loader-bar>
    </uui-ref-node>
  `;
f.blockSettings = [];
f.styles = [
  Ye`
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
E([
  g({ attribute: !1 })
], f.prototype, "content", 2);
E([
  g({ attribute: !1 })
], f.prototype, "settings", 2);
E([
  g({ attribute: !1 })
], f.prototype, "blockType", 2);
E([
  g({ attribute: !1 })
], f.prototype, "label", 2);
E([
  g({ attribute: !1 })
], f.prototype, "icon", 2);
E([
  g({ attribute: !1 })
], f.prototype, "config", 2);
E([
  g({ attribute: !1 })
], f.prototype, "contentInvalid", 2);
E([
  g({ attribute: !1 })
], f.prototype, "settingsInvalid", 2);
E([
  g({ attribute: !1 })
], f.prototype, "unsupported", 2);
E([
  g({ attribute: !1 })
], f.prototype, "unpublished", 2);
f = E([
  tt(rs)
], f);
var ns = Object.defineProperty, os = Object.getOwnPropertyDescriptor, nt = (s, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? os(e, t) : e, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && ns(e, t, r), r;
};
const as = "umb-headless-preview-workspace-view";
let z = class extends Fe {
  constructor() {
    super(), this.model = {
      id: "",
      enabled: !1,
      enabledNested: !1,
      enabledList: !1,
      enabledGrid: !1,
      enabledRTE: !1,
      advancedSettings: ""
    }, this.consumeContext(ct, async (s) => {
      const e = s == null ? void 0 : s.getUnique();
      e && (this.model.id = e, await this.loadInitialState());
    });
  }
  async loadInitialState() {
    try {
      this.consumeContext(de, async (s) => {
        const e = await (s == null ? void 0 : s.getLatestToken()) ?? "", t = (s == null ? void 0 : s.getServerUrl()) ?? "", r = await new fe({
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
    this.model = { ...this.model, ...s }, this.consumeContext(de, async (e) => {
      const t = await (e == null ? void 0 : e.getLatestToken()) ?? "", i = (e == null ? void 0 : e.getServerUrl()) ?? "";
      await new fe({
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
    return Ae`
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
z.styles = [
  Ye`
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
nt([
  Nt()
], z.prototype, "model", 2);
z = nt([
  tt(as)
], z);
const gs = async (s, e) => {
  s.consumeContext(de, async (t) => {
    const i = await (t == null ? void 0 : t.getLatestToken()) ?? "", r = (t == null ? void 0 : t.getServerUrl()) ?? "", n = await ls(r, i);
    f.blockSettings = n;
    const o = {
      alias: "Kraftvaerk.Umbraco.Headless.BlockPreview",
      name: "Umbraco Community Headless Block Preview",
      type: "blockEditorCustomView",
      element: f,
      forContentTypeAlias: n.filter((d) => d.enabled && d.alias).map((d) => d.alias) ?? []
    }, a = {
      type: "workspaceView",
      alias: "umb.workspaceView.headlessPreviewGrid",
      name: "Headless Preview",
      element: z,
      weight: 1100,
      meta: {
        label: "Block Preview",
        pathname: "preview",
        icon: "icon-settings"
      },
      conditions: [
        {
          alias: Ce,
          match: ht
        }
      ]
    }, l = {
      type: "workspaceView",
      alias: "umb.workspaceView.headlessPreviewList",
      name: "Headless Preview",
      element: z,
      weight: 1100,
      meta: {
        label: "Block Preview",
        pathname: "preview",
        icon: "icon-settings"
      },
      conditions: [
        {
          alias: Ce,
          match: dt
        }
      ]
    }, h = {
      type: "blockAction",
      kind: "default",
      alias: "Kraftvaerk.Umbraco.Headless.BlockPreview.ToggleAction",
      name: "Toggle Headless Preview",
      api: ut,
      forContentTypeAlias: n.filter((d) => d.enabled && d.alias).map((d) => d.alias),
      meta: {
        icon: "icon-plugin",
        label: "Toggle Preview"
      }
    };
    e.register(o), e.register(h), e.register(a), e.register(l);
  });
};
async function ls(s, e) {
  cs();
  try {
    const i = await new fe({ BASE: s, TOKEN: e }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.optionsApiV1KraftvaerkUmbracoHeadlessBlockpreview();
    return console.log("Enabled block aliases:", i), i;
  } catch (t) {
    return console.error("Fetch failed:", t), [];
  }
}
async function cs() {
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
  gs as onInit
};
//# sourceMappingURL=dist.js.map

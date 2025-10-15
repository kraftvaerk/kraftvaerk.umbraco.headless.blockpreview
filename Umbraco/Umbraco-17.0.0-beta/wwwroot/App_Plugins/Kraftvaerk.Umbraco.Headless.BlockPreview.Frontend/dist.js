var Be = (s) => {
  throw TypeError(s);
};
var Ne = (s, e, t) => e.has(s) || Be("Cannot " + t);
var h = (s, e, t) => (Ne(s, e, "read from private field"), t ? t.call(s) : e.get(s)), T = (s, e, t) => e.has(s) ? Be("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), y = (s, e, t, i) => (Ne(s, e, "write to private field"), i ? i.call(s, t) : e.set(s, t), t);
import { UMB_BLOCK_MANAGER_CONTEXT as ot } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as Ge } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_WORKSPACE_CONTEXT as at, UMB_WORKSPACE_CONDITION_ALIAS as Ce } from "@umbraco-cms/backoffice/workspace";
import { UMB_AUTH_CONTEXT as pe } from "@umbraco-cms/backoffice/auth";
import { UMB_PROPERTY_DATASET_CONTEXT as lt } from "@umbraco-cms/backoffice/property";
import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS as ct } from "@umbraco-cms/backoffice/block-grid";
import { UMB_BLOCK_LIST_TYPE_WORKSPACE_ALIAS as ht } from "@umbraco-cms/backoffice/block-list";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ie = globalThis, Te = ie.ShadowRoot && (ie.ShadyCSS === void 0 || ie.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ke = Symbol(), Le = /* @__PURE__ */ new WeakMap();
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
      i && (e = Le.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Le.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const dt = (s) => new Je(typeof s == "string" ? s : s + "", void 0, ke), Ye = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, r, n) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new Je(t, s, ke);
}, ut = (s, e) => {
  if (Te) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), r = ie.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = t.cssText, s.appendChild(i);
  }
}, Ie = Te ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return dt(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: pt, defineProperty: ft, getOwnPropertyDescriptor: mt, getOwnPropertyNames: bt, getOwnPropertySymbols: _t, getPrototypeOf: $t } = Object, B = globalThis, De = B.trustedTypes, yt = De ? De.emptyScript : "", ye = B.reactiveElementPolyfillSupport, G = (s, e) => s, fe = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? yt : null;
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
} }, Pe = (s, e) => !pt(s, e), Me = { attribute: !0, type: String, converter: fe, reflect: !1, useDefault: !1, hasChanged: Pe };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), B.litPropertyMetadata ?? (B.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let j = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Me) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, t);
      r !== void 0 && ft(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: r, set: n } = mt(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Me;
  }
  static _$Ei() {
    if (this.hasOwnProperty(G("elementProperties"))) return;
    const e = $t(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(G("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(G("properties"))) {
      const t = this.properties, i = [...bt(t), ..._t(t)];
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
      for (const r of i) t.unshift(Ie(r));
    } else e !== void 0 && t.push(Ie(e));
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
    return ut(e, this.constructor.elementStyles), e;
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
      const o = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : fe).toAttribute(t, i.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, o;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = i.getPropertyOptions(r), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : fe;
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
j.elementStyles = [], j.shadowRootOptions = { mode: "open" }, j[G("elementProperties")] = /* @__PURE__ */ new Map(), j[G("finalized")] = /* @__PURE__ */ new Map(), ye == null || ye({ ReactiveElement: j }), (B.reactiveElementVersions ?? (B.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, me = J.trustedTypes, qe = me ? me.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Xe = "$lit$", R = `lit$${Math.random().toFixed(9).slice(2)}$`, Ze = "?" + R, vt = `<${Ze}>`, q = document, Y = () => q.createComment(""), X = (s) => s === null || typeof s != "object" && typeof s != "function", Oe = Array.isArray, Et = (s) => Oe(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", ve = `[ 	
\f\r]`, z = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xe = /-->/g, je = />/g, N = RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ve = /'/g, We = /"/g, Qe = /^(?:script|style|textarea|title)$/i, gt = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), re = gt(1), x = Symbol.for("lit-noChange"), f = Symbol.for("lit-nothing"), Ke = /* @__PURE__ */ new WeakMap(), I = q.createTreeWalker(q, 129);
function et(s, e) {
  if (!Oe(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return qe !== void 0 ? qe.createHTML(e) : e;
}
const At = (s, e) => {
  const t = s.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = z;
  for (let a = 0; a < t; a++) {
    const l = s[a];
    let c, b, u = -1, $ = 0;
    for (; $ < l.length && (o.lastIndex = $, b = o.exec(l), b !== null); ) $ = o.lastIndex, o === z ? b[1] === "!--" ? o = xe : b[1] !== void 0 ? o = je : b[2] !== void 0 ? (Qe.test(b[2]) && (r = RegExp("</" + b[2], "g")), o = N) : b[3] !== void 0 && (o = N) : o === N ? b[0] === ">" ? (o = r ?? z, u = -1) : b[1] === void 0 ? u = -2 : (u = o.lastIndex - b[2].length, c = b[1], o = b[3] === void 0 ? N : b[3] === '"' ? We : Ve) : o === We || o === Ve ? o = N : o === xe || o === je ? o = z : (o = N, r = void 0);
    const S = o === N && s[a + 1].startsWith("/>") ? " " : "";
    n += o === z ? l + vt : u >= 0 ? (i.push(c), l.slice(0, u) + Xe + l.slice(u) + R + S) : l + R + (u === -2 ? a : S);
  }
  return [et(s, n + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class Z {
  constructor({ strings: e, _$litType$: t }, i) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = e.length - 1, l = this.parts, [c, b] = At(e, t);
    if (this.el = Z.createElement(c, i), I.currentNode = this.el.content, t === 2 || t === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (r = I.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const u of r.getAttributeNames()) if (u.endsWith(Xe)) {
          const $ = b[o++], S = r.getAttribute(u).split(R), te = /([.?@])?(.*)/.exec($);
          l.push({ type: 1, index: n, name: te[2], strings: S, ctor: te[1] === "." ? St : te[1] === "?" ? Tt : te[1] === "@" ? kt : $e }), r.removeAttribute(u);
        } else u.startsWith(R) && (l.push({ type: 6, index: n }), r.removeAttribute(u));
        if (Qe.test(r.tagName)) {
          const u = r.textContent.split(R), $ = u.length - 1;
          if ($ > 0) {
            r.textContent = me ? me.emptyScript : "";
            for (let S = 0; S < $; S++) r.append(u[S], Y()), I.nextNode(), l.push({ type: 2, index: ++n });
            r.append(u[$], Y());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Ze) l.push({ type: 2, index: n });
      else {
        let u = -1;
        for (; (u = r.data.indexOf(R, u + 1)) !== -1; ) l.push({ type: 7, index: n }), u += R.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = q.createElement("template");
    return i.innerHTML = e, i;
  }
}
function W(s, e, t = s, i) {
  var o, a;
  if (e === x) return e;
  let r = i !== void 0 ? (o = t._$Co) == null ? void 0 : o[i] : t._$Cl;
  const n = X(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = r : t._$Cl = r), r !== void 0 && (e = W(s, r._$AS(s, e.values), r, i)), e;
}
class wt {
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
    const { el: { content: t }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? q).importNode(t, !0);
    I.currentNode = r;
    let n = I.nextNode(), o = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new Q(n, n.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (c = new Pt(n, this, e)), this._$AV.push(c), l = i[++a];
      }
      o !== (l == null ? void 0 : l.index) && (n = I.nextNode(), o++);
    }
    return I.currentNode = q, r;
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
    this.type = 2, this._$AH = f, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
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
    e = W(this, e, t), X(e) ? e === f || e == null || e === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : e !== this._$AH && e !== x && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Et(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== f && X(this._$AH) ? this._$AA.nextSibling.data = e : this.T(q.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = Z.createElement(et(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(t);
    else {
      const o = new wt(r, this), a = o.u(this.options);
      o.p(t), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = Ke.get(e.strings);
    return t === void 0 && Ke.set(e.strings, t = new Z(e)), t;
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
class $e {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, r, n) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = f;
  }
  _$AI(e, t = this, i, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = W(this, e, t, 0), o = !X(e) || e !== this._$AH && e !== x, o && (this._$AH = e);
    else {
      const a = e;
      let l, c;
      for (e = n[0], l = 0; l < n.length - 1; l++) c = W(this, a[i + l], t, l), c === x && (c = this._$AH[l]), o || (o = !X(c) || c !== this._$AH[l]), c === f ? e = f : e !== f && (e += (c ?? "") + n[l + 1]), this._$AH[l] = c;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class St extends $e {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === f ? void 0 : e;
  }
}
class Tt extends $e {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== f);
  }
}
class kt extends $e {
  constructor(e, t, i, r, n) {
    super(e, t, i, r, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = W(this, e, t, 0) ?? f) === x) return;
    const i = this._$AH, r = e === f && i !== f || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== f && (i === f || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Pt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    W(this, e);
  }
}
const Ee = J.litHtmlPolyfillSupport;
Ee == null || Ee(Z, Q), (J.litHtmlVersions ?? (J.litHtmlVersions = [])).push("3.3.0");
const Ot = (s, e, t) => {
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
let ne = class extends j {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ot(t, this.renderRoot, this.renderOptions);
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
    return x;
  }
};
var Fe;
ne._$litElement$ = !0, ne.finalized = !0, (Fe = M.litElementHydrateSupport) == null || Fe.call(M, { LitElement: ne });
const ge = M.litElementPolyfillSupport;
ge == null || ge({ LitElement: ne });
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
const Rt = { attribute: !0, type: String, converter: fe, reflect: !1, hasChanged: Pe }, Ut = (s = Rt, e, t) => {
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
function E(s) {
  return (e, t) => typeof t == "object" ? Ut(s, e, t) : ((i, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, i), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
  })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Ht(s) {
  return E({ ...s, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bt = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 }, Nt = (s) => (...e) => ({ _$litDirective$: s, values: e });
class Ct {
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
class we extends Ct {
  constructor(e) {
    if (super(e), this.it = f, e.type !== Bt.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(e) {
    if (e === f || e == null) return this._t = void 0, this.it = e;
    if (e === x) return e;
    if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (e === this.it) return this._t;
    this.it = e;
    const t = [e];
    return t.raw = t, this._t = { _$litType$: this.constructor.resultType, strings: t, values: [] };
  }
}
we.directiveName = "unsafeHTML", we.resultType = 1;
const Lt = Nt(we);
class It {
  constructor(e) {
    this.config = e;
  }
}
class ze extends Error {
  constructor(e, t, i) {
    super(i), this.name = "ApiError", this.url = t.url, this.status = t.status, this.statusText = t.statusText, this.body = t.body, this.request = e;
  }
}
class Dt extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
var A, w, v, U, D, V, H;
class Mt {
  constructor(e) {
    T(this, A);
    T(this, w);
    T(this, v);
    T(this, U);
    T(this, D);
    T(this, V);
    T(this, H);
    y(this, A, !1), y(this, w, !1), y(this, v, !1), y(this, U, []), y(this, D, new Promise((t, i) => {
      y(this, V, t), y(this, H, i);
      const r = (a) => {
        h(this, A) || h(this, w) || h(this, v) || (y(this, A, !0), h(this, V) && h(this, V).call(this, a));
      }, n = (a) => {
        h(this, A) || h(this, w) || h(this, v) || (y(this, w, !0), h(this, H) && h(this, H).call(this, a));
      }, o = (a) => {
        h(this, A) || h(this, w) || h(this, v) || h(this, U).push(a);
      };
      return Object.defineProperty(o, "isResolved", {
        get: () => h(this, A)
      }), Object.defineProperty(o, "isRejected", {
        get: () => h(this, w)
      }), Object.defineProperty(o, "isCancelled", {
        get: () => h(this, v)
      }), e(r, n, o);
    }));
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, t) {
    return h(this, D).then(e, t);
  }
  catch(e) {
    return h(this, D).catch(e);
  }
  finally(e) {
    return h(this, D).finally(e);
  }
  cancel() {
    if (!(h(this, A) || h(this, w) || h(this, v))) {
      if (y(this, v, !0), h(this, U).length)
        try {
          for (const e of h(this, U))
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      h(this, U).length = 0, h(this, H) && h(this, H).call(this, new Dt("Request aborted"));
    }
  }
  get isCancelled() {
    return h(this, v);
  }
}
A = new WeakMap(), w = new WeakMap(), v = new WeakMap(), U = new WeakMap(), D = new WeakMap(), V = new WeakMap(), H = new WeakMap();
const Re = (s) => s != null, ee = (s) => typeof s == "string", Ae = (s) => ee(s) && s !== "", Ue = (s) => typeof s == "object" && typeof s.type == "string" && typeof s.stream == "function" && typeof s.arrayBuffer == "function" && typeof s.constructor == "function" && typeof s.constructor.name == "string" && /^(Blob|File)$/.test(s.constructor.name) && /^(Blob|File)$/.test(s[Symbol.toStringTag]), st = (s) => s instanceof FormData, qt = (s) => {
  try {
    return btoa(s);
  } catch {
    return Buffer.from(s).toString("base64");
  }
}, xt = (s) => {
  const e = [], t = (r, n) => {
    e.push(`${encodeURIComponent(r)}=${encodeURIComponent(String(n))}`);
  }, i = (r, n) => {
    Re(n) && (Array.isArray(n) ? n.forEach((o) => {
      i(r, o);
    }) : typeof n == "object" ? Object.entries(n).forEach(([o, a]) => {
      i(`${r}[${o}]`, a);
    }) : t(r, n));
  };
  return Object.entries(s).forEach(([r, n]) => {
    i(r, n);
  }), e.length > 0 ? `?${e.join("&")}` : "";
}, jt = (s, e) => {
  const t = s.ENCODE_PATH || encodeURI, i = e.url.replace("{api-version}", s.VERSION).replace(/{(.*?)}/g, (n, o) => {
    var a;
    return (a = e.path) != null && a.hasOwnProperty(o) ? t(String(e.path[o])) : n;
  }), r = `${s.BASE}${i}`;
  return e.query ? `${r}${xt(e.query)}` : r;
}, Vt = (s) => {
  if (s.formData) {
    const e = new FormData(), t = (i, r) => {
      ee(r) || Ue(r) ? e.append(i, r) : e.append(i, JSON.stringify(r));
    };
    return Object.entries(s.formData).filter(([i, r]) => Re(r)).forEach(([i, r]) => {
      Array.isArray(r) ? r.forEach((n) => t(i, n)) : t(i, r);
    }), e;
  }
}, se = async (s, e) => typeof e == "function" ? e(s) : e, Wt = async (s, e) => {
  const [t, i, r, n] = await Promise.all([
    se(e, s.TOKEN),
    se(e, s.USERNAME),
    se(e, s.PASSWORD),
    se(e, s.HEADERS)
  ]), o = Object.entries({
    Accept: "application/json",
    ...n,
    ...e.headers
  }).filter(([a, l]) => Re(l)).reduce((a, [l, c]) => ({
    ...a,
    [l]: String(c)
  }), {});
  if (Ae(t) && (o.Authorization = `Bearer ${t}`), Ae(i) && Ae(r)) {
    const a = qt(`${i}:${r}`);
    o.Authorization = `Basic ${a}`;
  }
  return e.body !== void 0 && (e.mediaType ? o["Content-Type"] = e.mediaType : Ue(e.body) ? o["Content-Type"] = e.body.type || "application/octet-stream" : ee(e.body) ? o["Content-Type"] = "text/plain" : st(e.body) || (o["Content-Type"] = "application/json")), new Headers(o);
}, Kt = (s) => {
  var e;
  if (s.body !== void 0)
    return (e = s.mediaType) != null && e.includes("/json") ? JSON.stringify(s.body) : ee(s.body) || Ue(s.body) || st(s.body) ? s.body : JSON.stringify(s.body);
}, zt = async (s, e, t, i, r, n, o) => {
  const a = new AbortController(), l = {
    headers: n,
    body: i ?? r,
    method: e.method,
    signal: a.signal
  };
  return s.WITH_CREDENTIALS && (l.credentials = s.CREDENTIALS), o(() => a.abort()), await fetch(t, l);
}, Ft = (s, e) => {
  if (e) {
    const t = s.headers.get(e);
    if (ee(t))
      return t;
  }
}, Gt = async (s) => {
  if (s.status !== 204)
    try {
      const e = s.headers.get("Content-Type");
      if (e)
        return ["application/json", "application/problem+json"].some((r) => e.toLowerCase().startsWith(r)) ? await s.json() : await s.text();
    } catch (e) {
      console.error(e);
    }
}, Jt = (s, e) => {
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
}, Yt = (s, e) => new Mt(async (t, i, r) => {
  try {
    const n = jt(s, e), o = Vt(e), a = Kt(e), l = await Wt(s, e);
    if (!r.isCancelled) {
      const c = await zt(s, e, n, a, o, l, r), b = await Gt(c), u = Ft(c, e.responseHeader), $ = {
        url: n,
        ok: c.ok,
        status: c.status,
        statusText: c.statusText,
        body: u ?? b
      };
      Jt(e, $), t($.body);
    }
  } catch (n) {
    i(n);
  }
});
class Xt extends It {
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
    return Yt(this.config, e);
  }
}
class Zt {
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
class be {
  constructor(e, t = Xt) {
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
    }), this.kraftvaerkUmbracoHeadlessBlockpreviewApiV1 = new Zt(this.request);
  }
}
var Qt = Object.defineProperty, es = Object.getOwnPropertyDescriptor, it = (s) => {
  throw TypeError(s);
}, g = (s, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? es(e, t) : e, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && Qt(e, t, r), r;
}, He = (s, e, t) => e.has(s) || it("Cannot " + t), d = (s, e, t) => (He(s, e, "read from private field"), t ? t.call(s) : e.get(s)), _ = (s, e, t) => e.has(s) ? it("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, t), m = (s, e, t, i) => (He(s, e, "write to private field"), e.set(s, t), t), ts = (s, e, t) => (He(s, e, "access private method"), t), C, O, L, k, _e, oe, ae, le, F, ce, P, he, de, ue, Se, rt;
const ss = "umb-headless-preview";
let p = class extends Ge {
  constructor() {
    super(), _(this, Se), _(this, C, null), _(this, O), _(this, L), _(this, k), _(this, _e), _(this, oe), _(this, ae, !1), _(this, le, []), _(this, F), _(this, ce, !1), _(this, P), _(this, he, !1), _(this, de, !1), _(this, ue, !1), this.init();
  }
  async updated(s) {
    super.updated(s), (d(this, O) !== this.content || d(this, L) !== this.settings) && ts(this, Se, rt).call(this);
  }
  render() {
    var s, e, t, i, r, n;
    return d(this, P) || m(this, P, p.blockSettings.find((o) => {
      var a;
      return o.id == ((a = this.blockType) == null ? void 0 : a.contentElementTypeKey);
    })), d(this, O) || m(this, O, this.content), d(this, L) || m(this, L, this.settings), d(this, le).forEach((o) => {
      this.manageButtons(o);
    }), p.useBeamFallback || d(this, k) === "blockbeam" || d(this, ce) && !((s = d(this, P)) != null && s.enabledNested) || !((e = d(this, P)) != null && e.enabledGrid) && d(this, he) || !((t = d(this, P)) != null && t.enabledList) && d(this, de) || !((i = d(this, P)) != null && i.enabledRTE) && d(this, ue) || d(this, F) ? this.blockBeam(d(this, F)) : re`<div class="__headless-preview"><a href=${((r = this.config) != null && r.showContentEdit ? (n = this.config) == null ? void 0 : n.editContentPath : void 0) ?? ""}>${Lt(d(this, k))}</a></div>`;
  }
  async init() {
    m(this, k, p.loadingBarHtml), this.consumeContext(ot, (s) => {
      var t;
      m(this, oe, (t = s == null ? void 0 : s.getVariantId()) == null ? void 0 : t.culture), console.log(s == null ? void 0 : s.getHostElement().tagName), m(this, he, (s == null ? void 0 : s.getHostElement().tagName) === "UMB-PROPERTY-EDITOR-UI-BLOCK-GRID"), m(this, de, (s == null ? void 0 : s.getHostElement().tagName) === "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST"), m(this, ue, (s == null ? void 0 : s.getHostElement().tagName) === "UMB-PROPERTY-EDITOR-UI-TIPTAP");
      const e = s == null ? void 0 : s.getHostElement();
      e != null && m(this, le, this.findAllInShadowRoots("uui-action-bar", e));
    }), this.consumeContext(at, (s) => {
      m(this, C, s == null ? void 0 : s.getUnique()), m(this, O, this.content), this.getHtmlString().then(() => {
        this.requestUpdate();
      });
    }), this.checkReadiness(), this.uiLoop();
  }
  checkReadiness() {
    setTimeout(() => {
      d(this, k) === p.loadingBarHtml ? ((d(this, C) === null || d(this, C) === void 0) && m(this, ce, !0), this.getHtmlString()) : this.checkReadiness();
    }, 500);
  }
  uiLoop() {
    setTimeout(() => {
      d(this, ae) !== p.useBeamFallback && (m(this, ae, p.useBeamFallback), this.requestUpdate()), this.uiLoop();
    }, 100);
  }
  async getHtmlString() {
    var e, t;
    const s = {
      id: d(this, C),
      contentType: (e = this.blockType) == null ? void 0 : e.contentElementTypeKey,
      settingsType: ((t = this.blockType) == null ? void 0 : t.settingsElementTypeKey) ?? "",
      content: JSON.stringify(d(this, O)),
      settings: JSON.stringify(d(this, L) ?? {}),
      culture: d(this, oe)
    };
    try {
      this.consumeContext(pe, async (i) => {
        const r = await (i == null ? void 0 : i.getLatestToken());
        if (r) {
          const o = await new be({
            TOKEN: r
          }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
            requestBody: s
          });
          m(this, k, o.html ?? "blockbeam"), this.requestUpdate();
        }
      });
    } catch (i) {
      m(this, k, "blockbeam"), m(this, F, i instanceof Error ? i.message : "Unknown error");
    }
  }
  blockBeam(s) {
    var t, i;
    const e = this.label + (s ? `- Rendering-error:  ${s}` : "");
    return re`<umb-ref-grid-block
      standalone
      href=${((t = this.config) != null && t.showContentEdit ? (i = this.config) == null ? void 0 : i.editContentPath : void 0) ?? ""}>
      <umb-icon slot="icon" .name=${this.icon}></umb-icon>
      <umb-ufm-render slot="name" inline .markdown=${e} .value=${this.content}></umb-ufm-render>
      ${this.unpublished ? re`<uui-tag slot="name" look="secondary" title=${this.localize.term("blockEditor_notExposedDescription")}>
            <umb-localize key="blockEditor_notExposedLabel"></umb-localize>
          </uui-tag>` : f}
      <umb-block-grid-areas-container slot="areas" draggable="false"></umb-block-grid-areas-container>
    </umb-ref-grid-block>`;
  }
  findAllInShadowRoots(s, e) {
    const t = [];
    function i(r) {
      r instanceof Element && r.matches(s) && t.push(r);
      const n = r.shadowRoot;
      n && Array.from(n.children).forEach(i), r instanceof Element && Array.from(r.children).forEach(i);
    }
    return i(e), t;
  }
  manageButtons(s) {
    var t;
    if (s.querySelector(".__blockpreview-button")) return;
    const e = this.getHostElement().ownerDocument.createElement("a");
    e.classList.add("__blockpreview-button"), e.setAttribute("data-id", ((t = d(this, C)) == null ? void 0 : t.toString()) ?? ""), e.setAttribute("style", `
      height: 33px;
      width: 33px;
      background: #f3f3f5;
      cursor: pointer;
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;
      display: inline-block;
    `), e.innerHTML = `
      <svg style="height: 17px; margin: 8px;" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" class="lucide lucide-container" viewBox="0 0 24 24">
        <path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"></path>
        <path d="M10 21.9V14L2.1 9.1M10 14l11.9-6.9M14 19.8v-8.1M18 17.5V9.4"></path>
      </svg>
    `, e.addEventListener("mouseenter", () => {
      e.style.background = "#ffffff";
    }), e.addEventListener("mouseleave", () => {
      e.style.background = "#f3f3f5";
    }), e.addEventListener("click", () => {
      p.useBeamFallback = !p.useBeamFallback, this.requestUpdate();
    }), s.insertBefore(e, s.firstElementChild);
  }
};
C = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
L = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
_e = /* @__PURE__ */ new WeakMap();
oe = /* @__PURE__ */ new WeakMap();
ae = /* @__PURE__ */ new WeakMap();
le = /* @__PURE__ */ new WeakMap();
F = /* @__PURE__ */ new WeakMap();
ce = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
he = /* @__PURE__ */ new WeakMap();
de = /* @__PURE__ */ new WeakMap();
ue = /* @__PURE__ */ new WeakMap();
Se = /* @__PURE__ */ new WeakSet();
rt = function() {
  clearTimeout(d(this, _e)), m(this, _e, window.setTimeout(async () => {
    m(this, O, this.content), m(this, L, this.settings), await this.getHtmlString();
  }, 10));
};
p.useBeamFallback = !1;
p.loadingBarHtml = '<uui-loader-bar style="color: #006eff"></uui-loader-bar>';
p.blockSettings = [];
p.styles = [
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

      .__blockpreview-button {
        cursor: pointer;
      }

      .__block-preview {
        width: 100%;
      }
    `
];
g([
  E({ attribute: !1 })
], p.prototype, "content", 2);
g([
  E({ attribute: !1 })
], p.prototype, "settings", 2);
g([
  E({ attribute: !1 })
], p.prototype, "blockType", 2);
g([
  E({ attribute: !1 })
], p.prototype, "label", 2);
g([
  E({ attribute: !1 })
], p.prototype, "icon", 2);
g([
  E({ attribute: !1 })
], p.prototype, "config", 2);
g([
  E({ attribute: !1 })
], p.prototype, "contentInvalid", 2);
g([
  E({ attribute: !1 })
], p.prototype, "settingsInvalid", 2);
g([
  E({ attribute: !1 })
], p.prototype, "unsupported", 2);
g([
  E({ attribute: !1 })
], p.prototype, "unpublished", 2);
p = g([
  tt(ss)
], p);
var is = Object.defineProperty, rs = Object.getOwnPropertyDescriptor, nt = (s, e, t, i) => {
  for (var r = i > 1 ? void 0 : i ? rs(e, t) : e, n = s.length - 1, o; n >= 0; n--)
    (o = s[n]) && (r = (i ? o(e, t, r) : o(r)) || r);
  return i && r && is(e, t, r), r;
};
const ns = "umb-headless-preview-workspace-view";
let K = class extends Ge {
  constructor() {
    super(), this.model = {
      id: "",
      enabled: !1,
      enabledNested: !1,
      enabledList: !1,
      enabledGrid: !1,
      enabledRTE: !1,
      advancedSettings: ""
    }, this.consumeContext(lt, async (s) => {
      const e = s == null ? void 0 : s.getUnique();
      e && (this.model.id = e, await this.loadInitialState());
    });
  }
  async loadInitialState() {
    try {
      this.consumeContext(pe, async (s) => {
        const e = await (s == null ? void 0 : s.getLatestToken()) ?? "", t = (s == null ? void 0 : s.getServerUrl()) ?? "", r = await new be({
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
    this.model = { ...this.model, ...s }, this.consumeContext(pe, async (e) => {
      const t = await (e == null ? void 0 : e.getLatestToken()) ?? "", i = (e == null ? void 0 : e.getServerUrl()) ?? "";
      await new be({
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
    return re`
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
K.styles = [
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
  Ht()
], K.prototype, "model", 2);
K = nt([
  tt(ns)
], K);
const ys = async (s, e) => {
  s.consumeContext(pe, async (t) => {
    const i = await (t == null ? void 0 : t.getLatestToken()) ?? "", r = (t == null ? void 0 : t.getServerUrl()) ?? "", n = await os(r, i);
    p.blockSettings = n;
    const o = {
      alias: "Kraftvaerk.Umbraco.Headless.BlockPreview",
      name: "Umbraco Community Headless Block Preview",
      type: "blockEditorCustomView",
      element: p,
      forContentTypeAlias: n.filter((c) => c.enabled && c.alias).map((c) => c.alias) ?? []
    }, a = {
      type: "workspaceView",
      alias: "umb.workspaceView.headlessPreviewGrid",
      name: "Headless Preview",
      element: K,
      weight: 1100,
      meta: {
        label: "Block Preview",
        pathname: "preview",
        icon: "icon-settings"
      },
      conditions: [
        {
          alias: Ce,
          match: ct
        }
      ]
    }, l = {
      type: "workspaceView",
      alias: "umb.workspaceView.headlessPreviewList",
      name: "Headless Preview",
      element: K,
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
    };
    e.register(o), e.register(a), e.register(l);
  });
};
async function os(s, e) {
  as();
  try {
    const i = await new be({ BASE: s, TOKEN: e }).kraftvaerkUmbracoHeadlessBlockpreviewApiV1.optionsApiV1KraftvaerkUmbracoHeadlessBlockpreview();
    return console.log("Enabled block aliases:", i), i;
  } catch (t) {
    return console.error("Fetch failed:", t), [];
  }
}
async function as() {
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
  ys as onInit
};
//# sourceMappingURL=dist.js.map

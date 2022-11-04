var vt = Object.defineProperty,
  Ct = Object.defineProperties
var Tt = Object.getOwnPropertyDescriptors
var Ue = Object.getOwnPropertySymbols
var St = Object.prototype.hasOwnProperty,
  Rt = Object.prototype.propertyIsEnumerable
var Ke = (v, E, w) =>
    E in v
      ? vt(v, E, { enumerable: !0, configurable: !0, writable: !0, value: w })
      : (v[E] = w),
  T = (v, E) => {
    for (var w in E || (E = {})) St.call(E, w) && Ke(v, w, E[w])
    if (Ue) for (var w of Ue(E)) Rt.call(E, w) && Ke(v, w, E[w])
    return v
  },
  j = (v, E) => Ct(v, Tt(E))
var k = (v, E, w) =>
  new Promise((S, U) => {
    var Q = I => {
        try {
          b(w.next(I))
        } catch (R) {
          U(R)
        }
      },
      X = I => {
        try {
          b(w.throw(I))
        } catch (R) {
          U(R)
        }
      },
      b = I => (I.done ? S(I.value) : Promise.resolve(I.value).then(Q, X))
    b((w = w.apply(v, E)).next())
  })
;(function (v, E) {
  typeof exports == 'object' && typeof module != 'undefined'
    ? (module.exports = E())
    : typeof define == 'function' && define.amd
    ? define(E)
    : ((v = typeof globalThis != 'undefined' ? globalThis : v || self),
      (v['tiny-whiteboard'] = E()))
})(this, function () {
  'use strict'
  var v = { exports: {} }
  ;(function (r) {
    var e = Object.prototype.hasOwnProperty,
      t = '~'
    function i() {}
    Object.create &&
      ((i.prototype = Object.create(null)), new i().__proto__ || (t = !1))
    function s(a, o, c) {
      ;(this.fn = a), (this.context = o), (this.once = c || !1)
    }
    function n(a, o, c, d, g) {
      if (typeof c != 'function')
        throw new TypeError('The listener must be a function')
      var m = new s(c, d || a, g),
        f = t ? t + o : o
      return (
        a._events[f]
          ? a._events[f].fn
            ? (a._events[f] = [a._events[f], m])
            : a._events[f].push(m)
          : ((a._events[f] = m), a._eventsCount++),
        a
      )
    }
    function h(a, o) {
      --a._eventsCount === 0 ? (a._events = new i()) : delete a._events[o]
    }
    function l() {
      ;(this._events = new i()), (this._eventsCount = 0)
    }
    ;(l.prototype.eventNames = function () {
      var o = [],
        c,
        d
      if (this._eventsCount === 0) return o
      for (d in (c = this._events)) e.call(c, d) && o.push(t ? d.slice(1) : d)
      return Object.getOwnPropertySymbols
        ? o.concat(Object.getOwnPropertySymbols(c))
        : o
    }),
      (l.prototype.listeners = function (o) {
        var c = t ? t + o : o,
          d = this._events[c]
        if (!d) return []
        if (d.fn) return [d.fn]
        for (var g = 0, m = d.length, f = new Array(m); g < m; g++)
          f[g] = d[g].fn
        return f
      }),
      (l.prototype.listenerCount = function (o) {
        var c = t ? t + o : o,
          d = this._events[c]
        return d ? (d.fn ? 1 : d.length) : 0
      }),
      (l.prototype.emit = function (o, c, d, g, m, f) {
        var y = t ? t + o : o
        if (!this._events[y]) return !1
        var p = this._events[y],
          L = arguments.length,
          G,
          x
        if (p.fn) {
          switch ((p.once && this.removeListener(o, p.fn, void 0, !0), L)) {
            case 1:
              return p.fn.call(p.context), !0
            case 2:
              return p.fn.call(p.context, c), !0
            case 3:
              return p.fn.call(p.context, c, d), !0
            case 4:
              return p.fn.call(p.context, c, d, g), !0
            case 5:
              return p.fn.call(p.context, c, d, g, m), !0
            case 6:
              return p.fn.call(p.context, c, d, g, m, f), !0
          }
          for (x = 1, G = new Array(L - 1); x < L; x++) G[x - 1] = arguments[x]
          p.fn.apply(p.context, G)
        } else {
          var xt = p.length,
            J
          for (x = 0; x < xt; x++)
            switch (
              (p[x].once && this.removeListener(o, p[x].fn, void 0, !0), L)
            ) {
              case 1:
                p[x].fn.call(p[x].context)
                break
              case 2:
                p[x].fn.call(p[x].context, c)
                break
              case 3:
                p[x].fn.call(p[x].context, c, d)
                break
              case 4:
                p[x].fn.call(p[x].context, c, d, g)
                break
              default:
                if (!G)
                  for (J = 1, G = new Array(L - 1); J < L; J++)
                    G[J - 1] = arguments[J]
                p[x].fn.apply(p[x].context, G)
            }
        }
        return !0
      }),
      (l.prototype.on = function (o, c, d) {
        return n(this, o, c, d, !1)
      }),
      (l.prototype.once = function (o, c, d) {
        return n(this, o, c, d, !0)
      }),
      (l.prototype.removeListener = function (o, c, d, g) {
        var m = t ? t + o : o
        if (!this._events[m]) return this
        if (!c) return h(this, m), this
        var f = this._events[m]
        if (f.fn)
          f.fn === c && (!g || f.once) && (!d || f.context === d) && h(this, m)
        else {
          for (var y = 0, p = [], L = f.length; y < L; y++)
            (f[y].fn !== c || (g && !f[y].once) || (d && f[y].context !== d)) &&
              p.push(f[y])
          p.length ? (this._events[m] = p.length === 1 ? p[0] : p) : h(this, m)
        }
        return this
      }),
      (l.prototype.removeAllListeners = function (o) {
        var c
        return (
          o
            ? ((c = t ? t + o : o), this._events[c] && h(this, c))
            : ((this._events = new i()), (this._eventsCount = 0)),
          this
        )
      }),
      (l.prototype.off = l.prototype.removeListener),
      (l.prototype.addListener = l.prototype.on),
      (l.prefixed = t),
      (l.EventEmitter = l),
      (r.exports = l)
  })(v)
  var E = v.exports
  const w = (r, e, t = { noStyle: !1, noTranslate: !1, className: '' }) => {
      let i = document.createElement('canvas')
      t.noStyle ||
        (i.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
    `),
        t.className && (i.className = t.className)
      let s = i.getContext('2d')
      return (
        (i.width = r),
        (i.height = e),
        t.noTranslate || s.translate(i.width / 2, i.height / 2),
        { canvas: i, ctx: s }
      )
    },
    S = (r, e, t, i) => Math.sqrt(Math.pow(r - t, 2) + Math.pow(e - i, 2)),
    U = (r, e, t, i, s, n) => {
      if (t === s) return Math.abs(r - t)
      {
        let h = 1,
          l,
          a
        return (
          (l = (i - n) / (s - t)),
          (a = 0 - h * i - l * t),
          Math.abs((l * r + h * e + a) / Math.sqrt(l * l + h * h))
        )
      }
    },
    Q = (r, e, t, i, s, n, h = 10) => {
      if (U(r, e, t, i, s, n) > h) return !1
      let l = S(r, e, t, i),
        a = S(r, e, s, n),
        o = S(t, i, s, n),
        c = Math.sqrt(h * h + o * o)
      return l <= c && a <= c
    },
    X = r => r * (180 / Math.PI),
    b = r => r * (Math.PI / 180),
    I = (r, e, t, i, s, n) =>
      X(Math.atan2(i - e, t - r) - Math.atan2(n - e, s - r)),
    R = (r, e, t, i, s) => {
      let h = X(Math.atan2(e - i, r - t)) + s,
        l = S(r, e, t, i)
      return { x: Math.cos(b(h)) * l + t, y: Math.sin(b(h)) * l + i }
    },
    O = r => {
      let { x: e, y: t, width: i, height: s } = r
      return { x: e + i / 2, y: t + s / 2 }
    },
    ie = (r, e, t, i, s) => {
      if (s !== 0) {
        let n = R(r, e, t, i, -s)
        ;(r = n.x), (e = n.y)
      }
      return { x: r, y: e }
    },
    P = (r, e, t) => {
      let i = O(t)
      return ie(r, e, i.x, i.y, t.rotate)
    },
    me = (r, e) => {
      let { x: t, y: i, width: s, height: n } = r
      switch (e) {
        case 'topLeft':
          return { x: t, y: i }
        case 'topRight':
          return { x: t + s, y: i }
        case 'bottomRight':
          return { x: t + s, y: i + n }
        case 'bottomLeft':
          return { x: t, y: i + n }
      }
    },
    H = (r, e) => {
      let t = O(r),
        i = me(r, e)
      return R(i.x, i.y, t.x, t.y, r.rotate)
    },
    q = (r, e, t, i, s, n) => {
      if (typeof t == 'object') {
        let h = t
        ;(t = h.x), (i = h.y), (s = h.width), (n = h.height)
      }
      return r >= t && r <= t + s && e >= i && e <= i + n
    },
    Z = (r = [], e = !1) => {
      let t = 1 / 0,
        i = -1 / 0,
        s = 1 / 0,
        n = -1 / 0
      r.forEach(c => {
        let [d, g] = c
        d < t && (t = d), d > i && (i = d), g < s && (s = g), g > n && (n = g)
      })
      let h = t,
        l = s,
        a = i - t,
        o = n - s
      return e
        ? [
            { x: h, y: l },
            { x: h + a, y: l },
            { x: h + a, y: l + o },
            { x: h, y: l + o }
          ]
        : { x: h, y: l, width: a, height: o }
    },
    se = r => JSON.parse(JSON.stringify(r)),
    ne = (r, e) => `${r}px ${e}`,
    F = r =>
      r.replace(
        /\r\n?/g,
        `
`
      ).split(`
`)
  let _ = null
  const re = (r, e) => {
      _ ||
        ((_ = document.createElement('div')),
        (_.style.position = 'fixed'),
        (_.style.left = '-99999px'),
        document.body.appendChild(_))
      let { fontSize: t, fontFamily: i } = e
      ;(_.innerText = r),
        (_.style.fontSize = t + 'px'),
        (_.style.fontFamily = i)
      let { width: s } = _.getBoundingClientRect()
      return s
    },
    Ve = (r, e, t) => {
      let i = 12
      for (; re(r, j(T({}, t), { fontSize: i + 1 })) < e; ) i++
      return i
    },
    ge = r => {
      let { text: e } = r,
        t = F(e),
        i = -1 / 0
      return (
        t.forEach(s => {
          let n = re(s, r.style)
          n > i && (i = n)
        }),
        i
      )
    },
    Je = r => {
      let e = F(r),
        t = -1 / 0
      return (
        e.forEach(i => {
          i.length > t && (t = i.length)
        }),
        t
      )
    },
    fe = r => {
      let { text: e, style: t } = r,
        i = ge(r)
      const s = Math.max(F(e).length, 1)
      let n = t.fontSize * t.lineHeightRatio,
        h = s * n
      return { width: i, height: h }
    },
    D = (r, e, t = 100) => {
      let i = null
      return (...s) => {
        i ||
          (i = setTimeout(() => {
            r.call(e, ...s), (i = null)
          }, t))
      }
    },
    le = (r, e, t = 2) => {
      let i = 0,
        s = t,
        n = 10,
        h = 0.5
      return (
        r >= n
          ? (i = t)
          : r <= h
          ? (i = s + 1)
          : (i = s - ((r - h) / (n - h)) * s),
        e === -1 && (e = s),
        i * (1 / 2) + e * (1 / 2)
      )
    },
    Qe = (r, e) => {
      let t = document.createElement('a')
      ;(t.href = r), (t.download = e), t.click()
    },
    Ee = r => {
      let e = H(r, 'topLeft'),
        t = H(r, 'topRight'),
        i = H(r, 'bottomLeft'),
        s = H(r, 'bottomRight')
      return [e, t, i, s]
    },
    K = (r = []) => {
      if (r.length <= 0) return { minx: 0, maxx: 0, miny: 0, maxy: 0 }
      let e = 1 / 0,
        t = -1 / 0,
        i = 1 / 0,
        s = -1 / 0
      return (
        r.forEach(n => {
          n.getEndpointList().forEach(({ x: l, y: a }) => {
            l < e && (e = l),
              l > t && (t = l),
              a < i && (i = a),
              a > s && (s = a)
          })
        }),
        { minx: e, maxx: t, miny: i, maxy: s }
      )
    },
    $ = r =>
      new Promise(e => {
        let t = new Image()
        t.setAttribute('crossOrigin', 'anonymous'),
          (t.onload = () => {
            e(t)
          }),
          (t.onerror = () => {
            e(null)
          }),
          (t.src = r)
      })
  let qe = 0
  const ye = () => qe++
  var Ze = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        createCanvas: w,
        getTowPointDistance: S,
        getPointToLineDistance: U,
        checkIsAtSegment: Q,
        radToDeg: X,
        degToRad: b,
        getTowPointRotate: I,
        getRotatedPoint: R,
        getElementCenterPoint: O,
        transformPointReverseRotate: ie,
        transformPointOnElement: P,
        getElementCornerPoint: me,
        getElementRotatedCornerPoint: H,
        checkPointIsInRectangle: q,
        getBoundingRect: Z,
        deepCopy: se,
        getFontString: ne,
        splitTextLines: F,
        getTextActWidth: re,
        getMaxFontSizeInWidth: Ve,
        getWrapTextActWidth: ge,
        getWrapTextMaxRowTextNumber: Je,
        getTextElementSize: fe,
        throttle: D,
        computedLineWidthBySpeed: le,
        downloadFile: Qe,
        getElementCorners: Ee,
        getMultiElementRectInfo: K,
        createImageObj: $,
        createNodeKey: ye
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  )
  const z = {
      TOP_LEFT: 'topLeft',
      TOP_RIGHT: 'topRight',
      BOTTOM_RIGHT: 'bottomRight',
      BOTTOM_LEFT: 'bottomLeft'
    },
    u = {
      BODY: 'body',
      ROTATE: 'rotate',
      TOP_LEFT_BTN: 'topLeftBtn',
      TOP_RIGHT_BTN: 'topRightBtn',
      BOTTOM_RIGHT_BTN: 'bottomRightBtn',
      BOTTOM_LEFT_BTN: 'bottomLeftBtn'
    },
    ee = 10,
    N = (r, e) => {
      let t = !1
      return (
        r.forEach(i => {
          t || (Q(e.x, e.y, ...i, ee) && (t = !0))
        }),
        t
      )
    },
    we = (r, e) => {
      let { x: t, y: i, width: s, height: n } = r,
        h = [
          [t, i, t + s, i],
          [t + s, i, t + s, i + n],
          [t + s, i + n, t, i + n],
          [t, i + n, t, i]
        ]
      return N(h, e) ? r : null
    },
    he = (r, e) => (q(e.x, e.y, r) ? r : null),
    ae = (r, e) => Math.min(Math.abs(r), Math.abs(e)) / 2,
    xe = (r, e) => {
      let { width: t, height: i, x: s, y: n } = r,
        h = ae(t, i),
        l = S(e.x, e.y, s + h, n + h)
      return l >= h - ee && l <= h + ee ? r : null
    },
    ve = (r, e) => {
      let t = [],
        i = r.pointArr.length,
        s = r.pointArr
      for (let n = 0; n < i - 1; n++) t.push([...s[n], ...s[n + 1]])
      return N(t, e) ? r : null
    },
    Ce = (r, e) => {
      let t = null
      return (
        r.pointArr.forEach(i => {
          if (t) return
          S(e.x, e.y, i[0], i[1]) <= ee && (t = r)
        }),
        t
      )
    },
    Te = (r, e) => {
      let { x: t, y: i, width: s, height: n } = r,
        h = [
          [t + s / 2, i, t + s, i + n / 2],
          [t + s, i + n / 2, t + s / 2, i + n],
          [t + s / 2, i + n, t, i + n / 2],
          [t, i + n / 2, t + s / 2, i]
        ]
      return N(h, e) ? r : null
    },
    Se = (r, e) => {
      let { x: t, y: i, width: s, height: n } = r,
        h = [
          [t + s / 2, i, t + s, i + n],
          [t + s, i + n, t, i + n],
          [t, i + n, t + s / 2, i]
        ]
      return N(h, e) ? r : null
    },
    Re = (r, e) => {
      let t = r.pointArr,
        i = t[0][0],
        s = t[0][1],
        n = t[t.length - 1][0],
        h = t[t.length - 1][1]
      return N([[i, s, n, h]], e) ? r : null
    }
  var $e = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        checkIsAtMultiSegment: N,
        checkIsAtRectangleEdge: we,
        checkIsAtRectangleInner: he,
        getCircleRadius: ae,
        checkIsAtCircleEdge: xe,
        checkIsAtLineEdge: ve,
        checkIsAtFreedrawLineEdge: Ce,
        checkIsAtDiamondEdge: Te,
        checkIsAtTriangleEdge: Se,
        checkIsAtArrowEdge: Re
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  )
  const A = (r, e, t = !1) => {
      r.beginPath(), e(), r.stroke(), t && r.fill()
    },
    Y = (r, e, t, i, s, n = !1) => {
      A(r, () => {
        r.rect(e, t, i, s), n && r.fillRect(e, t, i, s)
      })
    },
    Ae = (r, e, t, i, s, n = !1) => {
      A(
        r,
        () => {
          r.moveTo(e + i / 2, t),
            r.lineTo(e + i, t + s / 2),
            r.lineTo(e + i / 2, t + s),
            r.lineTo(e, t + s / 2),
            r.closePath()
        },
        n
      )
    },
    be = (r, e, t, i, s, n = !1) => {
      A(
        r,
        () => {
          r.moveTo(e + i / 2, t),
            r.lineTo(e + i, t + s),
            r.lineTo(e, t + s),
            r.closePath()
        },
        n
      )
    },
    oe = (r, e, t, i, s = !1) => {
      A(
        r,
        () => {
          r.arc(e, t, i, 0, 2 * Math.PI)
        },
        s
      )
    },
    ze = (r, e) => {
      A(r, () => {
        let t = !0
        e.forEach(i => {
          t ? ((t = !1), r.moveTo(i[0], i[1])) : r.lineTo(i[0], i[1])
        })
      })
    },
    Ie = (r, e) => {
      let t = e[0][0],
        i = e[0][1],
        s = e[e.length - 1][0],
        n = e[e.length - 1][1]
      A(
        r,
        () => {
          r.moveTo(t, i), r.lineTo(s, n)
        },
        !0
      )
      let h = 30,
        l = 30,
        a = X(Math.atan2(n - i, s - t))
      A(
        r,
        () => {
          let o = l - a,
            c = s - h * Math.cos(b(o)),
            d = n + h * Math.sin(b(o))
          r.moveTo(c, d), r.lineTo(s, n)
        },
        !0
      ),
        A(r, () => {
          let o = 90 - a - l,
            c = s - h * Math.sin(b(o)),
            d = n - h * Math.cos(b(o))
          r.moveTo(c, d), r.lineTo(s, n)
        })
    },
    Pe = (r, e) => {
      let { x: t, y: i } = e.app.coordinate.transform(r[0], r[1])
      return [t - e.cx, i - e.cy, ...r.slice(2)]
    },
    Le = (r, e, t) => {
      for (let i = 0; i < e.length - 1; i++)
        A(
          r,
          () => {
            let s = Pe(e[i], t),
              n = Pe(e[i + 1], t)
            ce(r, s[0], s[1], n[0], n[1], n[2])
          },
          !0
        )
    },
    ce = (r, e, t, i, s, n = 0) => {
      A(r, () => {
        n > 0 && (r.lineWidth = n),
          r.moveTo(e, t),
          r.lineTo(i, s),
          (r.lineCap = 'round'),
          (r.lineJoin = 'round')
      })
    },
    Me = (r, e, t, i, s, n) => {
      let { text: h, style: l } = e,
        a = l.fontSize * l.lineHeightRatio
      A(r, () => {
        ;(r.font = ne(l.fontSize, l.fontFamily)),
          (r.textBaseline = 'middle'),
          F(h).forEach((c, d) => {
            r.fillText(c, t, i + (d * a + a / 2))
          })
      })
    },
    ke = (r, e, t, i, s, n) => {
      A(r, () => {
        let h = s / n,
          l = 0,
          a = 0
        h > e.ratio
          ? ((a = n), (l = e.ratio * n))
          : ((l = s), (a = s / e.ratio)),
          r.drawImage(e.imageObj, t, i, l, a)
      })
    }
  var et = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        drawWrap: A,
        drawRect: Y,
        drawDiamond: Ae,
        drawTriangle: be,
        drawCircle: oe,
        drawLine: ze,
        drawArrow: Ie,
        drawFreeLine: Le,
        drawLineSegment: ce,
        drawText: Me,
        drawImage: ke
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  )
  class Oe {
    constructor(e) {
      this.app = e
    }
    addScrollY(e) {
      return e + this.app.state.scrollY
    }
    addScrollX(e) {
      return e + this.app.state.scrollX
    }
    subScrollY(e) {
      return e - this.app.state.scrollY
    }
    subScrollX(e) {
      return e - this.app.state.scrollX
    }
    transformToCanvasCoordinate(e, t) {
      return (
        (e -= this.app.width / 2), (t -= this.app.height / 2), { x: e, y: t }
      )
    }
    transformToScreenCoordinate(e, t) {
      return (
        (e += this.app.width / 2), (t += this.app.height / 2), { x: e, y: t }
      )
    }
    transform(e, t) {
      let i = this.transformToCanvasCoordinate(e, t)
      return { x: this.subScrollX(i.x), y: this.subScrollY(i.y) }
    }
    windowToContainer(e, t) {
      return { x: e - this.app.left, y: t - this.app.top }
    }
    containerToWindow(e, t) {
      return { x: e + this.app.left, y: t + this.app.top }
    }
    scale(e, t) {
      let { state: i } = this.app,
        s = this.transformToCanvasCoordinate(e, t),
        n = this.transformToScreenCoordinate(s.x * i.scale, s.y * i.scale)
      return { x: n.x, y: n.y }
    }
    reverseScale(e, t) {
      let { state: i } = this.app,
        s = this.transformToCanvasCoordinate(e, t),
        n = this.transformToScreenCoordinate(s.x / i.scale, s.y / i.scale)
      return { x: n.x, y: n.y }
    }
    gridAdsorbent(e, t) {
      let { gridConfig: i, showGrid: s } = this.app.state
      if (!s) return { x: e, y: t }
      let n = i.size
      return { x: e - (e % n), y: t - (t % n) }
    }
  }
  class tt extends E {
    constructor(e) {
      super(),
        (this.app = e),
        (this.coordinate = e.coordinate),
        (this.isMousedown = !1),
        (this.mousedownPos = {
          x: 0,
          y: 0,
          unGridClientX: 0,
          unGridClientY: 0,
          originClientX: 0,
          originClientY: 0
        }),
        (this.mouseOffset = { x: 0, y: 0, originX: 0, originY: 0 }),
        (this.lastMousePos = { x: 0, y: 0 }),
        (this.mouseDistance = 0),
        (this.lastMouseTime = Date.now()),
        (this.mouseDuration = 0),
        (this.mouseSpeed = 0),
        (this.onMousedown = this.onMousedown.bind(this)),
        (this.onMousemove = this.onMousemove.bind(this)),
        (this.onMouseup = this.onMouseup.bind(this)),
        (this.onDblclick = this.onDblclick.bind(this)),
        (this.onMousewheel = this.onMousewheel.bind(this)),
        (this.onKeydown = this.onKeydown.bind(this)),
        (this.onKeyup = this.onKeyup.bind(this)),
        (this.onContextmenu = this.onContextmenu.bind(this)),
        this.bindEvent()
    }
    bindEvent() {
      this.app.container.addEventListener('mousedown', this.onMousedown),
        this.app.container.addEventListener('mousemove', this.onMousemove),
        this.app.container.addEventListener('mouseup', this.onMouseup),
        this.app.container.addEventListener('dblclick', this.onDblclick),
        this.app.container.addEventListener('mousewheel', this.onMousewheel),
        this.app.container.addEventListener('contextmenu', this.onContextmenu),
        window.addEventListener('keydown', this.onKeydown),
        window.addEventListener('keyup', this.onKeyup)
    }
    unbindEvent() {
      this.app.container.removeEventListener('mousedown', this.onMousedown),
        this.app.container.removeEventListener('mousemove', this.onMousemove),
        this.app.container.removeEventListener('mouseup', this.onMouseup),
        this.app.container.removeEventListener('dblclick', this.onDblclick),
        this.app.container.removeEventListener('mousewheel', this.onMousewheel),
        this.app.container.removeEventListener(
          'contextmenu',
          this.onContextmenu
        ),
        window.removeEventListener('keydown', this.onKeydown),
        window.removeEventListener('keyup', this.onKeyup)
    }
    transformEvent(e) {
      let { coordinate: t } = this.app,
        i = t.windowToContainer(e.clientX, e.clientY),
        { x: s, y: n } = t.reverseScale(i.x, i.y)
      ;(s = t.addScrollX(s)), (n = t.addScrollY(n))
      let h = s,
        l = n,
        a = t.gridAdsorbent(s, n)
      return {
        originEvent: e,
        unGridClientX: h,
        unGridClientY: l,
        clientX: a.x,
        clientY: a.y
      }
    }
    onMousedown(e) {
      ;(e = this.transformEvent(e)),
        (this.isMousedown = !0),
        (this.mousedownPos.x = e.clientX),
        (this.mousedownPos.y = e.clientY),
        (this.mousedownPos.unGridClientX = e.unGridClientX),
        (this.mousedownPos.unGridClientY = e.unGridClientY),
        (this.mousedownPos.originClientX = e.originEvent.clientX),
        (this.mousedownPos.originClientY = e.originEvent.clientY),
        this.emit('mousedown', e, this)
    }
    onMousemove(e) {
      e = this.transformEvent(e)
      let t = e.clientX,
        i = e.clientY
      this.isMousedown &&
        ((this.mouseOffset.x = t - this.mousedownPos.x),
        (this.mouseOffset.y = i - this.mousedownPos.y),
        (this.mouseOffset.originX =
          e.originEvent.clientX - this.mousedownPos.originClientX),
        (this.mouseOffset.originY =
          e.originEvent.clientY - this.mousedownPos.originClientY))
      let s = Date.now()
      ;(this.mouseDuration = s - this.lastMouseTime),
        (this.mouseDistance = S(
          t,
          i,
          this.lastMousePos.x,
          this.lastMousePos.y
        )),
        (this.mouseSpeed = this.mouseDistance / this.mouseDuration),
        this.emit('mousemove', e, this),
        (this.lastMouseTime = s),
        (this.lastMousePos.x = t),
        (this.lastMousePos.y = i)
    }
    onMouseup(e) {
      ;(e = this.transformEvent(e)),
        (this.isMousedown = !1),
        (this.mousedownPos.x = 0),
        (this.mousedownPos.y = 0),
        this.emit('mouseup', e, this)
    }
    onDblclick(e) {
      ;(e = this.transformEvent(e)), this.emit('dblclick', e, this)
    }
    onMousewheel(e) {
      ;(e = this.transformEvent(e)),
        this.emit('mousewheel', e.originEvent.wheelDelta < 0 ? 'down' : 'up')
    }
    onContextmenu(e) {
      e.stopPropagation(),
        e.preventDefault(),
        (e = this.transformEvent(e)),
        this.emit('contextmenu', e, this)
    }
    onKeydown(e) {
      this.emit('keydown', e, this)
    }
    onKeyup(e) {
      this.emit('keyup', e, this)
    }
  }
  class B extends E {
    constructor(e = {}, t) {
      super(),
        (this.app = t),
        (this.groupId = e.groupId || ''),
        (this.type = e.type || ''),
        (this.key = ye()),
        (this.isCreating = !0),
        (this.isActive = !0),
        (this.isSelected = !1),
        (this.startX = 0),
        (this.startY = 0),
        (this.x = e.x || 0),
        (this.y = e.y || 0),
        (this.width = e.width || 0),
        (this.height = e.height || 0),
        (this.startRotate = 0),
        (this.rotate = e.rotate || 0),
        (this.noRender = !1),
        (this.style = T(
          {
            strokeStyle: '#000000',
            fillStyle: 'transparent',
            lineWidth: 'small',
            lineDash: 0,
            globalAlpha: 1
          },
          e.style || {}
        )),
        (this.dragElement = null)
    }
    serialize() {
      return {
        groupId: this.groupId,
        type: this.type,
        width: this.width,
        height: this.height,
        x: this.x,
        y: this.y,
        rotate: this.rotate,
        style: T({}, this.style)
      }
    }
    render() {
      throw new Error(
        '\u5B50\u7C7B\u9700\u8981\u5B9E\u73B0\u8BE5\u65B9\u6CD5\uFF01'
      )
    }
    setGroupId(e) {
      this.groupId = e
    }
    getGroupId() {
      return this.groupId
    }
    removeGroupId() {
      this.groupId = ''
    }
    hasGroup() {
      return !!this.groupId
    }
    renderDragElement() {
      this.isActive && !this.isCreating
        ? (this.dragElement.showAll(), this.dragElement.render())
        : this.isSelected &&
          (this.dragElement.onlyShowBody(), this.dragElement.render())
    }
    handleStyle(e) {
      return (
        Object.keys(e).forEach(t => {
          t === 'lineWidth' &&
            (e[t] === 'small'
              ? (e[t] = 2)
              : e[t] === 'middle'
              ? (e[t] = 4)
              : e[t] === 'large' && (e[t] = 6))
        }),
        e
      )
    }
    setStyle(e = {}) {
      let t = this.handleStyle(e)
      return (
        Object.keys(t).forEach(i => {
          i === 'lineDash'
            ? t.lineDash > 0 && this.app.ctx.setLineDash([t.lineDash])
            : t[i] !== void 0 &&
              t[i] !== '' &&
              t[i] !== null &&
              (this.app.ctx[i] = t[i])
        }),
        this
      )
    }
    warpRender(e) {
      let { x: t, y: i, width: s, height: n, rotate: h, style: l } = this,
        { x: a, y: o } = this.app.coordinate.transform(t, i),
        c = s / 2,
        d = n / 2,
        g = a + c,
        m = o + d
      return (
        this.app.ctx.save(),
        this.app.ctx.translate(g, m),
        this.app.ctx.rotate(b(h)),
        this.setStyle(l),
        e({ halfWidth: c, halfHeight: d, tx: a, ty: o, cx: g, cy: m }),
        this.app.ctx.restore(),
        this
      )
    }
    saveState() {
      let { rotate: e, x: t, y: i } = this
      return (this.startRotate = e), (this.startX = t), (this.startY = i), this
    }
    move(e, t) {
      let { startX: i, startY: s } = this
      return (
        (this.x = i + e),
        (this.y = s + t),
        this.emit('elementPositionChange', this.x, this.y),
        this
      )
    }
    updateRect(e, t, i, s) {
      return this.updatePos(e, t), this.updateSize(i, s), this
    }
    updateSize(e, t) {
      return (
        (this.width = e),
        (this.height = t),
        this.emit('elementSizeChange', this.width, this.height),
        this
      )
    }
    updatePos(e, t) {
      return (
        (this.x = e),
        (this.y = t),
        this.emit('elementPositionChange', this.x, this.y),
        this
      )
    }
    offsetRotate(e) {
      return this.updateRotate(this.startRotate + e), this
    }
    updateRotate(e) {
      ;(e = e % 360),
        e < 0 && (e = 360 + e),
        (this.rotate = parseInt(e)),
        this.emit('elementRotateChange', this.rotate)
    }
    rotateByCenter(e, t, i) {
      this.offsetRotate(e)
      let s = R(this.startX, this.startY, t, i, e)
      this.updatePos(s.x, s.y)
    }
    isHit(e, t) {
      throw new Error('\u5B50\u7C7B\u9700\u8981\u5B9E\u73B0\u8BE5\u65B9\u6CD5!')
    }
    startResize(e, t) {
      return this.dragElement.startResize(e, t), this
    }
    endResize() {
      return this.dragElement.endResize(), this
    }
    resize(...e) {
      return this.dragElement.handleResizeElement(...e), this
    }
    getEndpointList() {
      return Ee(this)
    }
  }
  class M extends B {
    constructor(e, t, i = {}) {
      super({ type: 'dragElement', notNeedDragElement: !0 }, t),
        (this.opts = T({ lockRatio: !1 }, i)),
        (this.style = {
          strokeStyle: '#666',
          fillStyle: 'transparent',
          lineWidth: 'small',
          lineDash: 0,
          globalAlpha: 1
        }),
        (this.element = e),
        (this.offset = 5),
        (this.size = 10),
        (this.resizeType = ''),
        (this.diagonalPoint = { x: 0, y: 0 }),
        (this.mousedownPosAndElementPosOffset = { x: 0, y: 0 }),
        (this.elementRatio = 0),
        (this.hideParts = [])
    }
    setHideParts(e = []) {
      this.hideParts = e
    }
    showAll() {
      this.setHideParts([])
    }
    onlyShowBody() {
      this.setHideParts([
        u.ROTATE,
        u.TOP_LEFT_BTN,
        u.TOP_RIGHT_BTN,
        u.BOTTOM_RIGHT_BTN,
        u.BOTTOM_LEFT_BTN
      ])
    }
    update() {
      ;(this.x = this.element.x - this.offset),
        (this.y = this.element.y - this.offset),
        (this.width = this.element.width + this.offset * 2),
        (this.height = this.element.height + this.offset * 2),
        (this.rotate = this.element.rotate)
    }
    render() {
      if (this.element.hasGroup()) return
      this.update()
      let { width: e, height: t } = this
      this.warpRender(({ halfWidth: i, halfHeight: s }) => {
        this.app.ctx.save(),
          this.hideParts.includes(u.BODY) ||
            (this.app.ctx.setLineDash([5]),
            Y(this.app.ctx, -i, -s, e, t),
            this.app.ctx.restore()),
          this.hideParts.includes(u.TOP_LEFT_BTN) ||
            Y(
              this.app.ctx,
              -i - this.size,
              -s - this.size,
              this.size,
              this.size
            ),
          this.hideParts.includes(u.TOP_RIGHT_BTN) ||
            Y(
              this.app.ctx,
              -i + this.element.width + this.size,
              -s - this.size,
              this.size,
              this.size
            ),
          this.hideParts.includes(u.BOTTOM_RIGHT_BTN) ||
            Y(
              this.app.ctx,
              -i + this.element.width + this.size,
              -s + this.element.height + this.size,
              this.size,
              this.size
            ),
          this.hideParts.includes(u.BOTTOM_LEFT_BTN) ||
            Y(
              this.app.ctx,
              -i - this.size,
              -s + this.element.height + this.size,
              this.size,
              this.size
            ),
          this.hideParts.includes(u.ROTATE) ||
            oe(
              this.app.ctx,
              -i + this.element.width / 2 + this.size / 2,
              -s - this.size * 2,
              this.size
            )
      })
    }
    checkPointInDragElementWhere(e, t) {
      let i = '',
        s = P(e, t, this.element)
      return (
        q(s.x, s.y, this)
          ? (i = u.BODY)
          : S(s.x, s.y, this.x + this.width / 2, this.y - this.size * 2) <=
            this.size
          ? (i = u.ROTATE)
          : this._checkPointIsInBtn(s.x, s.y, z.TOP_LEFT)
          ? (i = u.TOP_LEFT_BTN)
          : this._checkPointIsInBtn(s.x, s.y, z.TOP_RIGHT)
          ? (i = u.TOP_RIGHT_BTN)
          : this._checkPointIsInBtn(s.x, s.y, z.BOTTOM_RIGHT)
          ? (i = u.BOTTOM_RIGHT_BTN)
          : this._checkPointIsInBtn(s.x, s.y, z.BOTTOM_LEFT) &&
            (i = u.BOTTOM_LEFT_BTN),
        this.hideParts.includes(i) && (i = ''),
        i
      )
    }
    _checkPointIsInBtn(e, t, i) {
      let s = 0,
        n = 0
      switch (i) {
        case z.TOP_LEFT:
          ;(s = this.x - this.size), (n = this.y - this.size)
          break
        case z.TOP_RIGHT:
          ;(s = this.x + this.width), (n = this.y - this.size)
          break
        case z.BOTTOM_RIGHT:
          ;(s = this.x + this.width), (n = this.y + this.height)
          break
        case z.BOTTOM_LEFT:
          ;(s = this.x - this.size), (n = this.y + this.height)
          break
      }
      return q(e, t, s, n, this.size, this.size)
    }
    startResize(e, t) {
      ;(this.resizeType = e),
        this.opts.lockRatio &&
          (this.elementRatio = this.element.width / this.element.height),
        e === u.BODY
          ? this.element.saveState()
          : e === u.ROTATE
          ? this.element.saveState()
          : e === u.TOP_LEFT_BTN
          ? this.handleDragMousedown(t, z.TOP_LEFT)
          : e === u.TOP_RIGHT_BTN
          ? this.handleDragMousedown(t, z.TOP_RIGHT)
          : e === u.BOTTOM_RIGHT_BTN
          ? this.handleDragMousedown(t, z.BOTTOM_RIGHT)
          : e === u.BOTTOM_LEFT_BTN &&
            this.handleDragMousedown(t, z.BOTTOM_LEFT)
    }
    endResize() {
      ;(this.resizeType = ''),
        (this.diagonalPoint = { x: 0, y: 0 }),
        (this.mousedownPosAndElementPosOffset = { x: 0, y: 0 }),
        (this.elementRatio = 0)
    }
    handleDragMousedown(e, t) {
      let i = O(this.element),
        s = H(this.element, t)
      ;(this.diagonalPoint.x = 2 * i.x - s.x),
        (this.diagonalPoint.y = 2 * i.y - s.y),
        (this.mousedownPosAndElementPosOffset.x = e.clientX - s.x),
        (this.mousedownPosAndElementPosOffset.y = e.clientY - s.y),
        this.element.saveState()
    }
    handleResizeElement(e, t, i, s, n) {
      let h = this.resizeType
      h === u.BODY
        ? this.handleMoveElement(s, n)
        : h === u.ROTATE
        ? this.handleRotateElement(e, t, i)
        : h === u.TOP_LEFT_BTN
        ? this.handleStretchElement(
            e,
            (l, a) => ({ width: (l.x - a.x) * 2, height: (l.y - a.y) * 2 }),
            l => ({ x: l.x, y: l.y }),
            (l, a) => {
              let o = a.x,
                c = a.y
              return (
                l > this.elementRatio
                  ? (o = a.x + a.width - this.elementRatio * a.height)
                  : l < this.elementRatio &&
                    (c = a.y + (a.height - a.width / this.elementRatio)),
                { x: o, y: c }
              )
            }
          )
        : h === u.TOP_RIGHT_BTN
        ? this.handleStretchElement(
            e,
            (l, a) => ({ width: (a.x - l.x) * 2, height: (l.y - a.y) * 2 }),
            (l, a) => ({ x: l.x - a.width, y: l.y }),
            (l, a) => {
              let o = a.x,
                c = a.y
              return (
                l > this.elementRatio
                  ? (o = a.x + this.elementRatio * a.height)
                  : l < this.elementRatio &&
                    ((o = a.x + a.width),
                    (c = a.y + (a.height - a.width / this.elementRatio))),
                { x: o, y: c }
              )
            }
          )
        : h === u.BOTTOM_RIGHT_BTN
        ? this.handleStretchElement(
            e,
            (l, a) => ({ width: (a.x - l.x) * 2, height: (a.y - l.y) * 2 }),
            (l, a) => ({ x: l.x - a.width, y: l.y - a.height }),
            (l, a) => {
              let o = a.x,
                c = a.y
              return (
                l > this.elementRatio
                  ? ((o = a.x + this.elementRatio * a.height),
                    (c = a.y + a.height))
                  : l < this.elementRatio &&
                    ((o = a.x + a.width),
                    (c = a.y + a.width / this.elementRatio)),
                { x: o, y: c }
              )
            }
          )
        : h === u.BOTTOM_LEFT_BTN &&
          this.handleStretchElement(
            e,
            (l, a) => ({ width: (l.x - a.x) * 2, height: (a.y - l.y) * 2 }),
            (l, a) => ({ x: l.x, y: l.y - a.height }),
            (l, a) => {
              let o = a.x,
                c = a.y
              return (
                l > this.elementRatio
                  ? ((o = a.x + a.width - this.elementRatio * a.height),
                    (c = a.y + a.height))
                  : l < this.elementRatio &&
                    (c = a.y + a.width / this.elementRatio),
                { x: o, y: c }
              )
            }
          )
    }
    handleMoveElement(e, t) {
      this.element.move(e, t)
    }
    handleRotateElement(e, t, i) {
      let s = O(this.element),
        n = I(s.x, s.y, e.clientX, e.clientY, t, i)
      this.element.offsetRotate(n)
    }
    stretchCalc(e, t, i, s) {
      let n = {
          x: (e + this.diagonalPoint.x) / 2,
          y: (t + this.diagonalPoint.y) / 2
        },
        h = ie(e, t, n.x, n.y, this.element.rotate),
        l = i(n, h),
        a = !1
      l.width < 0 && ((l.width = 0), (a = !0))
      let o = !1
      l.height < 0 && ((l.height = 0), (o = !0))
      let c = s(h, l),
        d = { x: c.x, y: c.y, width: l.width, height: l.height }
      return (
        (a || o) && ((d.x = this.element.x), (d.y = this.element.y)),
        { newRect: d, newCenter: n }
      )
    }
    handleStretchElement(e, t, i, s) {
      let n = e.clientX - this.mousedownPosAndElementPosOffset.x,
        h = e.clientY - this.mousedownPosAndElementPosOffset.y,
        { newRect: l, newCenter: a } = this.stretchCalc(n, h, t, i)
      if (this.opts.lockRatio) {
        this.fixStretch(l, a, t, i, s)
        return
      }
      this.element.updateRect(l.x, l.y, l.width, l.height)
    }
    fixStretch(e, t, i, s, n) {
      let h = e.width / e.height,
        l = n(h, e),
        a = R(l.x, l.y, t.x, t.y, this.element.rotate),
        o = this.stretchCalc(a.x, a.y, i, s).newRect
      ;(o.width === 0 && o.height === 0) ||
        this.element.updateRect(o.x, o.y, o.width, o.height)
    }
  }
  class de extends B {
    constructor(...e) {
      super(...e), (this.dragElement = new M(this, this.app))
    }
    render() {
      let { width: e, height: t } = this
      this.warpRender(({ halfWidth: i, halfHeight: s }) => {
        Y(this.app.ctx, -i, -s, e, t, !0)
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return we(this, i)
    }
  }
  class _e extends B {
    constructor(...e) {
      super(...e), (this.dragElement = new M(this, this.app, { lockRatio: !0 }))
    }
    render() {
      let { width: e, height: t } = this
      this.warpRender(({ halfWidth: i, halfHeight: s }) => {
        oe(this.app.ctx, 0, 0, ae(e, t), !0)
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return xe(this, i)
    }
  }
  class Be extends B {
    constructor(...e) {
      super(...e), (this.dragElement = new M(this, this.app))
    }
    render() {
      let { width: e, height: t } = this
      this.warpRender(({ halfWidth: i, halfHeight: s }) => {
        Ae(this.app.ctx, -i, -s, e, t, !0)
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return Te(this, i)
    }
    getEndpointList() {
      let { x: e, y: t, width: i, height: s, rotate: n } = this,
        h = [
          [e + i / 2, t],
          [e + i, t + s / 2],
          [e + i / 2, t + s],
          [e, t + s / 2]
        ],
        l = O(this)
      return h.map(a => R(a[0], a[1], l.x, l.y, n))
    }
  }
  class De extends B {
    constructor(...e) {
      super(...e), (this.dragElement = new M(this, this.app))
    }
    render() {
      let { width: e, height: t } = this
      this.warpRender(({ halfWidth: i, halfHeight: s }) => {
        be(this.app.ctx, -i, -s, e, t, !0)
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return Se(this, i)
    }
    getEndpointList() {
      let { x: e, y: t, width: i, height: s, rotate: n } = this,
        h = [
          [e + i / 2, t],
          [e + i, t + s],
          [e, t + s]
        ],
        l = O(this)
      return h.map(a => R(a[0], a[1], l.x, l.y, n))
    }
  }
  class pe extends B {
    constructor(e = {}, t) {
      super(e, t),
        (this.startPointArr = []),
        (this.pointArr = e.pointArr || []),
        (this.startWidth = 0),
        (this.startHeight = 0),
        (this.fictitiousPoint = { x: 0, y: 0 })
    }
    serialize() {
      let e = super.serialize()
      return j(T({}, e), { pointArr: [...this.pointArr] })
    }
    addPoint(e, t, ...i) {
      if (!!Array.isArray(this.pointArr))
        return this.pointArr.push([e, t, ...i]), this
    }
    updateMultiPointBoundingRect() {
      let e = Z(this.pointArr)
      return (
        (this.x = e.x),
        (this.y = e.y),
        (this.width = e.width),
        (this.height = e.height),
        this
      )
    }
    updateFictitiousPoint(e, t) {
      ;(this.fictitiousPoint.x = e), (this.fictitiousPoint.y = t)
    }
    saveState() {
      let { rotate: e, x: t, y: i, width: s, height: n, pointArr: h } = this
      return (
        (this.startRotate = e),
        (this.startX = t),
        (this.startY = i),
        (this.startPointArr = se(h)),
        (this.startWidth = s),
        (this.startHeight = n),
        this
      )
    }
    move(e, t) {
      this.pointArr = this.startPointArr.map(n => [
        n[0] + e,
        n[1] + t,
        ...n.slice(2)
      ])
      let { startX: i, startY: s } = this
      return (this.x = i + e), (this.y = s + t), this
    }
    updateRect(e, t, i, s) {
      let { startWidth: n, startHeight: h, startPointArr: l } = this,
        a = i / n,
        o = s / h
      this.pointArr = l.map(m => {
        let f = m[0] * a,
          y = m[1] * o
        return [f, y, ...m.slice(2)]
      })
      let c = Z(this.pointArr),
        d = c.x - e,
        g = c.y - t
      return (
        (this.pointArr = this.pointArr.map(m => [
          m[0] - d,
          m[1] - g,
          ...m.slice(2)
        ])),
        this.updatePos(e, t),
        this.updateSize(i, s),
        this
      )
    }
    rotateByCenter(e, t, i) {
      ;(this.pointArr = this.startPointArr.map(s => {
        let n = R(s[0], s[1], t, i, e)
        return [n.x, n.y, ...s.slice(2)]
      })),
        this.updateMultiPointBoundingRect()
    }
    getEndpointList() {
      return this.pointArr.map(e => {
        let t = O(this),
          i = R(e[0], e[1], t.x, t.y, this.rotate)
        return { x: i.x, y: i.y }
      })
    }
  }
  class Ye extends pe {
    constructor(...e) {
      super(...e),
        (this.dragElement = new M(this, this.app)),
        (this.lastLineWidth = -1)
    }
    render() {
      let { pointArr: e } = this
      this.warpRender(({ cx: t, cy: i }) => {
        Le(this.app.ctx, e, { app: this.app, cx: t, cy: i })
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return Ce(this, i)
    }
    singleRender(e, t, i, s, n) {
      this.app.ctx.save(),
        ce(this.app.ctx, e, t, i, s, n),
        this.app.ctx.restore()
    }
  }
  class Ge extends pe {
    constructor(...e) {
      super(...e), (this.dragElement = new M(this, this.app))
    }
    render() {
      let { pointArr: e, fictitiousPoint: t } = this
      this.warpRender(({ cx: i, cy: s }) => {
        let n = []
        if (e.length > 0 && this.isCreating) {
          let { x: h, y: l } = this.app.coordinate.transform(t.x - i, t.y - s)
          n = [[h, l]]
        }
        Ie(
          this.app.ctx,
          e
            .map(h => {
              let { x: l, y: a } = this.app.coordinate.transform(h[0], h[1])
              return [l - i, a - s]
            })
            .concat(n)
        )
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return Re(this, i)
    }
  }
  class Xe extends B {
    constructor(e = {}, t) {
      super(e, t),
        (this.dragElement = new M(this, this.app, { lockRatio: !0 })),
        (this.url = e.url || ''),
        (this.imageObj = e.imageObj || null),
        (this.ratio = e.ratio || 1)
    }
    serialize() {
      let e = super.serialize()
      return j(T({}, e), { url: this.url, ratio: this.ratio })
    }
    render() {
      let { width: e, height: t } = this
      this.warpRender(({ halfWidth: i, halfHeight: s }) => {
        ke(this.app.ctx, this, -i, -s, e, t)
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return he(this, i)
    }
  }
  class He extends pe {
    constructor(e = {}, t) {
      super(e, t),
        (this.dragElement = new M(this, this.app)),
        (this.isSingle = e.isSingle)
    }
    render() {
      let { pointArr: e, fictitiousPoint: t } = this
      this.warpRender(({ cx: i, cy: s }) => {
        let n = []
        if (e.length > 0 && this.isCreating) {
          let { x: h, y: l } = this.app.coordinate.transform(t.x - i, t.y - s)
          n = [[h, l]]
        }
        ze(
          this.app.ctx,
          e
            .map(h => {
              let { x: l, y: a } = this.app.coordinate.transform(h[0], h[1])
              return [l - i, a - s]
            })
            .concat(n)
        )
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return ve(this, i)
    }
  }
  class Fe extends B {
    constructor(e = {}, t) {
      var i, s, n, h
      super(e, t),
        (this.dragElement = new M(this, this.app, { lockRatio: !0 })),
        (this.text = e.text || ''),
        (this.style.fillStyle =
          ((i = e.style) == null ? void 0 : i.fillStyle) || '#000'),
        (this.style.fontSize =
          ((s = e.style) == null ? void 0 : s.fontSize) || 18),
        (this.style.lineHeightRatio =
          ((n = e.style) == null ? void 0 : n.lineHeightRatio) || 1.5),
        (this.style.fontFamily =
          ((h = e.style) == null ? void 0 : h.fontFamily) ||
          '\u5FAE\u8F6F\u96C5\u9ED1, Microsoft YaHei')
    }
    serialize() {
      let e = super.serialize()
      return j(T({}, e), { text: this.text })
    }
    render() {
      this.warpRender(({ halfWidth: e, halfHeight: t }) => {
        Me(this.app.ctx, this, -e, -t)
      }),
        this.renderDragElement()
    }
    isHit(e, t) {
      let i = P(e, t, this)
      return he(this, i)
    }
    updateRect(e, t, i, s) {
      let { text: n, style: h } = this,
        l = Math.floor(s / F(n).length / h.lineHeightRatio)
      ;(this.style.fontSize = l), super.updateRect(e, t, i, s)
    }
  }
  class it {
    constructor(e) {
      ;(this.app = e),
        (this.elementList = []),
        (this.activeElement = null),
        (this.isCreatingElement = !1),
        (this.isResizing = !1),
        (this.resizingElement = null),
        (this.handleResize = D(this.handleResize, this, 16))
    }
    serialize(e = !1) {
      let t = this.elementList.map(i => i.serialize())
      return e ? JSON.stringify(t) : t
    }
    getElementsNum() {
      return this.elementList.length
    }
    hasElements() {
      return this.elementList.length > 0
    }
    addElement(e) {
      return this.elementList.push(e), this
    }
    unshiftElement(e) {
      return this.elementList.unshift(e), this
    }
    insertElement(e, t) {
      this.elementList.splice(t, 0, e)
    }
    deleteElement(e) {
      let t = this.getElementIndex(e)
      return (
        t !== -1 &&
          (this.elementList.splice(t, 1),
          e.isActive && this.cancelActiveElement(e)),
        this
      )
    }
    deleteAllElements() {
      return (
        (this.activeElement = null),
        (this.elementList = []),
        (this.isCreatingElement = !1),
        (this.isResizing = !1),
        (this.resizingElement = null),
        this
      )
    }
    getElementIndex(e) {
      return this.elementList.findIndex(t => t === e)
    }
    createElementsFromData(e) {
      return (
        e.forEach(t => {
          let i = this.pureCreateElement(t)
          ;(i.isActive = !1), (i.isCreating = !1), this.addElement(i)
        }),
        this.app.group.initIdToElementList(this.elementList),
        this
      )
    }
    hasActiveElement() {
      return !!this.activeElement
    }
    setActiveElement(e) {
      return (
        this.cancelActiveElement(),
        (this.activeElement = e),
        e && (e.isActive = !0),
        this.app.emit('activeElementChange', this.activeElement),
        this
      )
    }
    cancelActiveElement() {
      return this.hasActiveElement()
        ? ((this.activeElement.isActive = !1),
          (this.activeElement = null),
          this.app.emit('activeElementChange', this.activeElement),
          this)
        : this
    }
    checkIsHitElement(e) {
      let t = e.unGridClientX,
        i = e.unGridClientY
      for (let s = this.elementList.length - 1; s >= 0; s--) {
        let n = this.elementList[s]
        if (n.isHit(t, i)) return n
      }
      return null
    }
    pureCreateElement(e = {}) {
      switch (e.type) {
        case 'rectangle':
          return new de(e, this.app)
        case 'diamond':
          return new Be(e, this.app)
        case 'triangle':
          return new De(e, this.app)
        case 'circle':
          return new _e(e, this.app)
        case 'freedraw':
          return new Ye(e, this.app)
        case 'image':
          return new Xe(e, this.app)
        case 'arrow':
          return new Ge(e, this.app)
        case 'line':
          return new He(e, this.app)
        case 'text':
          return new Fe(e, this.app)
        default:
          return null
      }
    }
    createElement(e = {}, t = () => {}, i = null, s) {
      if (this.hasActiveElement() || this.isCreatingElement) return this
      let n = this.pureCreateElement(e)
      return n
        ? (this.addElement(n),
          s || this.setActiveElement(n),
          (this.isCreatingElement = !0),
          t.call(i, n),
          this)
        : this
    }
    copyElement(e, t = !1, i) {
      return new Promise(s =>
        k(this, null, function* () {
          if (!e) return s()
          let n = this.app.group.handleCopyElementData(e.serialize())
          n.type === 'image' && (n.imageObj = yield $(n.url)),
            this.createElement(
              n,
              h => {
                this.app.group.handleCopyElement(h), h.startResize(u.BODY)
                let l = 20,
                  a = 20
                i &&
                  ((l = i.x - h.x - h.width / 2),
                  (a = i.y - h.y - h.height / 2))
                let o = this.app.coordinate.gridAdsorbent(l, a)
                h.resize(null, null, null, o.x, o.y),
                  (h.isCreating = !1),
                  t && (h.isActive = !1),
                  (this.isCreatingElement = !1),
                  s(h)
              },
              this,
              t
            )
        })
      )
    }
    creatingRectangleLikeElement(e, t, i, s, n) {
      this.createElement({ type: e, x: t, y: i, width: s, height: n }),
        this.activeElement.updateSize(s, n)
    }
    creatingCircle(e, t, i) {
      this.createElement({ type: 'circle', x: e, y: t })
      let s = S(i.clientX, i.clientY, e, t)
      this.activeElement.updateSize(s, s)
    }
    creatingFreedraw(e, t) {
      this.createElement({ type: 'freedraw' })
      let i = this.activeElement,
        s = le(t.mouseSpeed, i.lastLineWidth)
      ;(i.lastLineWidth = s), i.addPoint(e.clientX, e.clientY, s)
      let { coordinate: n, ctx: h, state: l } = this.app,
        a = n.transformToCanvasCoordinate(
          n.subScrollX(t.lastMousePos.x),
          n.subScrollY(t.lastMousePos.y)
        ),
        o = n.transformToCanvasCoordinate(
          n.subScrollX(e.clientX),
          n.subScrollY(e.clientY)
        )
      h.save(),
        h.scale(l.scale, l.scale),
        i.singleRender(a.x, a.y, o.x, o.y, s),
        h.restore()
    }
    creatingImage(e, { width: t, height: i, imageObj: s, url: n, ratio: h }) {
      let l = this.app.coordinate.gridAdsorbent(
        e.unGridClientX - t / 2,
        e.unGridClientY - i / 2
      )
      this.createElement({
        type: 'image',
        x: l.x,
        y: l.y,
        url: n,
        imageObj: s,
        width: t,
        height: i,
        ratio: h
      })
    }
    editingText(e) {
      e.type === 'text' && ((e.noRender = !0), this.setActiveElement(e))
    }
    completeEditingText() {
      let e = this.activeElement
      if (!(!e || e.type !== 'text')) {
        if (!e.text.trim()) {
          this.deleteElement(e), this.setActiveElement(null)
          return
        }
        e.noRender = !1
      }
    }
    completeCreateArrow(e) {
      this.activeElement.addPoint(e.clientX, e.clientY)
    }
    creatingArrow(e, t, i) {
      this.createElement({ type: 'arrow', x: e, y: t }, s => {
        s.addPoint(e, t)
      }),
        this.activeElement.updateFictitiousPoint(i.clientX, i.clientY)
    }
    creatingLine(e, t, i, s = !1, n = !1) {
      n ||
        this.createElement({ type: 'line', x: e, y: t, isSingle: s }, l => {
          l.addPoint(e, t)
        })
      let h = this.activeElement
      h && h.updateFictitiousPoint(i.clientX, i.clientY)
    }
    completeCreateLine(e, t = () => {}) {
      let i = this.activeElement,
        s = e.clientX,
        n = e.clientY
      i && i.isSingle
        ? (i.addPoint(s, n), t())
        : (this.createElement({ type: 'line', isSingle: !1 }),
          (i = this.activeElement),
          i.addPoint(s, n),
          i.updateFictitiousPoint(s, n))
    }
    completeCreateElement() {
      this.isCreatingElement = !1
      let e = this.activeElement
      return e
        ? (['freedraw', 'arrow', 'line'].includes(e.type) &&
            e.updateMultiPointBoundingRect(),
          (e.isCreating = !1),
          this.app.emitChange(),
          this)
        : this
    }
    setActiveElementStyle(e = {}) {
      return this.hasActiveElement()
        ? (Object.keys(e).forEach(t => {
            this.activeElement.style[t] = e[t]
          }),
          this)
        : this
    }
    checkInResizeHand(e, t) {
      let i = this.activeElement,
        s = i.dragElement.checkPointInDragElementWhere(e, t)
      return s ? { element: i, hand: s } : null
    }
    checkIsResize(e, t, i) {
      if (!this.hasActiveElement()) return !1
      let s = this.checkInResizeHand(e, t)
      return s
        ? ((this.isResizing = !0),
          (this.resizingElement = s.element),
          this.resizingElement.startResize(s.hand, i),
          this.app.cursor.setResize(s.hand),
          !0)
        : !1
    }
    handleResize(...e) {
      !this.isResizing || this.resizingElement.resize(...e)
    }
    endResize() {
      ;(this.isResizing = !1),
        this.resizingElement.endResize(),
        (this.resizingElement = null)
    }
  }
  class st extends E {
    constructor(e) {
      super(),
        (this.app = e),
        (this.el = null),
        (this.isReady = !1),
        (this.previewEl = null),
        (this.imageData = null),
        (this.maxWidth = 750),
        (this.maxHeight = 450),
        (this.maxRatio = this.maxWidth / this.maxHeight),
        (this.onImageSelectChange = this.onImageSelectChange.bind(this))
    }
    reset() {
      ;(this.el.value = ''),
        (this.isReady = !1),
        document.body.removeChild(this.previewEl),
        (this.previewEl = null),
        (this.imageData = null)
    }
    selectImage() {
      this.el ||
        ((this.el = document.createElement('input')),
        (this.el.type = 'file'),
        (this.el.accept = 'image/*'),
        (this.el.style.position = 'fixed'),
        (this.el.style.left = '-999999px'),
        this.el.addEventListener('change', this.onImageSelectChange),
        document.body.appendChild(this.el)),
        this.el.click()
    }
    updatePreviewElPos(e, t) {
      let i = 100,
        s = i / this.imageData.ratio
      this.previewEl ||
        ((this.previewEl = document.createElement('div')),
        (this.previewEl.style.position = 'fixed'),
        (this.previewEl.style.width = i + 'px'),
        (this.previewEl.style.height = s + 'px'),
        (this.previewEl.style.backgroundImage = `url('${this.imageData.url}')`),
        (this.previewEl.style.backgroundSize = 'cover'),
        (this.previewEl.style.pointerEvents = 'none'),
        document.body.appendChild(this.previewEl))
      let n = this.app.coordinate.containerToWindow(e, t)
      ;(this.previewEl.style.left = n.x - i / 2 + 'px'),
        (this.previewEl.style.top = n.y - s / 2 + 'px')
    }
    getImageSize(e) {
      return k(this, null, function* () {
        return new Promise((t, i) => {
          let s = new Image()
          s.setAttribute('crossOrigin', 'anonymous'),
            (s.onload = () => {
              let n = s.width,
                h = s.height,
                l = s.width / s.height
              ;(s.width > this.maxWidth || s.height > this.maxHeight) &&
                (l > this.maxRatio
                  ? ((n = this.maxWidth), (h = this.maxWidth / l))
                  : ((h = this.maxHeight), (n = this.maxHeight * l))),
                t({ imageObj: s, size: { width: n, height: h }, ratio: l })
            }),
            (s.onerror = () => {
              i()
            }),
            (s.src = e)
        })
      })
    }
    onImageSelectChange(e) {
      return k(this, null, function* () {
        let t = yield this.getImageUrl(e.target.files[0]),
          { imageObj: i, size: s, ratio: n } = yield this.getImageSize(t)
        ;(this.isReady = !0),
          (this.imageData = j(T({ url: t }, s), { ratio: n, imageObj: i })),
          this.emit('imageSelectChange', this.imageData)
      })
    }
    getImageUrl(e) {
      return k(this, null, function* () {
        return new Promise((t, i) => {
          let s = new FileReader()
          ;(s.onloadend = () => {
            t(s.result)
          }),
            (s.onerror = () => {
              i()
            }),
            s.readAsDataURL(e)
        })
      })
    }
  }
  class nt {
    constructor(e) {
      ;(this.app = e), (this.currentType = 'default')
    }
    set(e = 'default') {
      this.currentType = e
      let t = e
      e === 'eraser' &&
        (t =
          'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==) 10 10, auto'),
        (this.app.container.style.cursor = t)
    }
    hide() {
      this.set('none')
    }
    reset() {
      this.set()
    }
    setCrosshair() {
      this.set('crosshair')
    }
    setMove() {
      this.set('move')
    }
    setResize(e) {
      let t = ''
      switch (e) {
        case u.BODY:
          t = 'move'
          break
        case u.ROTATE:
          t = 'grab'
          break
        case u.TOP_LEFT_BTN:
          t = 'nw-resize'
          break
        case u.TOP_RIGHT_BTN:
          t = 'ne-resize'
          break
        case u.BOTTOM_RIGHT_BTN:
          t = 'se-resize'
          break
        case u.BOTTOM_LEFT_BTN:
          t = 'sw-resize'
          break
      }
      this.set(t)
    }
    setEraser() {
      this.set('eraser')
    }
  }
  class rt extends E {
    constructor(e) {
      super(),
        (this.app = e),
        (this.editable = null),
        (this.isEditing = !1),
        (this.onTextInput = this.onTextInput.bind(this)),
        (this.onTextBlur = this.onTextBlur.bind(this))
    }
    crateTextInputEl() {
      ;(this.editable = document.createElement('textarea')),
        (this.editable.dir = 'auto'),
        (this.editable.tabIndex = 0),
        (this.editable.wrap = 'off'),
        (this.editable.className = 'textInput'),
        Object.assign(this.editable.style, {
          position: 'fixed',
          display: 'block',
          minHeight: '1em',
          backfaceVisibility: 'hidden',
          margin: 0,
          padding: 0,
          border: 0,
          outline: 0,
          resize: 'none',
          background: 'transparent',
          overflow: 'hidden',
          whiteSpace: 'pre'
        }),
        this.editable.addEventListener('input', this.onTextInput),
        this.editable.addEventListener('blur', this.onTextBlur),
        document.body.appendChild(this.editable)
    }
    updateTextInputStyle() {
      let e = this.app.elements.activeElement
      if (!e) return
      let { x: t, y: i, width: s, height: n, style: h, text: l, rotate: a } = e,
        { coordinate: o, state: c } = this.app
      ;(this.editable.value = l), (t = o.subScrollX(t)), (i = o.subScrollY(i))
      let d = o.scale(t, i),
        g = o.containerToWindow(d.x, d.y),
        m = h.fontSize * c.scale,
        f = {
          font: ne(m, h.fontFamily),
          lineHeight: `${m * h.lineHeightRatio}px`,
          left: `${g.x}px`,
          top: `${g.y}px`,
          color: h.fillStyle,
          width: Math.max(s, 100) * c.scale + 'px',
          height: n * c.scale + 'px',
          transform: `rotate(${a}deg)`,
          opacity: h.globalAlpha
        }
      Object.assign(this.editable.style, f)
    }
    onTextInput() {
      let e = this.app.elements.activeElement
      if (!e) return
      e.text = this.editable.value
      let { width: t, height: i } = fe(e)
      ;(e.width = t), (e.height = i), this.updateTextInputStyle()
    }
    onTextBlur() {
      ;(this.editable.style.display = 'none'),
        (this.editable.value = ''),
        this.emit('blur'),
        (this.isEditing = !1)
    }
    showTextEdit() {
      this.editable
        ? (this.editable.style.display = 'block')
        : this.crateTextInputEl(),
        this.updateTextInputStyle(),
        this.editable.focus(),
        this.editable.select(),
        (this.isEditing = !0)
    }
  }
  class lt {
    constructor(e) {
      ;(this.app = e),
        (this.historyStack = []),
        (this.length = 0),
        (this.index = -1)
    }
    add(e) {
      let t = this.length > 0 ? this.historyStack[this.length - 1] : null,
        i = se(e)
      i !== t &&
        (this.historyStack.push(i),
        this.length++,
        (this.index = this.length - 1),
        this.emitChange())
    }
    undo() {
      this.index <= 0 || (this.index--, this.shuttle())
    }
    redo() {
      this.index >= this.length - 1 || (this.index++, this.shuttle())
    }
    shuttle() {
      return k(this, null, function* () {
        let e = this.historyStack[this.index]
        yield this.app.setData(e, !0),
          this.emitChange(),
          this.app.emit('change', e)
      })
    }
    clear() {
      ;(this.index = -1),
        (this.length = 0),
        (this.historyStack = []),
        this.emitChange()
    }
    emitChange() {
      this.app.emit('shuttle', this.index, this.length)
    }
  }
  class ht {
    constructor(e) {
      ;(this.app = e),
        (this.openTest = !1),
        (this.saveState = {
          scale: 0,
          scrollX: 0,
          scrollY: 0,
          width: 0,
          height: 0
        })
    }
    show(e) {
      this.openTest &&
        ((e.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        background-color: #fff;
      `),
        document.body.appendChild(e))
    }
    getElementList(e = !0) {
      if (e) {
        let t = []
        return (
          this.app.elements.activeElement
            ? t.push(this.app.elements.activeElement)
            : this.app.selection.hasSelectionElements() &&
              (t = this.app.selection.getSelectionElements()),
          this.app.elements.elementList.filter(s => t.includes(s))
        )
      } else return this.app.elements.elementList
    }
    exportImage({
      type: e = 'image/png',
      renderBg: t = !0,
      useBlob: i = !1,
      paddingX: s = 10,
      paddingY: n = 10,
      onlySelected: h
    } = {}) {
      let { minx: l, maxx: a, miny: o, maxy: c } = K(this.getElementList(h)),
        d = a - l + s * 2,
        g = c - o + n * 2,
        { canvas: m, ctx: f } = w(d, g, { noStyle: !0, noTranslate: !0 })
      return (
        this.show(m),
        this.saveAppState(),
        this.changeAppState(l - s, o - n, f),
        t &&
          this.app.state.backgroundColor &&
          this.app.background.canvasAddBackgroundColor(
            f,
            d,
            g,
            this.app.state.backgroundColor
          ),
        this.render(f, h),
        this.recoveryAppState(),
        i
          ? new Promise((y, p) => {
              m.toBlob(L => {
                L ? y(L) : p()
              }, e)
            })
          : m.toDataURL(e)
      )
    }
    saveAppState() {
      let { width: e, height: t, state: i, ctx: s } = this.app
      ;(this.saveState.width = e),
        (this.saveState.height = t),
        (this.saveState.scale = i.scale),
        (this.saveState.scrollX = i.scrollX),
        (this.saveState.scrollY = i.scrollY),
        (this.saveState.ctx = s)
    }
    changeAppState(e, t, i) {
      ;(this.app.ctx = i),
        (this.app.state.scale = 1),
        (this.app.state.scrollX = 0),
        (this.app.state.scrollY = 0),
        (this.app.width = e * 2),
        (this.app.height = t * 2)
    }
    recoveryAppState() {
      let {
        width: e,
        height: t,
        scale: i,
        scrollX: s,
        scrollY: n,
        ctx: h
      } = this.saveState
      ;(this.app.state.scale = i),
        (this.app.state.scrollX = s),
        (this.app.state.scrollY = n),
        (this.app.width = e),
        (this.app.height = t),
        (this.app.ctx = h)
    }
    render(e, t) {
      e.save(),
        this.getElementList(t).forEach(i => {
          if (i.noRender) return
          let s = i.isActive,
            n = i.isSelected
          ;(i.isActive = !1),
            (i.isSelected = !1),
            i.render(),
            (i.isActive = s),
            (i.isSelected = n)
        }),
        e.restore()
    }
    exportJson() {
      return this.app.getData()
    }
  }
  class at {
    constructor(e) {
      this.app = e
    }
    set() {
      this.app.state.backgroundColor ? this.addBackgroundColor() : this.remove()
    }
    addBackgroundColor() {
      this.app.container.style.backgroundColor = this.app.state.backgroundColor
    }
    remove() {
      this.app.container.style.backgroundColor = ''
    }
    canvasAddBackgroundColor(e, t, i, s) {
      e.save(), e.rect(0, 0, t, i), (e.fillStyle = s), e.fill(), e.restore()
    }
  }
  class Ne {
    constructor(e, t, i) {
      ;(this.width = e), (this.height = t)
      let { canvas: s, ctx: n } = w(e, t, i)
      ;(this.el = s), (this.ctx = n)
    }
    clearCanvas() {
      let { width: e, height: t } = this
      this.ctx.clearRect(-e / 2, -t / 2, e, t)
    }
  }
  class ot extends B {
    constructor(e = {}, t) {
      super(e, t),
        (this.dragElement = new M(this, this.app)),
        (this.selectedElementList = []),
        (this.wholeCenterPos = { x: 0, y: 0 })
    }
    setSelectedElementList(e) {
      this.selectedElementList.forEach(t => {
        t.isSelected = !1
      }),
        (this.selectedElementList = e),
        this.selectedElementList.forEach(t => {
          t.isSelected = !0
        })
    }
    updateElements(e) {
      let t = []
      this.selectedElementList.forEach(i => {
        e.includes(i) && t.push(i)
      }),
        this.setSelectedElementList(t)
    }
    updateRect() {
      if (this.selectedElementList.length <= 0) {
        super.updateRect(0, 0, 0, 0)
        return
      }
      let { minx: e, maxx: t, miny: i, maxy: s } = K(this.selectedElementList)
      super.updateRect(e, i, t - e, s - i)
    }
    startResize(...e) {
      this.selectedElementList.forEach(t => {
        e[0] === 'rotate' && (this.wholeCenterPos = O(this)),
          t.startResize(...e)
      })
    }
    resize(...e) {
      this.selectedElementList.forEach(t => {
        t.dragElement.resizeType === 'rotate'
          ? this.handleRotate(t, ...e)
          : t.resize(...e)
      })
    }
    handleRotate(e, t, i, s, n, h) {
      let l = I(
        this.wholeCenterPos.x,
        this.wholeCenterPos.y,
        t.clientX,
        t.clientY,
        i,
        s
      )
      e.rotateByCenter(l, this.wholeCenterPos.x, this.wholeCenterPos.y)
    }
    endResize() {
      this.selectedElementList.forEach(e => {
        e.endResize()
      })
    }
    render() {
      if (this.selectedElementList.length > 0) {
        if (this.width <= 0 || this.height <= 0) return
        this.dragElement.render()
      }
    }
  }
  class ct {
    constructor(e) {
      ;(this.app = e),
        (this.canvas = null),
        (this.ctx = null),
        (this.creatingSelection = !1),
        (this.hasSelection = !1),
        (this.isResizing = !1),
        (this.state = this.app.state),
        (this.width = this.app.width),
        (this.height = this.app.height),
        (this.coordinate = new Oe(this)),
        (this.rectangle = new de(
          {
            type: 'rectangle',
            style: {
              strokeStyle: 'rgba(9,132,227,0.3)',
              fillStyle: 'rgba(9,132,227,0.3)'
            }
          },
          this
        )),
        (this.multiSelectElement = new ot(
          { type: 'multiSelectElement' },
          this
        )),
        (this.checkInNodes = D(this.checkInNodes, this, 500)),
        (this.handleResize = D(this.handleResize, this, 16)),
        this.init(),
        this.bindEvent()
    }
    init() {
      this.canvas && this.app.container.removeChild(this.canvas.el),
        (this.width = this.app.width),
        (this.height = this.app.height),
        (this.canvas = new Ne(this.width, this.height, {
          className: 'selection'
        })),
        (this.ctx = this.canvas.ctx),
        this.app.container.appendChild(this.canvas.el)
    }
    bindEvent() {
      this.app.on('change', () => {
        ;(this.state = this.app.state),
          this.multiSelectElement.updateElements(this.app.elements.elementList),
          this.renderSelection()
      }),
        this.app.on('scrollChange', () => {
          this.renderSelection()
        }),
        this.app.on('zoomChange', () => {
          this.renderSelection()
        })
    }
    onMousedown(e, t) {
      e.originEvent.which === 1 &&
        ((this.creatingSelection = !0),
        this.rectangle.updatePos(t.mousedownPos.x, t.mousedownPos.y))
    }
    onMousemove(e, t) {
      ;(Math.abs(t.mouseOffset.x) <= 10 && Math.abs(t.mouseOffset.y) <= 10) ||
        this.onMove(e, t)
    }
    onMouseup() {
      ;(this.creatingSelection = !1),
        this.rectangle.updateRect(0, 0, 0, 0),
        (this.hasSelection = this.hasSelectionElements()),
        this.multiSelectElement.updateRect(),
        this.renderSelection(),
        this.emitChange()
    }
    reset() {
      this.setMultiSelectElements([]),
        (this.hasSelection = !1),
        this.renderSelection(),
        this.emitChange()
    }
    renderSelection() {
      this.canvas.clearCanvas(),
        this.ctx.save(),
        this.ctx.scale(this.app.state.scale, this.app.state.scale),
        this.rectangle.render(),
        this.multiSelectElement.render(),
        this.ctx.restore()
    }
    onMove(e, t) {
      this.rectangle.updateSize(t.mouseOffset.x, t.mouseOffset.y),
        this.renderSelection(),
        this.checkInElements(e, t)
    }
    checkInElements(e, t) {
      let i = Math.min(t.mousedownPos.x, e.clientX),
        s = Math.min(t.mousedownPos.y, e.clientY),
        n = Math.max(t.mousedownPos.x, e.clientX),
        h = Math.max(t.mousedownPos.y, e.clientY),
        l = []
      this.app.elements.elementList.forEach(a => {
        let o = 1 / 0,
          c = -1 / 0,
          d = 1 / 0,
          g = -1 / 0,
          m = a.getEndpointList()
        Z(
          m.map(y => [y.x, y.y]),
          !0
        ).forEach(({ x: y, y: p }) => {
          y < o && (o = y), y > c && (c = y), p < d && (d = p), p > g && (g = p)
        }),
          o >= i && c <= n && d >= s && g <= h && l.push(a)
      }),
        this.setMultiSelectElements(l, !0),
        this.app.render.render()
    }
    checkInResizeHand(e, t) {
      return this.multiSelectElement.dragElement.checkPointInDragElementWhere(
        e,
        t
      )
    }
    checkIsResize(e, t, i) {
      if (!this.hasSelection) return !1
      let s = this.multiSelectElement.dragElement.checkPointInDragElementWhere(
        e,
        t
      )
      return s
        ? ((this.isResizing = !0),
          this.multiSelectElement.startResize(s, i),
          this.app.cursor.setResize(s),
          !0)
        : !1
    }
    handleResize(...e) {
      !this.isResizing ||
        (this.multiSelectElement.resize(...e),
        this.app.render.render(),
        this.multiSelectElement.updateRect(),
        this.renderSelection())
    }
    endResize() {
      ;(this.isResizing = !1), this.multiSelectElement.endResize()
    }
    setSelectedElementStyle(e = {}) {
      !this.hasSelectionElements() ||
        (Object.keys(e).forEach(t => {
          this.getSelectionElements().forEach(i => {
            i.style[t] = e[t]
          })
        }),
        this.app.render.render(),
        this.app.emitChange())
    }
    deleteSelectedElements() {
      this.getSelectionElements().forEach(e => {
        this.app.elements.deleteElement(e)
      }),
        this.selectElements([]),
        this.app.emitChange()
    }
    hasSelectionElements() {
      return this.getSelectionElements().length > 0
    }
    getSelectionElements() {
      return this.multiSelectElement.selectedElementList
    }
    copySelectionElements(e) {
      return k(this, null, function* () {
        let t = this.getSelectionElements().map(s =>
          this.app.elements.copyElement(s, !0)
        )
        this.app.group.clearCopyMap()
        let i = yield Promise.all(t)
        if ((this.setMultiSelectElements(i), e)) {
          this.multiSelectElement.startResize(u.BODY)
          let s =
              e.x -
              this.multiSelectElement.x -
              this.multiSelectElement.width / 2,
            n =
              e.y -
              this.multiSelectElement.y -
              this.multiSelectElement.height / 2,
            h = this.app.coordinate.gridAdsorbent(s, n)
          this.multiSelectElement.resize(null, null, null, h.x, h.y),
            this.multiSelectElement.endResize(),
            this.multiSelectElement.updateRect()
        }
        this.app.render.render(), this.renderSelection(), this.app.emitChange()
      })
    }
    selectElements(e = []) {
      ;(this.hasSelection = e.length > 0),
        this.setMultiSelectElements(e),
        this.app.render.render(),
        this.renderSelection(),
        this.emitChange()
    }
    setMultiSelectElements(e = [], t) {
      this.multiSelectElement.setSelectedElementList(e),
        t || this.multiSelectElement.updateRect()
    }
    emitChange() {
      this.app.emit('multiSelectChange', this.getSelectionElements())
    }
  }
  class dt {
    constructor(e) {
      ;(this.app = e),
        (this.canvas = null),
        (this.ctx = null),
        this.init(),
        this.app.on('zoomChange', this.renderGrid, this),
        this.app.on('scrollChange', this.renderGrid, this)
    }
    init() {
      this.canvas && this.app.container.removeChild(this.canvas.el)
      let { width: e, height: t } = this.app
      ;(this.canvas = new Ne(e, t, { className: 'grid' })),
        (this.ctx = this.canvas.ctx),
        this.app.container.insertBefore(
          this.canvas.el,
          this.app.container.children[0]
        )
    }
    drawHorizontalLine(e) {
      let { coordinate: t, width: i, state: s } = this.app,
        n = t.subScrollY(e)
      this.ctx.beginPath(),
        this.ctx.moveTo(-i / s.scale / 2, n),
        this.ctx.lineTo(i / s.scale / 2, n),
        this.ctx.stroke()
    }
    renderHorizontalLines() {
      let { coordinate: e, height: t, state: i } = this.app,
        { gridConfig: s, scale: n } = i,
        h = 0
      for (let l = -t / 2; l < t / 2; l += s.size)
        this.drawHorizontalLine(l), (h = l)
      for (let l = -t / 2 - s.size; l > -e.subScrollY(t / n / 2); l -= s.size)
        this.drawHorizontalLine(l)
      for (let l = h + s.size; l < e.addScrollY(t / n / 2); l += s.size)
        this.drawHorizontalLine(l)
    }
    drawVerticalLine(e) {
      let { coordinate: t, height: i, state: s } = this.app,
        n = t.subScrollX(e)
      this.ctx.beginPath(),
        this.ctx.moveTo(n, -i / s.scale / 2),
        this.ctx.lineTo(n, i / s.scale / 2),
        this.ctx.stroke()
    }
    renderVerticalLines() {
      let { coordinate: e, width: t, state: i } = this.app,
        { gridConfig: s, scale: n } = i,
        h = 0
      for (let l = -t / 2; l < t / 2; l += s.size)
        this.drawVerticalLine(l), (h = l)
      for (let l = -t / 2 - s.size; l > -e.subScrollX(t / n / 2); l -= s.size)
        this.drawVerticalLine(l)
      for (let l = h + s.size; l < e.addScrollX(t / n / 2); l += s.size)
        this.drawVerticalLine(l)
    }
    renderGrid() {
      this.canvas.clearCanvas()
      let { gridConfig: e, scale: t, showGrid: i } = this.app.state
      !i ||
        (this.ctx.save(),
        this.ctx.scale(t, t),
        (this.ctx.strokeStyle = e.strokeStyle),
        (this.ctx.lineWidth = e.lineWidth),
        this.renderHorizontalLines(),
        this.renderVerticalLines(),
        this.ctx.restore())
    }
    showGrid() {
      this.app.updateState({ showGrid: !0 }), this.renderGrid()
    }
    hideGrid() {
      this.app.updateState({ showGrid: !1 }), this.canvas.clearCanvas()
    }
    updateGrid(e = {}) {
      this.app.updateState({
        gridConfig: T(T({}, this.app.state.gridConfig), e)
      }),
        this.app.state.showGrid && (this.hideGrid(), this.showGrid())
    }
  }
  const ue = {
    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Control: 17,
    Alt: 18,
    CapsLock: 20,
    Esc: 27,
    Space: 32,
    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,
    Insert: 45,
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Del: 46,
    NumLock: 144,
    Cmd: 91,
    CmdFF: 224,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    '`': 192,
    '=': 187,
    '+': 187,
    '-': 189,
    "'": 222,
    '/': 191,
    '.': 190
  }
  for (let r = 0; r <= 9; r++) ue[r] = r + 48
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach((r, e) => {
    ue[r] = e + 65
  })
  const W = ue
  class pt {
    constructor(e) {
      ;(this.app = e),
        (this.startScrollX = 0),
        (this.startScrollY = 0),
        (this.isDragMode = !1),
        (this.onMove = D(this.onMove, this, 16)),
        this.bindEvent()
    }
    bindEvent() {
      this.app.event.on('keydown', e => {
        e.keyCode === W.Space &&
          ((this.isDragMode = !0), this.app.cursor.set('grab'))
      }),
        this.app.event.on('keyup', e => {
          this.isDragMode &&
            ((this.isDragMode = !1), this.app.cursor.set('default'))
        })
    }
    setEditMode() {
      this.app.cursor.set('default'), this.app.updateState({ readonly: !1 })
    }
    setReadonlyMode() {
      this.app.cursor.set('grab'), this.app.updateState({ readonly: !0 })
    }
    onStart() {
      ;(this.startScrollX = this.app.state.scrollX),
        (this.startScrollY = this.app.state.scrollY)
    }
    onMove(e, t) {
      this.app.scrollTo(
        this.startScrollX - t.mouseOffset.originX / this.app.state.scale,
        this.startScrollY - t.mouseOffset.originY / this.app.state.scale
      )
    }
    onEnd() {
      ;(this.startScrollX = 0), (this.startScrollY = 0)
    }
  }
  class ut {
    constructor(e) {
      ;(this.app = e),
        (this.keyMap = W),
        (this.shortcutMap = {}),
        this.bindEvent()
    }
    bindEvent() {
      this.app.event.on('keydown', this.onKeydown, this)
    }
    unBindEvent() {
      this.app.event.off('keydown', this.onKeydown)
    }
    onKeydown(e) {
      Object.keys(this.shortcutMap).forEach(t => {
        this.checkKey(e, t) &&
          (e.stopPropagation(),
          e.preventDefault(),
          this.shortcutMap[t].forEach(i => {
            i.fn.call(i.ctx)
          }))
      })
    }
    checkKey(e, t) {
      let i = this.getOriginEventCodeArr(e),
        s = this.getKeyCodeArr(t)
      if (i.length !== s.length) return !1
      for (let n = 0; n < i.length; n++) {
        let h = s.findIndex(l => l === i[n])
        if (h === -1) return !1
        s.splice(h, 1)
      }
      return !0
    }
    getOriginEventCodeArr(e) {
      let t = []
      return (
        (e.ctrlKey || e.metaKey) && t.push(W.Control),
        e.altKey && t.push(W.Alt),
        e.shiftKey && t.push(W.Shift),
        t.includes(e.keyCode) || t.push(e.keyCode),
        t
      )
    }
    getKeyCodeArr(e) {
      e = e.replace(/\+\+/, '+add')
      let t = e.split(/\s*\+\s*/).map(s => (s === 'add' ? '+' : s)),
        i = []
      return (
        t.forEach(s => {
          i.push(W[s])
        }),
        i
      )
    }
    addShortcut(e, t, i) {
      e.split(/\s*\|\s*/).forEach(s => {
        this.shortcutMap[s]
          ? this.shortcutMap[s].push({ fn: t, ctx: i })
          : (this.shortcutMap[s] = [{ fn: t, ctx: i }])
      })
    }
    removeShortcut(e, t) {
      e.split(/\s*\|\s*/).forEach(i => {
        if (this.shortcutMap[i])
          if (t) {
            let s = this.shortcutMap[i].findIndex(n => n.fn === t)
            s !== -1 && this.shortcutMap[i].splice(s, 1)
          } else (this.shortcutMap[i] = []), delete this.shortcutMap[i]
      })
    }
  }
  class mt {
    constructor(e) {
      ;(this.app = e),
        (this.beingCopyActiveElement = null),
        (this.beingCopySelectedElements = []),
        this.registerShortcutKeys()
    }
    clearCanvas() {
      let { width: e, height: t } = this.app
      return this.app.ctx.clearRect(-e / 2, -t / 2, e, t), this
    }
    render() {
      let { state: e } = this.app
      return (
        this.clearCanvas(),
        this.app.ctx.save(),
        this.app.ctx.scale(e.scale, e.scale),
        this.app.elements.elementList.forEach(t => {
          t.noRender || t.render()
        }),
        this.app.ctx.restore(),
        this
      )
    }
    registerShortcutKeys() {
      this.app.keyCommand.addShortcut('Del|Backspace', () => {
        this.deleteCurrentElements()
      }),
        this.app.keyCommand.addShortcut('Control+c', () => {
          this.copyCurrentElement()
        }),
        this.app.keyCommand.addShortcut('Control+x', () => {
          this.cutCurrentElement()
        }),
        this.app.keyCommand.addShortcut('Control+z', () => {
          this.app.history.undo()
        }),
        this.app.keyCommand.addShortcut('Control+y', () => {
          this.app.history.redo()
        }),
        this.app.keyCommand.addShortcut('Control+v', () => {
          this.pasteCurrentElement(!0)
        }),
        this.app.keyCommand.addShortcut('Control++', () => {
          this.zoomIn()
        }),
        this.app.keyCommand.addShortcut('Control+-', () => {
          this.zoomOut()
        }),
        this.app.keyCommand.addShortcut('Shift+1', () => {
          this.fit()
        }),
        this.app.keyCommand.addShortcut('Control+a', () => {
          this.selectAll()
        }),
        this.app.keyCommand.addShortcut('Control+0', () => {
          this.setZoom(1)
        }),
        this.app.keyCommand.addShortcut("Control+'", () => {
          this.app.state.showGrid
            ? this.app.grid.hideGrid()
            : this.app.grid.showGrid()
        })
    }
    copyCurrentElement() {
      this.app.elements.activeElement
        ? ((this.beingCopySelectedElements = []),
          (this.beingCopyElement = this.app.elements.activeElement))
        : this.app.selection.hasSelectionElements() &&
          ((this.beingCopyElement = null),
          (this.beingCopySelectedElements =
            this.app.selection.getSelectionElements()))
    }
    cutCurrentElement() {
      this.app.elements.activeElement
        ? (this.copyCurrentElement(), this.deleteCurrentElements())
        : this.app.selection.hasSelectionElements() &&
          (this.copyCurrentElement(),
          this.deleteCurrentElements(),
          this.app.selection.setMultiSelectElements(
            this.beingCopySelectedElements
          ),
          this.app.selection.emitChange())
    }
    pasteCurrentElement(e = !1) {
      let t = null
      if (e) {
        let i = this.app.event.lastMousePos.x,
          s = this.app.event.lastMousePos.y
        t = { x: i, y: s }
      }
      this.beingCopyElement
        ? this.copyElement(this.beingCopyElement, !1, t)
        : this.beingCopySelectedElements.length > 0 &&
          (this.app.selection.selectElements(this.beingCopySelectedElements),
          this.app.selection.copySelectionElements(e ? t : null))
    }
    deleteElement(e) {
      this.app.elements.deleteElement(e), this.render(), this.app.emitChange()
    }
    copyElement(e, t = !1, i) {
      return k(this, null, function* () {
        this.app.elements.cancelActiveElement(),
          yield this.app.elements.copyElement(e, t, i),
          this.app.group.clearCopyMap(),
          this.render(),
          this.app.emitChange()
      })
    }
    deleteActiveElement() {
      !this.app.elements.hasActiveElement() ||
        this.deleteElement(this.app.elements.activeElement)
    }
    deleteCurrentElements() {
      this.deleteActiveElement(), this.app.selection.deleteSelectedElements()
    }
    moveUpCurrentElement() {
      this.moveLevelCurrentElement('up')
    }
    moveDownCurrentElement() {
      this.moveLevelCurrentElement('down')
    }
    moveTopCurrentElement() {
      this.moveLevelCurrentElement('top')
    }
    moveBottomCurrentElement() {
      this.moveLevelCurrentElement('bottom')
    }
    moveLevelCurrentElement(e) {
      let t = null
      if (
        (this.app.elements.hasActiveElement()
          ? (t = this.app.elements.activeElement)
          : this.app.selection.getSelectionElements().length === 1 &&
            (t = this.app.selection.getSelectionElements()[0]),
        !t)
      )
        return
      let i = this.app.elements.getElementIndex(t)
      this.app.elements.elementList.splice(i, 1),
        e === 'up'
          ? this.app.elements.insertElement(t, i + 1)
          : e === 'down'
          ? this.app.elements.insertElement(t, i - 1)
          : e === 'top'
          ? this.app.elements.addElement(t)
          : e === 'bottom' && this.app.elements.unshiftElement(t)
    }
    setActiveElementStyle(e = {}) {
      return this.app.elements.hasActiveElement()
        ? (this.app.elements.setActiveElementStyle(e),
          this.render(),
          this.app.elements.isCreatingElement || this.app.emitChange(),
          this)
        : this
    }
    setCurrentElementsStyle(e = {}) {
      this.setActiveElementStyle(e),
        this.app.selection.setSelectedElementStyle(e)
    }
    cancelActiveElement() {
      return this.app.elements.hasActiveElement()
        ? (this.app.elements.cancelActiveElement(), this.render(), this)
        : this
    }
    updateActiveElementPosition(e, t) {
      return this.app.elements.hasActiveElement()
        ? (this.app.elements.activeElement.updatePos(e, t), this.render(), this)
        : this
    }
    updateActiveElementSize(e, t) {
      return this.app.elements.hasActiveElement()
        ? (this.app.elements.activeElement.updateSize(e, t),
          this.render(),
          this)
        : this
    }
    updateActiveElementRotate(e) {
      return this.app.elements.hasActiveElement()
        ? (this.app.elements.activeElement.updateRotate(e), this.render(), this)
        : this
    }
    empty() {
      this.app.elements.deleteAllElements(),
        this.render(),
        this.app.history.clear(),
        this.app.emitChange()
    }
    zoomIn(e = 0.1) {
      this.app.updateState({ scale: this.app.state.scale + e }),
        this.render(),
        this.app.emit('zoomChange', this.app.state.scale)
    }
    zoomOut(e = 0.1) {
      this.app.updateState({
        scale: this.app.state.scale - e > 0 ? this.app.state.scale - e : 0
      }),
        this.render(),
        this.app.emit('zoomChange', this.app.state.scale)
    }
    setZoom(e) {
      e < 0 ||
        e > 1 ||
        (this.app.updateState({ scale: e }),
        this.render(),
        this.app.emit('zoomChange', this.app.state.scale))
    }
    fit() {
      if (!this.app.elements.hasElements()) return
      this.scrollToCenter()
      let {
          minx: e,
          maxx: t,
          miny: i,
          maxy: s
        } = K(this.app.elements.elementList),
        n = t - e,
        h = s - i,
        l = Math.min(this.app.width / n, this.app.height / h)
      this.setZoom(l)
    }
    scrollTo(e, t) {
      this.app.updateState({ scrollX: e, scrollY: t }),
        this.render(),
        this.app.emit(
          'scrollChange',
          this.app.state.scrollX,
          this.app.state.scrollY
        )
    }
    scrollToCenter() {
      if (!this.app.elements.hasElements()) {
        this.scrollTo(0, 0)
        return
      }
      let {
          minx: e,
          maxx: t,
          miny: i,
          maxy: s
        } = K(this.app.elements.elementList),
        n = t - e,
        h = s - i
      this.scrollTo(e - (this.app.width - n) / 2, i - (this.app.height - h) / 2)
    }
    copyPasteCurrentElements() {
      this.copyCurrentElement(), this.pasteCurrentElement()
    }
    setBackgroundColor(e) {
      this.app.updateState({ backgroundColor: e }), this.app.background.set()
    }
    selectAll() {
      this.app.selection.selectElements(this.app.elements.elementList)
    }
  }
  class gt {
    constructor(e) {
      ;(this.app = e),
        (this.elementList = []),
        (this.activeElement = null),
        (this.isCreatingElement = !1),
        (this.isResizing = !1),
        (this.resizingElement = null),
        (this.handleResize = D(this.handleResize, this, 16))
    }
    serialize(e = !1) {
      let t = this.elementList.map(i => i.serialize())
      return e ? JSON.stringify(t) : t
    }
    getElementsNum() {
      return this.elementList.length
    }
    hasElements() {
      return this.elementList.length > 0
    }
    addElement(e) {
      return this.elementList.push(e), this
    }
    unshiftElement(e) {
      return this.elementList.unshift(e), this
    }
    insertElement(e, t) {
      this.elementList.splice(t, 0, e)
    }
    deleteElement(e) {
      let t = this.getElementIndex(e)
      return (
        t !== -1 &&
          (this.elementList.splice(t, 1),
          e.isActive && this.cancelActiveElement(e)),
        this
      )
    }
    deleteAllElements() {
      return (
        (this.activeElement = null),
        (this.elementList = []),
        (this.isCreatingElement = !1),
        (this.isResizing = !1),
        (this.resizingElement = null),
        this
      )
    }
    getElementIndex(e) {
      return this.elementList.findIndex(t => t === e)
    }
    createElementsFromData(e) {
      return (
        e.forEach(t => {
          let i = this.pureCreateElement(t)
          ;(i.isActive = !1), (i.isCreating = !1), this.addElement(i)
        }),
        this.app.group.initIdToElementList(this.elementList),
        this
      )
    }
    hasActiveElement() {
      return !!this.activeElement
    }
    setActiveElement(e) {
      return (
        this.cancelActiveElement(),
        (this.activeElement = e),
        e && (e.isActive = !0),
        this.app.emit('activeElementChange', this.activeElement),
        this
      )
    }
    cancelActiveElement() {
      return this.hasActiveElement()
        ? ((this.activeElement.isActive = !1),
          (this.activeElement = null),
          this.app.emit('activeElementChange', this.activeElement),
          this)
        : this
    }
    checkIsHitElement(e) {
      let t = e.unGridClientX,
        i = e.unGridClientY
      for (let s = this.elementList.length - 1; s >= 0; s--) {
        let n = this.elementList[s]
        if (n.isHit(t, i)) return n
      }
      return null
    }
    pureCreateElement(e = {}) {
      switch (e.type) {
        case 'rectangle':
          return new de(e, this.app)
        case 'diamond':
          return new Be(e, this.app)
        case 'triangle':
          return new De(e, this.app)
        case 'circle':
          return new _e(e, this.app)
        case 'freedraw':
          return new Ye(e, this.app)
        case 'image':
          return new Xe(e, this.app)
        case 'arrow':
          return new Ge(e, this.app)
        case 'line':
          return new He(e, this.app)
        case 'text':
          return new Fe(e, this.app)
        default:
          return null
      }
    }
    createElement(e = {}, t = () => {}, i = null, s) {
      if (this.hasActiveElement() || this.isCreatingElement) return this
      let n = this.pureCreateElement(e)
      return n
        ? (this.addElement(n),
          s || this.setActiveElement(n),
          (this.isCreatingElement = !0),
          t.call(i, n),
          this)
        : this
    }
    copyElement(e, t = !1, i) {
      return new Promise(s =>
        k(this, null, function* () {
          if (!e) return s()
          let n = this.app.group.handleCopyElementData(e.serialize())
          n.type === 'image' && (n.imageObj = yield $(n.url)),
            this.createElement(
              n,
              h => {
                this.app.group.handleCopyElement(h), h.startResize(u.BODY)
                let l = 20,
                  a = 20
                i &&
                  ((l = i.x - h.x - h.width / 2),
                  (a = i.y - h.y - h.height / 2))
                let o = this.app.coordinate.gridAdsorbent(l, a)
                h.resize(null, null, null, o.x, o.y),
                  (h.isCreating = !1),
                  t && (h.isActive = !1),
                  (this.isCreatingElement = !1),
                  s(h)
              },
              this,
              t
            )
        })
      )
    }
    creatingRectangleLikeElement(e, t, i, s, n) {
      this.createElement({ type: e, x: t, y: i, width: s, height: n }),
        this.activeElement.updateSize(s, n)
    }
    creatingCircle(e, t, i) {
      this.createElement({ type: 'circle', x: e, y: t })
      let s = S(i.clientX, i.clientY, e, t)
      this.activeElement.updateSize(s, s)
    }
    creatingFreedraw(e, t) {
      this.createElement({ type: 'freedraw' })
      let i = this.activeElement,
        s = le(t.mouseSpeed, i.lastLineWidth)
      ;(i.lastLineWidth = s), i.addPoint(e.clientX, e.clientY, s)
      let { coordinate: n, ctx: h, state: l } = this.app,
        a = n.transformToCanvasCoordinate(
          n.subScrollX(t.lastMousePos.x),
          n.subScrollY(t.lastMousePos.y)
        ),
        o = n.transformToCanvasCoordinate(
          n.subScrollX(e.clientX),
          n.subScrollY(e.clientY)
        )
      h.save(),
        h.scale(l.scale, l.scale),
        i.singleRender(a.x, a.y, o.x, o.y, s),
        h.restore()
    }
    creatingImage(e, { width: t, height: i, imageObj: s, url: n, ratio: h }) {
      let l = this.app.coordinate.gridAdsorbent(
        e.unGridClientX - t / 2,
        e.unGridClientY - i / 2
      )
      this.createElement({
        type: 'image',
        x: l.x,
        y: l.y,
        url: n,
        imageObj: s,
        width: t,
        height: i,
        ratio: h
      })
    }
    editingText(e) {
      e.type === 'text' && ((e.noRender = !0), this.setActiveElement(e))
    }
    completeEditingText() {
      let e = this.activeElement
      if (!(!e || e.type !== 'text')) {
        if (!e.text.trim()) {
          this.deleteElement(e), this.setActiveElement(null)
          return
        }
        e.noRender = !1
      }
    }
    completeCreateArrow(e) {
      this.activeElement.addPoint(e.clientX, e.clientY)
    }
    creatingArrow(e, t, i) {
      this.createElement({ type: 'arrow', x: e, y: t }, s => {
        s.addPoint(e, t)
      }),
        this.activeElement.updateFictitiousPoint(i.clientX, i.clientY)
    }
    creatingLine(e, t, i, s = !1, n = !1) {
      n ||
        this.createElement({ type: 'line', x: e, y: t, isSingle: s }, l => {
          l.addPoint(e, t)
        })
      let h = this.activeElement
      h && h.updateFictitiousPoint(i.clientX, i.clientY)
    }
    completeCreateLine(e, t = () => {}) {
      let i = this.activeElement,
        s = e.clientX,
        n = e.clientY
      i && i.isSingle
        ? (i.addPoint(s, n), t())
        : (this.createElement({ type: 'line', isSingle: !1 }),
          (i = this.activeElement),
          i.addPoint(s, n),
          i.updateFictitiousPoint(s, n))
    }
    completeCreateElement() {
      this.isCreatingElement = !1
      let e = this.activeElement
      return e
        ? (['freedraw', 'arrow', 'line'].includes(e.type) &&
            e.updateMultiPointBoundingRect(),
          (e.isCreating = !1),
          this.app.emitChange(),
          this)
        : this
    }
    setActiveElementStyle(e = {}) {
      return this.hasActiveElement()
        ? (Object.keys(e).forEach(t => {
            this.activeElement.style[t] = e[t]
          }),
          this)
        : this
    }
    checkInResizeHand(e, t) {
      let i = this.activeElement,
        s = i.dragElement.checkPointInDragElementWhere(e, t)
      return s ? { element: i, hand: s } : null
    }
    checkIsResize(e, t, i) {
      if (!this.hasActiveElement()) return !1
      let s = this.checkInResizeHand(e, t)
      return s
        ? ((this.isResizing = !0),
          (this.resizingElement = s.element),
          this.resizingElement.startResize(s.hand, i),
          this.app.cursor.setResize(s.hand),
          !0)
        : !1
    }
    handleResize(...e) {
      !this.isResizing || this.resizingElement.resize(...e)
    }
    endResize() {
      ;(this.isResizing = !1),
        this.resizingElement.endResize(),
        (this.resizingElement = null)
    }
  }
  let te
  const ft = new Uint8Array(16)
  function Et() {
    if (
      !te &&
      ((te =
        typeof crypto != 'undefined' &&
        crypto.getRandomValues &&
        crypto.getRandomValues.bind(crypto)),
      !te)
    )
      throw new Error(
        'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
      )
    return te(ft)
  }
  const C = []
  for (let r = 0; r < 256; ++r) C.push((r + 256).toString(16).slice(1))
  function yt(r, e = 0) {
    return (
      C[r[e + 0]] +
      C[r[e + 1]] +
      C[r[e + 2]] +
      C[r[e + 3]] +
      '-' +
      C[r[e + 4]] +
      C[r[e + 5]] +
      '-' +
      C[r[e + 6]] +
      C[r[e + 7]] +
      '-' +
      C[r[e + 8]] +
      C[r[e + 9]] +
      '-' +
      C[r[e + 10]] +
      C[r[e + 11]] +
      C[r[e + 12]] +
      C[r[e + 13]] +
      C[r[e + 14]] +
      C[r[e + 15]]
    ).toLowerCase()
  }
  var We = {
    randomUUID:
      typeof crypto != 'undefined' &&
      crypto.randomUUID &&
      crypto.randomUUID.bind(crypto)
  }
  function je(r, e, t) {
    if (We.randomUUID && !e && !r) return We.randomUUID()
    r = r || {}
    const i = r.random || (r.rng || Et)()
    if (((i[6] = (i[6] & 15) | 64), (i[8] = (i[8] & 63) | 128), e)) {
      t = t || 0
      for (let s = 0; s < 16; ++s) e[t + s] = i[s]
      return e
    }
    return yt(i)
  }
  class wt {
    constructor(e) {
      ;(this.app = e),
        (this.groupIdToElementList = {}),
        (this.newGroupIdMap = {})
    }
    setToMap(e) {
      let t = e.getGroupId()
      t &&
        (this.groupIdToElementList[t] || (this.groupIdToElementList[t] = []),
        this.groupIdToElementList[t].push(e))
    }
    initIdToElementList(e) {
      ;(this.groupIdToElementList = {}),
        e.forEach(t => {
          this.setToMap(t)
        })
    }
    handleCopyElementData(e) {
      return (
        e.groupId &&
          (this.newGroupIdMap[e.groupId]
            ? (e.groupId = this.newGroupIdMap[e.groupId])
            : (e.groupId = this.newGroupIdMap[e.groupId] = je())),
        e
      )
    }
    clearCopyMap() {
      this.newGroupIdMap = {}
    }
    handleCopyElement(e) {
      this.setToMap(e)
    }
    dogroup() {
      if (
        !this.app.selection.hasSelection ||
        this.app.selection.multiSelectElement.selectedElementList.length <= 1
      )
        return
      let e = this.app.selection.multiSelectElement.selectedElementList,
        t = je()
      ;(this.groupIdToElementList[t] = e),
        e.forEach(i => {
          i.setGroupId(t)
        }),
        this.app.render.render(),
        this.app.emitChange()
    }
    ungroup() {
      if (
        !this.app.selection.hasSelection ||
        this.app.selection.multiSelectElement.selectedElementList.length <= 1
      )
        return
      let e = this.app.selection.multiSelectElement.selectedElementList,
        t = e[0].getGroupId()
      ;(this.groupIdToElementList[t] = []),
        delete this.groupIdToElementList[t],
        e.forEach(i => {
          i.removeGroupId(t)
        }),
        this.app.render.render(),
        this.app.emitChange()
    }
    setSelection(e) {
      let t = e.getGroupId()
      this.groupIdToElementList[t] &&
        this.app.selection.selectElements(this.groupIdToElementList[t])
    }
  }
  class V extends E {
    constructor(e = {}) {
      if (
        (super(),
        (this.opts = e),
        (this.container = e.container),
        (this.drawType = e.drawType || 'selection'),
        !this.container)
      )
        throw new Error('\u7F3A\u5C11 container \u53C2\u6570\uFF01')
      if (
        !['absolute', 'fixed', 'relative'].includes(
          window.getComputedStyle(this.container).position
        )
      )
        throw new Error(
          'container\u5143\u7D20\u9700\u8981\u8BBE\u7F6E\u5B9A\u4F4D\uFF01'
        )
      ;(this.width = 0),
        (this.height = 0),
        (this.left = 0),
        (this.top = 0),
        (this.canvas = null),
        (this.ctx = null),
        (this.state = T(
          {
            scale: 1,
            scrollX: 0,
            scrollY: 0,
            scrollStep: 50,
            backgroundColor: '',
            showGrid: !1,
            readonly: !1,
            gridConfig: { size: 20, strokeStyle: '#dfe0e1', lineWidth: 1 }
          },
          e.state || {}
        )),
        this.initCanvas(),
        (this.coordinate = new Oe(this)),
        (this.event = new tt(this)),
        this.event.on('mousedown', this.onMousedown, this),
        this.event.on('mousemove', this.onMousemove, this),
        this.event.on('mouseup', this.onMouseup, this),
        this.event.on('dblclick', this.onDblclick, this),
        this.event.on('mousewheel', this.onMousewheel, this),
        this.event.on('contextmenu', this.onContextmenu, this),
        (this.keyCommand = new ut(this)),
        (this.imageEdit = new st(this)),
        this.imageEdit.on('imageSelectChange', this.onImageSelectChange, this),
        (this.textEdit = new rt(this)),
        this.textEdit.on('blur', this.onTextInputBlur, this),
        (this.cursor = new nt(this)),
        (this.history = new lt(this)),
        (this.export = new ht(this)),
        (this.background = new at(this)),
        (this.selection = new ct(this)),
        (this.group = new wt(this)),
        (this.grid = new dt(this)),
        (this.mode = new pt(this)),
        (this.elements = new it(this)),
        (this.render = new mt(this)),
        this.proxy(),
        (this.checkIsOnElement = D(this.checkIsOnElement, this)),
        this.emitChange(),
        this.helpUpdate()
    }
    proxy() {
      ;['undo', 'redo'].forEach(e => {
        this[e] = this.history[e].bind(this.history)
      }),
        [].forEach(e => {
          this[e] = this.elements[e].bind(this.elements)
        }),
        [
          'deleteElement',
          'setActiveElementStyle',
          'setCurrentElementsStyle',
          'cancelActiveElement',
          'deleteActiveElement',
          'deleteCurrentElements',
          'empty',
          'zoomIn',
          'zoomOut',
          'setZoom',
          'scrollTo',
          'scrollToCenter',
          'copyPasteCurrentElements',
          'setBackgroundColor',
          'copyElement',
          'copyCurrentElement',
          'cutCurrentElement',
          'pasteCurrentElement',
          'updateActiveElementRotate',
          'updateActiveElementSize',
          'updateActiveElementPosition',
          'moveBottomCurrentElement',
          'moveTopCurrentElement',
          'moveUpCurrentElement',
          'moveDownCurrentElement',
          'selectAll',
          'fit'
        ].forEach(e => {
          this[e] = this.render[e].bind(this.render)
        }),
        ['exportImage', 'exportJson'].forEach(e => {
          this[e] = this.export[e].bind(this.export)
        }),
        ['setSelectedElementStyle'].forEach(e => {
          this[e] = this.selection[e].bind(this.selection)
        }),
        ['dogroup', 'ungroup'].forEach(e => {
          this[e] = this.group[e].bind(this.group)
        }),
        ['showGrid', 'hideGrid', 'updateGrid'].forEach(e => {
          this[e] = this.grid[e].bind(this.grid)
        }),
        ['setEditMode', 'setReadonlyMode'].forEach(e => {
          this[e] = this.mode[e].bind(this.mode)
        })
    }
    getContainerRectInfo() {
      let {
        width: e,
        height: t,
        left: i,
        top: s
      } = this.container.getBoundingClientRect()
      ;(this.width = e), (this.height = t), (this.left = i), (this.top = s)
    }
    helpUpdate() {
      this.background.set(),
        this.state.showGrid && this.grid.showGrid(),
        this.state.readonly && this.setReadonlyMode()
    }
    setData(s, n) {
      return k(
        this,
        arguments,
        function* ({ state: e = {}, elements: t = [] }, i) {
          this.state = e
          for (let h = 0; h < t.length; h++)
            t[h].type === 'image' && (t[h].imageObj = yield $(t[h].url))
          this.helpUpdate(),
            this.elements.deleteAllElements().createElementsFromData(t),
            this.render.render(),
            i || this.emitChange()
        }
      )
    }
    initCanvas() {
      this.getContainerRectInfo(),
        this.canvas && this.container.removeChild(this.canvas)
      let { canvas: e, ctx: t } = w(this.width, this.height, {
        className: 'main'
      })
      ;(this.canvas = e),
        (this.ctx = t),
        this.container.appendChild(this.canvas)
    }
    resize() {
      this.initCanvas(),
        this.render.render(),
        this.selection.init(),
        this.grid.init(),
        this.grid.renderGrid()
    }
    updateState(e = {}) {
      ;(this.state = T(T({}, this.state), e)), this.emitChange()
    }
    updateCurrentType(e) {
      ;(this.drawType = e),
        this.drawType === 'image' && this.imageEdit.selectImage(),
        this.drawType === 'eraser'
          ? (this.cursor.setEraser(), this.cancelActiveElement())
          : this.drawType !== 'selection'
          ? this.cursor.setCrosshair()
          : this.cursor.reset(),
        this.emit('currentTypeChange', this.drawType)
    }
    getData() {
      return { state: T({}, this.state), elements: this.elements.serialize() }
    }
    onImageSelectChange() {
      this.cursor.hide()
    }
    onMousedown(e, t) {
      if (this.state.readonly || this.mode.isDragMode) {
        this.mode.onStart()
        return
      }
      if (!this.elements.isCreatingElement && !this.textEdit.isEditing) {
        let i = this.elements.checkIsHitElement(e)
        this.drawType === 'selection'
          ? this.elements.hasActiveElement()
            ? this.elements.checkIsResize(
                t.mousedownPos.unGridClientX,
                t.mousedownPos.unGridClientY,
                e
              ) || (this.elements.setActiveElement(i), this.render.render())
            : this.selection.hasSelection
            ? this.selection.checkIsResize(
                t.mousedownPos.unGridClientX,
                t.mousedownPos.unGridClientY,
                e
              ) ||
              (this.selection.reset(),
              this.elements.setActiveElement(i),
              this.render.render())
            : i
            ? i.hasGroup()
              ? (this.group.setSelection(i), this.onMousedown(e, t))
              : (this.elements.setActiveElement(i),
                this.render.render(),
                this.onMousedown(e, t))
            : this.selection.onMousedown(e, t)
          : this.drawType === 'eraser' && this.deleteElement(i)
      }
    }
    onMousemove(e, t) {
      if (this.state.readonly || this.mode.isDragMode) {
        t.isMousedown && this.mode.onMove(e, t)
        return
      }
      if (t.isMousedown) {
        let i = t.mousedownPos.x,
          s = t.mousedownPos.y,
          n = Math.max(t.mouseOffset.x, 0),
          h = Math.max(t.mouseOffset.y, 0)
        this.drawType === 'selection'
          ? this.selection.isResizing
            ? this.selection.handleResize(
                e,
                i,
                s,
                t.mouseOffset.x,
                t.mouseOffset.y
              )
            : this.selection.creatingSelection
            ? this.selection.onMousemove(e, t)
            : (this.elements.handleResize(
                e,
                i,
                s,
                t.mouseOffset.x,
                t.mouseOffset.y
              ),
              this.render.render())
          : ['rectangle', 'diamond', 'triangle'].includes(this.drawType)
          ? (this.elements.creatingRectangleLikeElement(
              this.drawType,
              i,
              s,
              n,
              h
            ),
            this.render.render())
          : this.drawType === 'circle'
          ? (this.elements.creatingCircle(i, s, e), this.render.render())
          : this.drawType === 'freedraw'
          ? this.elements.creatingFreedraw(e, t)
          : this.drawType === 'arrow'
          ? (this.elements.creatingArrow(i, s, e), this.render.render())
          : this.drawType === 'line' &&
            S(i, s, e.clientX, e.clientY) > 3 &&
            (this.elements.creatingLine(i, s, e, !0), this.render.render())
      } else if (this.imageEdit.isReady)
        this.cursor.hide(),
          this.imageEdit.updatePreviewElPos(
            e.originEvent.clientX,
            e.originEvent.clientY
          )
      else if (this.drawType === 'selection')
        if (this.elements.hasActiveElement()) {
          let i = ''
          ;(i = this.elements.checkInResizeHand(
            e.unGridClientX,
            e.unGridClientY
          ))
            ? this.cursor.setResize(i.hand)
            : this.checkIsOnElement(e)
        } else if (this.selection.hasSelection) {
          let i = this.selection.checkInResizeHand(
            e.unGridClientX,
            e.unGridClientY
          )
          i ? this.cursor.setResize(i) : this.checkIsOnElement(e)
        } else this.checkIsOnElement(e)
      else
        this.drawType === 'line' &&
          (this.elements.creatingLine(null, null, e, !1, !0),
          this.render.render())
    }
    checkIsOnElement(e) {
      this.elements.checkIsHitElement(e)
        ? this.cursor.setMove()
        : this.cursor.reset()
    }
    resetCurrentType() {
      this.drawType !== 'selection' &&
        ((this.drawType = 'selection'),
        this.emit('currentTypeChange', 'selection'))
    }
    completeCreateNewElement() {
      this.resetCurrentType(),
        this.elements.completeCreateElement(),
        this.render.render()
    }
    onMouseup(e) {
      this.state.readonly ||
        this.mode.isDragMode ||
        (this.drawType === 'text'
          ? this.textEdit.isEditing ||
            (this.createTextElement(e), this.resetCurrentType())
          : this.imageEdit.isReady
          ? (this.elements.creatingImage(e, this.imageEdit.imageData),
            this.completeCreateNewElement(),
            this.cursor.reset(),
            this.imageEdit.reset())
          : this.drawType === 'arrow'
          ? (this.elements.completeCreateArrow(e),
            this.completeCreateNewElement())
          : this.drawType === 'line'
          ? (this.elements.completeCreateLine(e, () => {
              this.completeCreateNewElement()
            }),
            this.render.render())
          : this.elements.isCreatingElement
          ? this.drawType === 'freedraw'
            ? (this.elements.completeCreateElement(),
              this.elements.setActiveElement())
            : this.completeCreateNewElement()
          : this.elements.isResizing
          ? (this.elements.endResize(), this.emitChange())
          : this.selection.creatingSelection
          ? this.selection.onMouseup(e)
          : this.selection.isResizing &&
            (this.selection.endResize(), this.emitChange()))
    }
    onDblclick(e) {
      if (this.drawType === 'line') this.completeCreateNewElement()
      else {
        let t = this.elements.checkIsHitElement(e)
        t
          ? t.type === 'text' &&
            (this.elements.editingText(t),
            this.render.render(),
            this.keyCommand.unBindEvent(),
            this.textEdit.showTextEdit())
          : this.textEdit.isEditing || this.createTextElement(e)
      }
    }
    onTextInputBlur() {
      this.keyCommand.bindEvent(),
        this.elements.completeEditingText(),
        this.render.render(),
        this.emitChange()
    }
    createTextElement(e) {
      this.elements.createElement({ type: 'text', x: e.clientX, y: e.clientY }),
        this.keyCommand.unBindEvent(),
        this.textEdit.showTextEdit()
    }
    onMousewheel(e) {
      let t = this.state.scrollStep / this.state.scale,
        i = e === 'down' ? t : -t
      this.scrollTo(this.state.scrollX, this.state.scrollY + i)
    }
    onContextmenu(e) {
      let t = []
      this.elements.hasActiveElement()
        ? (t = [this.elements.activeElement])
        : this.selection.hasSelectionElements() &&
          (t = this.selection.getSelectionElements()),
        this.emit('contextmenu', e.originEvent, t)
    }
    emitChange() {
      let e = this.getData()
      this.history.add(e), this.emit('change', e)
    }
  }
  return (V.utils = Ze), (V.checkHit = $e), (V.draw = et), (V.elements = gt), V
})

/*jslint maxlen:80, es6:false, white:true */

/*jshint bitwise:true, camelcase:true, curly:true, eqeqeq:true, forin:true,
  freeze:true, futurehostile:true, latedef:true, newcap:true, nocomma:true,
  nonbsp:true, singleGroups:true, strict:true, undef:true, unused:true,
  es3:true, esnext:false, plusplus:true, maxparams:2, maxdepth:2,
  maxstatements:14, maxcomplexity:4 */

/*global JSON:true, expect, module, require, describe, it, returnExports */

(function () {
  'use strict';

  var isFunction;
  if (typeof module === 'object' && module.exports) {
    require('es5-shim');
    require('es5-shim/es5-sham');
    if (typeof JSON === 'undefined') {
      JSON = {};
    }
    require('json3').runInContext(null, JSON);
    require('es6-shim');
    isFunction = require('../../index.js');
  } else {
    isFunction = returnExports;
  }

  describe('Basic tests', function () {
    it('should return `false` for everything', function () {
      var values = [true, 'abc', 1, null, undefined, new Date(), [], /r/],
          expected = values.map(function () {
            return false;
          }),
          actual = values.map(isFunction);
      expect(actual).toEqual(expected);
    });

    it('should return `true` for everything', function () {
      var values = [
            Object,
            String,
            Boolean,
            Array,
            Function,
            /* jscs:disable */
            function () {},
            /*jshint unused:false */
            function test(a) {},
            /*jshint evil:true */
            new Function(),
            /*jshint evil:false */
            function test1(a, b){},
            function test2 (a/*, foo*/){},
            function test3( a/*, foo*/, b ) { },
            function test4 ( a/*, foo*/, b  ) { },
            function/*foo*/test5( a/*, foo*/, b ){},
            function/*foo*/test6/*bar*/(a/*, foo*/, b ){},
            function/*foo*/test7/*bar*/(/*baz*/){},
            /*fum*/function/*foo*/ // blah
            test8/*bar*/ // wizz
            (/*baz*/a
             ){}
            /* jscs:enable */
          ],
          expected = values.map(function () {
            return true;
          }),
          actual = values.map(isFunction);
      expect(actual).toEqual(expected);

      var fat;
      try {
        /*jshint evil:true */
        fat = new Function('return (x, y) => {return this;};')();
        expect(isFunction(fat)).toBe(true);
      } catch (ignore) {}

      var gen;
      try {
        /*jshint evil:true */
        gen = new Function('return function* idMaker(x, y){};')();
        expect(isFunction(gen)).toBe(true);
      } catch (ignore) {}

      var classes;
      try {
        /*jshint evil:true */
        classes = new Function('"use strict"; return class My {};')();
        expect(isFunction(classes)).toBe(true);
      } catch (ignore) {}
    });
  });
}());

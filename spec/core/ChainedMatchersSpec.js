describe("Chained matchers", function() {
  var env, suite;

  beforeEach(function() {
    env = new jasmine.Env();
    env.updateInterval = 0;
    suite = env.describe("suite", function() {});
    env.currentSuite = suite;
  });

  describe("calling #addMatchers with a matchers object whose keys contain multiple matcher names", function() {
    beforeEach(function() {
      env.beforeEach(function() {
        this.addMatchers({
          'toHaveA': function(key) {
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          },

          'toHaveA ofExactly': function(value) {
            return this.valueToCompare === value;
          },

          'toHaveA between': function(lowerBound) {
            return this.valueToCompare >= lowerBound;
          },

          'toHaveA between and': function(upperBound) {
            return this.valueToCompare <= upperBound;
          }
        });
      });
    });

    itCreatesMatcherMethodsCorrectly();
  });

  describe("calling #addMatchers with a matcher name string and a matchers object", function() {
    beforeEach(function() {
      env.beforeEach(function() {
        this.addMatchers({
          toHaveA: function(key) {
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          },
        });

        this.addMatchers('toHaveA', {
          ofExactly: function(value) {
            return this.valueToCompare === value;
          },

          between: function(lowerBound) {
            return this.valueToCompare >= lowerBound;
          }
        });

        this.addMatchers('toHaveA between', {
          and: function(upperBound) {
            return this.valueToCompare <= upperBound;
          }
        })
      });
    });

    itCreatesMatcherMethodsCorrectly();
  });

  describe("calling #addMatchers with an array of matcher name strings and a matchers object", function() {
    beforeEach(function() {
      env.beforeEach(function() {
        this.addMatchers({
          toHaveA: function(key) {
            this.valueToCompare = this.actual[key];
            return !!this.valueToCompare;
          },

          'toHaveA withA': function(key) {
            this.valueToCompare = this.valueToCompare[key];
            return !!this.valueToCompare;
          }
        });

        this.addMatchers(["toHaveA", "toHaveA withA"], {
          ofExactly: function(value) {
            return this.valueToCompare === value;
          },

          between: function(lowerBound) {
            return this.valueToCompare >= lowerBound;
          },

          'between and': function(upperBound) {
            return this.valueToCompare <= upperBound;
          }
        });
      });
    });

    itCreatesMatcherMethodsCorrectly();

    it("adds the given matchers to ALL of the named matcher classes", function() {
      var passingResults = resultsOfSpec(function() {
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("square");
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("width");
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").ofExactly(12);
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").ofExactly(24);
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").between(10).and(20);
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").between(1).and(10);
      });

      expect(passingResults.length).toBe(8);
      expect(passingResults[0].passed()).toBeTruthy();
      expect(passingResults[1].passed()).toBeTruthy();
      expect(passingResults[2].passed()).toBeTruthy();
      expect(passingResults[3].passed()).toBeTruthy();
      expect(passingResults[4].passed()).toBeTruthy();
      expect(passingResults[5].passed()).toBeTruthy();
      expect(passingResults[6].passed()).toBeTruthy();
      expect(passingResults[7].passed()).toBeTruthy();

      var failingResults = resultsOfSpec(function() {
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle");
        this.expect({ triangle: { height: 12 } }).toHaveA("square");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height");
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("width");
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").ofExactly(12);
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").ofExactly(24);
        this.expect({ triangle: { height: 12 } }).not.toHaveA("triangle").withA("height").between(10).and(20);
        this.expect({ triangle: { height: 12 } }).toHaveA("triangle").withA("height").between(1).and(10);
      });

      expect(failingResults.length).toBe(8);
      expect(failingResults[0].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle'.");
      expect(failingResults[1].message).toBe("Expected { triangle : { height : 12 } } to have a 'square'.");
      expect(failingResults[2].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle' with a 'height'.");
      expect(failingResults[3].message).toBe("Expected { triangle : { height : 12 } } to have a 'triangle' with a 'width'.");
      expect(failingResults[4].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle' with a 'height' of exactly 12.");
      expect(failingResults[5].message).toBe("Expected { triangle : { height : 12 } } to have a 'triangle' with a 'height' of exactly 24.");
      expect(failingResults[6].message).toBe("Expected { triangle : { height : 12 } } not to have a 'triangle' with a 'height' between 10 and 20.");
      expect(failingResults[7].message).toBe("Expected { triangle : { height : 12 } } to have a 'triangle' with a 'height' between 1 and 10.");
    });
  });

  function itCreatesMatcherMethodsCorrectly() {
    describe("the return value of a matcher function", function() {
      describe("when no further chained matchers have been added", function() {
        var unchainableMatcherValue1, unchainableMatcherValue2, unchainableMatcherValue3;

        beforeEach(function() {
          env.it("spec", function() {
            unchainableMatcherValue1 = this.expect({ height: 12 }).toBeTruthy();
            unchainableMatcherValue2 = this.expect({ height: 12 }).toHaveA('height').ofExactly(10);
            unchainableMatcherValue3 = this.expect({ height: 12 }).toHaveA('height').between(10).and(20);
          });

          suite.execute();
        });

        it("is undefined", function() {
          expect(unchainableMatcherValue1).toBeUndefined();
          expect(unchainableMatcherValue2).toBeUndefined();
          expect(unchainableMatcherValue3).toBeUndefined();
        });
      });

      describe("when further chained matchers have been added", function() {
        var expectValue, chainableMatcherValue1, chainableMatcherValue2;

        beforeEach(function() {
          env.it("spec", function() {
            expectValue              = this.expect({ height: 12 });
            chainableMatcherValue1   = this.expect({ height: 12 }).toHaveA('height');
            chainableMatcherValue2   = this.expect({ height: 12 }).toHaveA('height').between(10);
          });

          suite.execute();
        });

        it("has methods for each of the chained matchers", function() {
          expect(typeof chainableMatcherValue1.ofExactly).toBe("function");
          expect(typeof chainableMatcherValue1.between).toBe("function");
          expect(typeof chainableMatcherValue2.and).toBe("function");
        });

        it("does not have the same methods as other matchers", function() {
          expect(chainableMatcherValue2.ofExactly).toBeUndefined();
          expect(chainableMatcherValue2.between).toBeUndefined();
        });

        it("does not have the normal top-level matcher methods", function() {
          expect(chainableMatcherValue1.toBe).toBeUndefined();
          expect(chainableMatcherValue2.toBe).toBeUndefined();
          expect(chainableMatcherValue1.toEqual).toBeUndefined();
          expect(chainableMatcherValue2.toEqual).toBeUndefined();
        });

        it("has the same env and spec as the parent matcher object", function() {
          expect(chainableMatcherValue1.env).toBe(expectValue.env);
          expect(chainableMatcherValue2.env).toBe(expectValue.env);
          expect(chainableMatcherValue1.spec).toBe(expectValue.spec);
          expect(chainableMatcherValue2.spec).toBe(expectValue.spec);
        });

        it("does NOT have a 'not' property (nots are only allowed at the beginning of a matcher chain)", function() {
          expect(chainableMatcherValue1['not']).toBeUndefined();
          expect(chainableMatcherValue2['not']).toBeUndefined();
        });

        it("keeps any properties that are set on 'this' by earlier matcher functions", function() {
          expect(chainableMatcherValue1.valueToCompare).toBe(12);
          expect(chainableMatcherValue1.valueToCompare).toBe(12);
        });
      });
    });

    describe("when matchers are chained without a 'not'", function() {
      var results;

      describe("when any of the matchers in the chain do *not* match", function() {
        beforeEach(function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).toHaveA("width").ofExactly(3);
            this.expect({ height: 3 }).toHaveA("height").ofExactly(5);
            this.expect({ height: 3 }).toHaveA("height").between(1).and(2);
          });
        });

        it("adds one failure to the spec's results", function() {
          expect(results.length).toBe(3);
          expect(results[0].passed()).toBeFalsy();
          expect(results[1].passed()).toBeFalsy();
          expect(results[2].passed()).toBeFalsy();
        });

        it("builds a failure message from the complete chain of matchers", function() {
          expect(results[0].message).toBe("Expected { height : 3 } to have a 'width' of exactly 3.");
          expect(results[1].message).toBe("Expected { height : 3 } to have a 'height' of exactly 5.");
          expect(results[2].message).toBe("Expected { height : 3 } to have a 'height' between 1 and 2.");
        });
      });

      describe("when all of the matchers match", function() {
        it("adds one success to the spec's results", function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).toHaveA("height").ofExactly(3);
            this.expect({ height: 3 }).toHaveA("height").between(2).and(5);
          });

          expect(results.length).toBe(2);
          expect(results[0].passed()).toBeTruthy();
          expect(results[1].passed()).toBeTruthy();
          expect(results[0].message).toBe("Passed.");
          expect(results[1].message).toBe("Passed.");
        });
      });
    });

    describe("when matchers are chained, starting with a 'not'", function() {
      var results;

      describe("when any of the matchers in the chain do *not* match", function() {
        it("adds a single success to the spec's results", function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).not.toHaveA("width").ofExactly(3);
            this.expect({ height: 3 }).not.toHaveA("height").ofExactly(5);
            this.expect({ height: 3 }).not.toHaveA("height").between(5).and(10);
            this.expect({ height: 3 }).not.toHaveA("height").between(10).and(20);
          });

          expect(results.length).toBe(4);
          expect(results[0].passed()).toBeTruthy();
          expect(results[1].passed()).toBeTruthy();
          expect(results[2].passed()).toBeTruthy();
          expect(results[3].passed()).toBeTruthy();
          expect(results[0].message).toBe("Passed.");
          expect(results[1].message).toBe("Passed.");
          expect(results[2].message).toBe("Passed.");
          expect(results[3].message).toBe("Passed.");
        });
      });

      describe("when all of the matchers match", function() {
        beforeEach(function() {
          results = resultsOfSpec(function() {
            this.expect({ height: 3 }).not.toHaveA("height").ofExactly(3);
            this.expect({ height: 3 }).not.toHaveA("height").between(2).and(4);
          });
        });

        it("adds a single failure to the spec's results", function() {
          expect(results.length).toBe(2);
          expect(results[0].passed()).toBeFalsy();
          expect(results[1].passed()).toBeFalsy();
        });

        it("builds a failure message from the complete chain of matchers", function() {
          expect(results[0].message).toBe("Expected { height : 3 } not to have a 'height' of exactly 3.");
          expect(results[1].message).toBe("Expected { height : 3 } not to have a 'height' between 2 and 4.");
        });
      });
    });
  }

  function resultsOfSpec(specFunction) {
    var spec = env.it("spec", specFunction);
    suite.execute();
    return spec.results().getItems();
  }
});

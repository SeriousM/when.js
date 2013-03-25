$.wait = function(time) {
  return $.Deferred(function(dfd) {
    setTimeout(dfd.resolve, time);
  });
}

var getAsyncFunc = function(test, name, interval){
  return function(){
    var self = this;
    $.wait(interval).then(function(){
      var val = new Date().getTime();
      console.log(name+"-"+val);
      eval("test.val"+name+"="+val+";");
      self.complete();
    });
  };
};

describe("when.js tests", function(){
  it("#01", function(){
    console.log("#01");
    var val1 = 0;

    var func1 = getAsyncFunc(this, 1, 100);

    w = when(func1);
    w.start();

    waitsFor(function(){
      return this.val1 > 0;
    });

    runs(function(){
      expect(this.val1).toBeGreaterThan(0);
    });
  });

  it("#02", function(){
    console.log("#02");
    var val1 = 0;
    var val2 = 0;

    var func1 = getAsyncFunc(this, 1, 150);
    var func2 = getAsyncFunc(this, 2, 100);

    var w = when(func1);
    w.continueWith(func2);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0;
    });

    runs(function(){
      expect(this.val2).toBeGreaterThan(this.val1, "func 2 was faster");
    });
  });

  it("#03", function(){
    console.log("#03");
    var val1 = 0;
    var val2 = 0;

    var func1 = getAsyncFunc(this, 1, 150);
    var func2 = getAsyncFunc(this, 2, 100);

    var w2 = when(func2);
    var w = when(func1);
    w.continueWith(w2);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0;
    });

    runs(function(){
      expect(this.val2).toBeGreaterThan(this.val1, "func 2 was faster");
    });
  });

  it("#04", function(){
    console.log("#04");
    var val1 = 0;
    var val2 = 0;

    var func1 = getAsyncFunc(this, 1, 150);
    var func2 = getAsyncFunc(this, 2, 100);

    var w = when([func1, func2]);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0;
    });

    runs(function(){
      expect(this.val1).toBeGreaterThan(0);
      expect(this.val2).toBeGreaterThan(0);
    });
  });

  it("#05", function(){
    console.log("#05");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;

    var func1 = getAsyncFunc(this, 1, 150);
    var func2 = getAsyncFunc(this, 2, 100);
    var func3 = getAsyncFunc(this, 3, 75);

    var w = when([func1, func2]);
    w.continueWith(func3);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0 && this.val3 > 0;
    });

    runs(function(){
      expect(this.val3).toBeGreaterThan(this.val1);
      expect(this.val3).toBeGreaterThan(this.val2);
    });
  });

  it("#06", function(){
    console.log("#06");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var val4 = 0;

    var func1 = getAsyncFunc(this, 1, 150);
    var func2 = getAsyncFunc(this, 2, 100);
    var func3 = getAsyncFunc(this, 3, 75);
    var func4 = getAsyncFunc(this, 4, 50);

    var w2 = when([func2, func3]);
    var w = when([func1, w2]);
    w.continueWith(func4);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0 && this.val3 > 0 && this.val4 > 0;
    });

    runs(function(){
      expect(this.val4).toBeGreaterThan(this.val1);
      expect(this.val4).toBeGreaterThan(this.val2);
      expect(this.val4).toBeGreaterThan(this.val3);
    });
  });

  it("#07", function(){
    console.log("#07");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var val4 = 0;
    var val5 = 0;
    var val6 = 0;
    var val7 = 0;
    var val8 = 0;

    var func1 = getAsyncFunc(this, 1, 150);
    var func2 = getAsyncFunc(this, 2, 100);
    var func3 = getAsyncFunc(this, 3, 75);
    var func4 = getAsyncFunc(this, 4, 50);
    var func5 = getAsyncFunc(this, 5, 350);
    var func6 = getAsyncFunc(this, 6, 410);
    var func7 = getAsyncFunc(this, 7, 333);
    var func8 = getAsyncFunc(this, 8, 123);

    var w = when(
              [when([func1, func2]), 
              when([func3, func4])])
            .continueWith(func5)
            .continueWith([func6, func7])
            .continueWith(func8);

    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0 && this.val3 > 0 && this.val4 > 0 &&
       this.val5 > 0 && this.val6 > 0 && this.val7 > 0 && this.val8 > 0;
    });

    runs(function(){
      expect(this.val8).toBeGreaterThan(this.val1);
      expect(this.val8).toBeGreaterThan(this.val2);
      expect(this.val8).toBeGreaterThan(this.val3);
      expect(this.val8).toBeGreaterThan(this.val4);
      expect(this.val8).toBeGreaterThan(this.val5);
      expect(this.val8).toBeGreaterThan(this.val6);
      expect(this.val8).toBeGreaterThan(this.val7);
      
      expect(this.val5).toBeGreaterThan(this.val1);
      expect(this.val5).toBeGreaterThan(this.val2);
      expect(this.val5).toBeGreaterThan(this.val3);
      expect(this.val5).toBeGreaterThan(this.val4);
      
      expect(this.val6).toBeGreaterThan(this.val5);
      expect(this.val7).toBeGreaterThan(this.val5);
    });
  });

  it("#08", function(){
    console.log("#08");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var test = this;

    var func1 = getAsyncFunc(this, 1, 150);
    var sync2 = function(){
      test.val2 = new Date().getTime();
      console.log("2-"+test.val2);
    };
    var func3 = getAsyncFunc(this, 3, 75);

    var w = when(func1).continueWith(wrapSync(sync2)).continueWith(func3);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0 && this.val3 > 0;
    });

    runs(function(){
      expect(this.val2 >= this.val1).toBeTruthy();
      expect(this.val3).toBeGreaterThan(this.val1);
      expect(this.val3 >= this.val2).toBeTruthy();
    });
  });

  it("#09", function(){
    console.log("#09");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var test = this;

    var func1 = getAsyncFunc(this, 1, 150);
    var getFastPromise2 = function(){
      var deferred = $.Deferred();
      $.wait(50).then(function(){
        test.val2 = new Date().getTime();
        console.log("2-"+test.val2);
        deferred.resolve();
      });
      return deferred.promise();
    };
    var func3 = getAsyncFunc(this, 3, 75);

    var w = when(func1).continueWith(getFastPromise2()).continueWith(func3);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0 && this.val3 > 0;
    });

    runs(function(){
      // we cant check val2 because it is an external deferred and maybe executed already
      expect(this.val3).toBeGreaterThan(this.val1);
      expect(this.val3 >= this.val2).toBeTruthy();
    });
  });

  it("#10", function(){
    console.log("#10");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var test = this;

    var func1 = getAsyncFunc(this, 1, 150);
    var getSlowPromise2 = function(){
      var deferred = $.Deferred();
      $.wait(300).then(function(){
        test.val2 = new Date().getTime();
        console.log("2-"+test.val2);
        deferred.resolve();
      });
      return deferred.promise();
    };
    var func3 = getAsyncFunc(this, 3, 75);

    var w = when([func1, getSlowPromise2()]).continueWith(func3);
    w.start();

    waitsFor(function(){
      return this.val1 > 0 && this.val2 > 0 && this.val3 > 0;
    });

    runs(function(){
      // we cant check val2 because it is an external deferred and maybe executed already
      expect(this.val3).toBeGreaterThan(this.val1);
      expect(this.val3 >= this.val2).toBeTruthy();
    });
  });

  it("#11", function(){
    console.log("#11");
    var callCount1 = 0;
    var testFinished = 0;

    var func1 = function(){
      callCount1++;
      console.log("1-"+(new Date().getTime())+", call #"+callCount1);
      this.complete();
    };

    var w = when(func1);
    w.start();
    w.start();

    $.wait(250).then(function(){
      testFinished = 1;
    });

    waitsFor(function(){
      return testFinished == 1;
    });

    runs(function(){
      expect(callCount1).toBe(1);
    });
  });

  it("#12", function(){
    console.log("#12");
    var callCount1 = 0;
    var callCount2 = 0;
    var testFinished = 0;

    var func1 = function(){
      callCount1++;
      console.log("1-"+(new Date().getTime())+", call #"+callCount1);
      this.complete();
    };
    var func2 = function(){
      callCount2++;
      console.log("2-"+(new Date().getTime())+", call #"+callCount2);
      this.complete();
    };

    var w = when([func1, func2]);
    w.start();
    w.start();

    $.wait(100).then(function(){
      testFinished = 1;
    });

    waitsFor(function(){
      return testFinished == 1;
    });

    runs(function(){
      expect(callCount1).toBe(1);
      expect(callCount2).toBe(1);
    });
  });

  it("#13", function(){
    console.log("#13");
    var callCount1 = 0;
    var callCount2 = 0;
    var callCount3 = 0;
    var testFinished = 0;

    var func1 = function(){
      callCount1++;
      console.log("1-"+(new Date().getTime())+", call #"+callCount1);
      this.complete();
    };
    var func2 = function(){
      callCount2++;
      console.log("2-"+(new Date().getTime())+", call #"+callCount2);
      this.complete();
    };
    var func3 = function(){
      callCount3++;
      console.log("3-"+(new Date().getTime())+", call #"+callCount3);
      this.complete();
    };

    var w = when([func1, func2]);
    var c = w.continueWith(func3);
    w.start();
    c.start();
    w.start();
    c.start();
    w.start();

    $.wait(100).then(function(){
      testFinished = 1;
    });

    waitsFor(function(){
      return testFinished == 1;
    });

    runs(function(){
      expect(callCount1).toBe(1);
      expect(callCount2).toBe(1);
      expect(callCount3).toBe(1);
    });
  });

  it("#14", function(){
    console.log("#14");
    var callCount1 = 0;
    var callCount2 = 0;
    var callCount3 = 0;
    var callCount4 = 0;
    var testFinished = 0;

    var func1 = function(){
      callCount1++;
      console.log("1-"+(new Date().getTime())+", call #"+callCount1);
      this.complete();
    };
    var func2 = function(){
      callCount2++;
      console.log("2-"+(new Date().getTime())+", call #"+callCount2);
      this.complete();
    };
    var func3 = function(){
      callCount3++;
      console.log("3-"+(new Date().getTime())+", call #"+callCount3);
      this.complete();
    };
    var func4 = function(){
      callCount4++;
      console.log("4-"+(new Date().getTime())+", call #"+callCount4);
      this.complete();
    };

    var w2 = when(func2);
    var w1 = when([func1, w2]);
    var c = w1.continueWith(func3);
    w2.start();
    w1.start();
    c.start();
    w2.continueWith(func4);
    w1.start();
    w2.start();
    c.start();
    w1.start();
    w2.start();

    $.wait(100).then(function(){
      testFinished = 1;
    });

    waitsFor(function(){
      return testFinished == 1;
    });

    runs(function(){
      expect(callCount1).toBe(1);
      expect(callCount2).toBe(1);
      expect(callCount3).toBe(1);
    });
  });
});
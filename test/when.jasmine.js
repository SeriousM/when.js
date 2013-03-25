$.wait = function(time) {
  return $.Deferred(function(dfd) {
    setTimeout(dfd.resolve, time);
  });
}

describe("when.js tests", function(){
  it("#1", function(){
    console.log("#1");
    var val1 = 0;

    var func1 = function(){
      var self = this;
      $.wait(100).then(function(){
        val1 = new Date().getTime();
        console.log("1-"+val1);
        self.complete();
      });
    };

    var w = when(func1);
    wu = windUp(w);
    wu.release();

    waitsFor(function(){
      return val1 > 0;
    });

    runs(function(){
      expect(val1).toBeGreaterThan(0);
    });
  });

  it("#2", function(){
    console.log("#2");
    var val1 = 0;
    var val2 = 0;

    var func1 = function(){
      var self = this;
      $.wait(150).then(function(){
        val1 = new Date().getTime();
        console.log("1-"+val1);
        self.complete();
      });
    };
    var func2 = function(){
      var self = this;
      $.wait(100).then(function(){
        val2 = new Date().getTime();
        console.log("2-"+val2);
        self.complete();
      });
    };

    var w = when(func1);
    w.continueWith(func2);
    wu = windUp(w);
    wu.release();

    waitsFor(function(){
      return val1 > 0 && val2 > 0;
    });

    runs(function(){
      expect(val2).toBeGreaterThan(val1, "func 2 was faster");
    });
  });

  it("#3", function(){
    console.log("#3");
    var val1 = 0;
    var val2 = 0;

    var func1 = function(){
      var self = this;
      $.wait(150).then(function(){
        val1 = new Date().getTime();
        console.log("1-"+val1);
        self.complete();
      });
    };
    var func2 = function(){
      var self = this;
      $.wait(100).then(function(){
        val2 = new Date().getTime();
        console.log("2-"+val2);
        self.complete();
      });
    };

    var w2 = when(func2);
    var w = when(func1);
    w.continueWith(w2);
    wu = windUp(w);
    wu.release();

    waitsFor(function(){
      return val1 > 0 && val2 > 0;
    });

    runs(function(){
      expect(val2).toBeGreaterThan(val1, "func 2 was faster");
    });
  });

  it("#4", function(){
    console.log("#4");
    var val1 = 0;
    var val2 = 0;

    var func1 = function(){
      var self = this;
      $.wait(150).then(function(){
        val1 = new Date().getTime();
        console.log("1-"+val1);
        self.complete();
      });
    };
    var func2 = function(){
      var self = this;
      $.wait(100).then(function(){
        val2 = new Date().getTime();
        console.log("2-"+val2);
        self.complete();
      });
    };

    var w = when([func1, func2]);
    wu = windUp(w);
    wu.release();

    waitsFor(function(){
      return val1 > 0 && val2 > 0;
    });

    runs(function(){
      expect(val1).toBeGreaterThan(0);
      expect(val2).toBeGreaterThan(0);
    });
  });

  it("#5", function(){
    console.log("#5");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;

    var func1 = function(){
      var self = this;
      $.wait(150).then(function(){
        val1 = new Date().getTime();
        console.log("1-"+val1);
        self.complete();
      });
    };
    var func2 = function(){
      var self = this;
      $.wait(100).then(function(){
        val2 = new Date().getTime();
        console.log("2-"+val2);
        self.complete();
      });
    };
    var func3 = function(){
      var self = this;
      $.wait(75).then(function(){
        val3 = new Date().getTime();
        console.log("3-"+val3);
        self.complete();
      });
    };

    var w = when([func1, func2]);
    w.continueWith(func3);
    wu = windUp(w);
    wu.release();

    waitsFor(function(){
      return val1 > 0 && val2 > 0 && val3 > 0;
    });

    runs(function(){
      expect(val3).toBeGreaterThan(val1);
      expect(val3).toBeGreaterThan(val2);
    });
  });

  it("#6", function(){
    console.log("#6");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var val4 = 0;

    var func1 = function(){
      var self = this;
      $.wait(150).then(function(){
        val1 = new Date().getTime();
        console.log("1-"+val1);
        self.complete();
      });
    };
    var func2 = function(){
      var self = this;
      $.wait(100).then(function(){
        val2 = new Date().getTime();
        console.log("2-"+val2);
        self.complete();
      });
    };
    var func3 = function(){
      var self = this;
      $.wait(75).then(function(){
        val3 = new Date().getTime();
        console.log("3-"+val3);
        self.complete();
      });
    };
    var func4 = function(){
      var self = this;
      $.wait(50).then(function(){
        val4 = new Date().getTime();
        console.log("4-"+val4);
        self.complete();
      });
    };

    var w2 = when([func2, func3]);
    var w = when([func1, w2]);
    w.continueWith(func4);
    wu = windUp(w);
    wu.release();

    waitsFor(function(){
      return val1 > 0 && val2 > 0 && val3 > 0 && val4 > 0;
    });

    runs(function(){
      expect(val4).toBeGreaterThan(val1);
      expect(val4).toBeGreaterThan(val2);
      expect(val4).toBeGreaterThan(val3);
    });
  });

  it("#7", function(){
    console.log("#7");
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var val4 = 0;
    var val5 = 0;
    var val6 = 0;
    var val7 = 0;
    var val8 = 0;

    var func1 = function(){
      var self = this;
      $.wait(150).then(function(){
        val1 = new Date().getTime();
        console.log("1-"+val1);
        self.complete();
      });
    };
    var func2 = function(){
      var self = this;
      $.wait(100).then(function(){
        val2 = new Date().getTime();
        console.log("2-"+val2);
        self.complete();
      });
    };
    var func3 = function(){
      var self = this;
      $.wait(75).then(function(){
        val3 = new Date().getTime();
        console.log("3-"+val3);
        self.complete();
      });
    };
    var func4 = function(){
      var self = this;
      $.wait(50).then(function(){
        val4 = new Date().getTime();
        console.log("4-"+val4);
        self.complete();
      });
    };
    var func5 = function(){
      var self = this;
      $.wait(350).then(function(){
        val5 = new Date().getTime();
        console.log("5-"+val5);
        self.complete();
      });
    };
    var func6 = function(){
      var self = this;
      $.wait(410).then(function(){
        val6 = new Date().getTime();
        console.log("6-"+val6);
        self.complete();
      });
    };
    var func7 = function(){
      var self = this;
      $.wait(333).then(function(){
        val7 = new Date().getTime();
        console.log("7-"+val7);
        self.complete();
      });
    };
    var func8 = function(){
      var self = this;
      $.wait(123).then(function(){
        val8 = new Date().getTime();
        console.log("8-"+val8);
        self.complete();
      });
    };

    var w = when(
              [when([func1, func2]), 
              when([func3, func4])])
            .continueWith(func5)
            .continueWith([func6, func7])
            .continueWith(func8);

    wu = windUp(w);
    wu.release();

    waitsFor(function(){
      return val1 > 0 && val2 > 0 && val3 > 0 && val4 > 0 &&
       val5 > 0 && val6 > 0 && val7 > 0 && val8 > 0;
    });

    runs(function(){
      expect(val8).toBeGreaterThan(val1);
      expect(val8).toBeGreaterThan(val2);
      expect(val8).toBeGreaterThan(val3);
      expect(val8).toBeGreaterThan(val4);
      expect(val8).toBeGreaterThan(val5);
      expect(val8).toBeGreaterThan(val6);
      expect(val8).toBeGreaterThan(val7);
      
      expect(val5).toBeGreaterThan(val1);
      expect(val5).toBeGreaterThan(val2);
      expect(val5).toBeGreaterThan(val3);
      expect(val5).toBeGreaterThan(val4);
      
      expect(val6).toBeGreaterThan(val5);
      expect(val7).toBeGreaterThan(val5);
    });
  });
});
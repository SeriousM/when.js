(function(window, $, undefined){
  var whenFunc, wrapFuncFunc, windUpFunc, isWhenPromiseFunc, getParentOrCurrentPromiseFunc, getExecutePromissesFunc;

  isWhenPromiseFunc = function(promise){
    return promise && promise['invoke'] != undefined;
  };

  getParentOrCurrentPromiseFunc = function(promise){
    return promise['parent'] ? promise.parent() : promise;
  };

  wrapFuncFunc = function(func){
    var deferred = $.Deferred();
    var promise = deferred.promise();

    promise.invoke = function(){
      func.apply({
        complete: function(){
          deferred.resolve();
        }
      });
    };

    promise.__func = func;

    return promise;
  };

  getExecutePromissesFunc = function (deferredInfoArray) {
    var deferredArray = [];

    $.each(deferredInfoArray, function(index, item) {
      item.invoke();

      deferredArray.push(item);
    });

    return deferredArray;
  };

  var getArrayPromiseFunc = function() {
    var promisses = [];

    var deferred = $.Deferred();

    var startBigWhen = function () {
      var executedPromisses = getExecutePromissesFunc(promisses);

      $.when.apply(null, executedPromisses).then(function () {
        deferred.resolve();
      });
    };

    var promise = deferred.promise();

    promise.getPromisses = function () {
      return promisses;
    };

    promise.addPromise = function (p) {
      promisses.push(p);
    };

    promise.invoke = function() {
        startBigWhen();
    };

    return promise;
  };

  var getAppropriatePromissesFunc = function(func){
    var promisses;

    if (func instanceof Function){
      promisses = [wrapFuncFunc(func)];
    }
    else if (func instanceof Array){
      promisses = [];
      $.each(func, function(index, item){
        promisses = promisses.concat(getAppropriatePromissesFunc(item));
      });
    }
    else {
      // expect that promise is a when-object
      promisses = [func];
    }

    return promisses;
  };

  whenFunc = function(func){
    // create the hosting promise
    var selfPromise = getArrayPromiseFunc();

    // gather/create a promise of the argument
    var promisses = getAppropriatePromissesFunc(func);
    
    // add the new promise of the argument to the hosting promise
    $.each(promisses, function(index, item){
      selfPromise.addPromise(item);
    });

    selfPromise.continueWith = whenFunc;

    // check if the caller is already a self made promise
    if (isWhenPromiseFunc(this)){
      var callingPromise = this;

      selfPromise.parent = function(){
        return getParentOrCurrentPromiseFunc(callingPromise);
      };

      callingPromise.then(function(){
        selfPromise.invoke();
      });
    }

    return selfPromise;
  };

  windUpFunc = function(promise){
    return {
      release: function(){
        var promiseToInvoke = getParentOrCurrentPromiseFunc(promise);
        promiseToInvoke.invoke();
      }
    };
  };

  window.when = whenFunc;
  window.windUp = windUpFunc;
})(window, jQuery)
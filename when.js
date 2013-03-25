(function(window, $, undefined){
  var whenFunc, wrapFuncFunc, isWhenObjectFunc, isPromiseObjectFunc,
   getParentOrCurrentPromiseFunc, getExecutePromissesFunc, extendExternalDeferredWithInvokeFunc,
   wrapSyncFuncFunc, getArrayPromiseFunc, getAppropriatePromissesFunc;

  isWhenObjectFunc = function(promise){
    return promise && promise['invoke'] != undefined;
  };

  isPromiseObjectFunc = function(promise){
    return promise && promise['promise'] != undefined;
  };

  getParentOrCurrentPromiseFunc = function(promise){
    return promise['parent'] ? promise.parent() : promise;
  };

  wrapFuncFunc = function(func){
    var deferred = $.Deferred(),
        promise = deferred.promise();

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

  wrapSyncFuncFunc = function(func){
    var deferred = $.Deferred(),
        promise = deferred.promise();

    promise.invoke = function(){
      func();
      deferred.resolve();
    };

    promise.__func = func;

    return promise;
  };

  extendExternalDeferredWithInvokeFunc = function(promise){
    promise.invoke = function(){
      // do nothing here, the promise implementer will handle that
    };
    promise.__func = "external promise";

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

  getArrayPromiseFunc = function() {
    var promisses = [],
        deferred = $.Deferred(),
        promise = deferred.promise();

    var invokePromisses = function () {
      var executedPromisses = getExecutePromissesFunc(promisses);

      $.when.apply(null, executedPromisses).then(function () {
        deferred.resolve();
      });
    };

    promise.getPromisses = function () {
      return promisses;
    };

    promise.addPromise = function (p) {
      promisses.push(p);
    };

    promise.invoke = function() {
        invokePromisses();
    };

    return promise;
  };

  getAppropriatePromissesFunc = function(func){
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
    else if (isWhenObjectFunc(func)){
      promisses = [func];
    }
    else if (isPromiseObjectFunc(func)){
      promisses = [extendExternalDeferredWithInvokeFunc(func)];
    }
    else {
      throw new Error("The argument or part of the array must be euither a "+
        "function that calls 'this.complete()', a when object, a promise or a "+
        "sync function wrapped with wrapSync.");
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

    // check if the caller is already a self made promise.
    // if so, attach to the parent then function
    if (isWhenObjectFunc(this)){
      var callingPromise = this;

      selfPromise.parent = function(){
        return getParentOrCurrentPromiseFunc(callingPromise);
      };

      callingPromise.then(function(){
        selfPromise.invoke();
      });
    }

    // enable chaining
    selfPromise.continueWith = whenFunc;

    // define the launch-method
    selfPromise.start = function(){
      var promiseToInvoke = getParentOrCurrentPromiseFunc(selfPromise);
      promiseToInvoke.invoke();
    };

    return selfPromise;
  };

  window.when = whenFunc;
  window.wrapSync = wrapSyncFuncFunc;
})(window, jQuery)
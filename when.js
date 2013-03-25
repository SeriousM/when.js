(function(window, $, undefined){
  var whenFunc, wrapAsyncFuncFunc, isWhenObjectFunc, isPromiseObjectFunc,
   getParentOrCurrentPromiseFunc, getExecutePromissesFunc,
   wrapSyncFuncFunc, getPromiseHostFunc, getPromissesInfoFunc, startFunc;

  isWhenObjectFunc = function(promise){
    return promise && promise['invoke'] != undefined;
  };

  isPromiseObjectFunc = function(promise){
    return promise && promise['promise'] != undefined;
  };

  getParentOrCurrentPromiseFunc = function(promise){
    return promise['parent'] ? promise.parent() : promise;
  };

  wrapAsyncFuncFunc = function(func){
    // this func will call 'this.complete'
    var deferred = $.Deferred(),
        promise = deferred.promise(),
        wasInvoked = false;

    promise.invoke = function(){
      if (wasInvoked) return;
      wasInvoked = true;
      
      func.apply({
        complete: function(){
          deferred.resolve();
        }
      });
    };

    // info: this is for debug purposes
    promise.__func = func;

    return promise;
  };

  wrapSyncFuncFunc = function(func){
    // sync functions does not call 'this.complete'
    var deferred = $.Deferred(),
        promise = deferred.promise(),
        wasInvoked = false;

    promise.invoke = function(){
      if (wasInvoked) return;
      wasInvoked = true;

      func();
      deferred.resolve();
    };

    // info: this is for debug purposes
    promise.__func = func;

    return promise;
  };

  getExecutePromissesFunc = function (deferredInfoArray) {
    var deferredArray = [];

    $.each(deferredInfoArray, function(index, item) {
      // case: nested in-between whens with continueWith's
      // we invoking the parent of the promise to start in-between-when's
      // the item itself will be executed anyway when the parent calls it
      var parentPromise = getParentOrCurrentPromiseFunc(item);
      parentPromise.invoke();

      deferredArray.push(item);
    });

    return deferredArray;
  };

  getPromiseHostFunc = function() {
    var promisses = [],
        monitoring = [],
        deferred = $.Deferred(),
        promise = deferred.promise(),
        wasInvoked = false;

    var invokePromisses = function () {
      if (wasInvoked) return;
      wasInvoked = true;

      var executedPromisses = getExecutePromissesFunc(promisses);
      var promissesToMonitor = executedPromisses.concat(monitoring);

      $.when.apply(null, promissesToMonitor).then(function () {
        deferred.resolve();
      });
    };

    promise.invoke = function() {
        invokePromisses();
    };

    promise.addPromissesInfo = function(promissesInfo){
      $.each(promissesInfo.promisses, function(index, item){
        promisses.push(item);
      });
      $.each(promissesInfo.monitoring, function(index, item){
        monitoring.push(item);
      });
    };

    return promise;
  };

  getPromissesInfoFunc = function(func){
    var promisses = [], monitoring = [];

    if (func instanceof Function){
      promisses.push(wrapAsyncFuncFunc(func));
    }
    else if (func instanceof Array){
      promisses = [];
      $.each(func, function(index, item){
        var promissesInfo = getPromissesInfoFunc(item);
        promisses = promisses.concat(promissesInfo.promisses);
        monitoring = monitoring.concat(promissesInfo.monitoring);
      });
    }
    else if (isWhenObjectFunc(func)){
      promisses.push(func);
    }
    else if (isPromiseObjectFunc(func)){
      monitoring.push(func);
    }
    else {
      throw new Error("The argument or part of the array must be either a "+
        "function that calls 'this.complete()', a when object, a promise or a "+
        "sync function wrapped with wrapSync.");
    }

    return {
      promisses: promisses,
      monitoring: monitoring
    };
  };

  startFunc = function(){
    var whenOrContinueWithPromise = this;

    var promiseToInvoke = getParentOrCurrentPromiseFunc(whenOrContinueWithPromise);
    promiseToInvoke.invoke();
    
    // it is important to return the calling when-object for propper chaining
    return whenOrContinueWithPromise;
  };

  whenFunc = function(func){
    var promiseHost = getPromiseHostFunc();

    var promissesInfo = getPromissesInfoFunc(func);
    promiseHost.addPromissesInfo(promissesInfo);

    // check if the caller is already a self made promise.
    // if so, attach to the parent then function
    if (isWhenObjectFunc(this)){
      var callingPromiseHost = this;

      promiseHost.parent = function(){
        return getParentOrCurrentPromiseFunc(callingPromiseHost);
      };

      callingPromiseHost.then(function(){
        promiseHost.invoke();
      });
    }

    // enable chaining
    promiseHost.continueWith = whenFunc;

    // define the launch-method
    promiseHost.start = startFunc;

    return promiseHost;
  };

  window.when = whenFunc;
  window.wrapSync = wrapSyncFuncFunc;
})(window, jQuery);
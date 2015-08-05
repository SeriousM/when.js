(function (window, $, undefined) {
  "use strict";

  var when, wrapAsyncFunc, isWhenObject, isPromiseObject,
   getParentOrCurrentPromise, getExecutePromisses,
   wrapSyncFunc, getPromiseHost, getPromissesInfo, start;

  isWhenObject = function(promise){
    return promise && promise["invoke"] !== undefined;
  };

  isPromiseObject = function(promise){
    return promise && promise["promise"] !== undefined;
  };

  getParentOrCurrentPromise = function(promise){
    return promise["parent"] ? promise.parent() : promise;
  };

  wrapAsyncFunc = function(func){
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

  wrapSyncFunc = function(func){
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

  getExecutePromisses = function (deferredInfoArray) {
    var deferredArray = [];

    $.each(deferredInfoArray, function(index, item) {
      // case: nested in-between whens with continueWith's
      // we invoking the parent of the promise to start in-between-when's
      // the item itself will be executed anyway when the parent calls it
      var parentPromise = getParentOrCurrentPromise(item);
      parentPromise.invoke();

      deferredArray.push(item);
    });

    return deferredArray;
  };

  getPromiseHost = function() {
    var promisses = [],
        monitoring = [],
        deferred = $.Deferred(),
        promise = deferred.promise(),
        wasInvoked = false,
        invokePromisses;

    invokePromisses = function () {
      if (wasInvoked) return;
      wasInvoked = true;

      var executedPromisses = getExecutePromisses(promisses),
          promissesToMonitor = executedPromisses.concat(monitoring);

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

  getPromissesInfo = function(func){
    var promisses = [],
        monitoring = [];

    if (func instanceof Function){
      promisses.push(wrapAsyncFunc(func));
    }
    else if (func instanceof Array){
      promisses = [];
      $.each(func, function(index, item){
        var promissesInfo = getPromissesInfo(item);
        promisses = promisses.concat(promissesInfo.promisses);
        monitoring = monitoring.concat(promissesInfo.monitoring);
      });
    }
    else if (isWhenObject(func)){
      promisses.push(func);
    }
    else if (isPromiseObject(func)){
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

  start = function(){
    var whenOrContinueWithPromise = this,
        promiseToInvoke = getParentOrCurrentPromise(whenOrContinueWithPromise);

    promiseToInvoke.invoke();
    
    // it is important to return the calling when-object for propper chaining
    return whenOrContinueWithPromise;
  };

  when = function (func) {
    var promiseHost = getPromiseHost(),
        promissesInfo;

    func = func || wrapSync(function nop(){});

    promissesInfo = getPromissesInfo(func);
    promiseHost.addPromissesInfo(promissesInfo);

    // check if the caller is already a self made promise.
    // if so, attach to the parent then function
    if (isWhenObject(this)){
      var callingPromiseHost = this;

      promiseHost.parent = function(){
        return getParentOrCurrentPromise(callingPromiseHost);
      };

      callingPromiseHost.then(function(){
        promiseHost.invoke();
      });
    }

    // enable chaining
    promiseHost.continueWith = when;

    // define the launch-method
    promiseHost.start = start;

    return promiseHost;
  };

  window.when = when;
  window.wrapSync = wrapSyncFunc;
})(window, jQuery);
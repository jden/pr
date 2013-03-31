var Q = require('q')

var toArray = Array.prototype.slice.call

function wrap(fn, returns) {
  if (!returns) {
    // callback is standard (err, result) => void interface
    return function () {
        var self = this
        var args = toArray(arguments)
        return Q.promise(function (resolve, reject) {

          fn.apply(this, args.concat(function (err, result) {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          }))

        })

      }    
  }

  // callback returns multiple values, accumulate those into an object
  return function () {
    var self = this
    var args = toArray(arguments)
    return Q.promise(function (resolve, reject) {

      fn.apply(this, args.concat(function(err) {
        var cbargs = arguments
        if (err) {
          reject(err)
        } else {
          return returns.reduce(function (ret, param, i) {
            ret[param] = cbargs[i+1]
            return ret
          }, {})
        }
      }))

    })
  }
  
}

function clone (obj) {
  var o = {}
  for (var i in obj) {
    o[i] = obj[i]
  }
  return o
}

function wrapModule(mod, fns) {
  mod = clone(mod)
  fns.forEach(function (fn) {
    if (Array.isArray(fn)) {
      var returns = fn.slice(1)
      fn = fn[0]
    }
    if (mod[fn]) {
      mod[fn] = wrap(mod[fn], returns)
    }
  })
  return mod
}

module.exports = wrapModule
module.exports.wrap = wrap
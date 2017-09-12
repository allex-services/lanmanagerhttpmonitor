function createClientSide(execlib) {
  'use strict';
  var execSuite = execlib.execSuite,
    ParentServicePack = execSuite.registry.get('undefined');

  return {
    SinkMap: require('./sinkmapcreator')(execlib, ParentServicePack)
  };
}

module.exports = createClientSide;

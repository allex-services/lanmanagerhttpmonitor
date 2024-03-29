function createLanManagerHttpMonitorService(execlib, ParentService) {
  'use strict';
  
  var lib = execlib.lib;

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function LanManagerHttpMonitorService(prophash) {
    prophash.allowAnonymous = true;
    ParentService.call(this, prophash);
    this.lanmanager = prophash.lanmanager;
  }
  
  ParentService.inherit(LanManagerHttpMonitorService, factoryCreator);
  
  LanManagerHttpMonitorService.prototype.__cleanUp = function() {
    this.lanmanager = null;
    ParentService.prototype.__cleanUp.call(this);
  };

  LanManagerHttpMonitorService.prototype.running = function (url, req, res) {
    res.end(JSON.stringify(this.allLanManagerServices().filter(running), null, 2));
  };

  LanManagerHttpMonitorService.prototype.pending = function (url, req, res) {
    res.end(JSON.stringify(this.allLanManagerServices().filter(pending), null, 2));
  };

  LanManagerHttpMonitorService.prototype.servicestatus = function (url, req, res) {
    res.end(JSON.stringify(this.allLanManagerServices(), null, 2));
  };

  LanManagerHttpMonitorService.prototype.allLanManagerServices = function () {
    var ret;
    if (!this.lanmanager) {
      return [];
    }
    ret = this.lanmanager.needsTable.map(picker.bind(null, 'pending'));
    this.lanmanager.servicesTable.reduce(serviceadder, ret);
    return ret;
  };

  function pending (item) {
    return item && item.status==='pending';
  }

  function running (item) {
    return item && item.status==='running';
  }

  function picker (status, need) {
    var ret = lib.pick(need, ['instancename', 'modulename', 'propertyhash', 'ipaddress', 'wsport']);
    ret.status = status;
    return ret;
  }

  function serviceadder (result, service) {
    var i, s, found;
    for (i=0; i<result.length && !found; i++) {
      s = result[i];
      if (s.instancename === service.instancename) {
        result[i] = picker('running', service);
        found = true;
      }
    }
    if (!found) {
      result.push(picker('running', service));
    }
    return result;
  }

  LanManagerHttpMonitorService.prototype.anonymousMethods = ['running', 'pending', 'servicestatus'];
  
  return LanManagerHttpMonitorService;
}

module.exports = createLanManagerHttpMonitorService;

'use strict'

var interfaces_d = require('./interfaces.d/index.js')
var { exec } = require('child_process')
var { promisify } = require('util')
var execPromise = promisify(exec)

exports.configure = async (configs) => {

  if (typeof configs == 'object' && !Array.isArray(configs))
    configs = [configs]

  var vlans_table = {}

  configs.forEach(c => {
    if (typeof c.vlanid == 'number') {
      var k = `${c.interface}.${c.vlanid}`
      if (vlans_table[k])
        throw new Error("Can't have same VLAN ID on interface " + c.interface)
      vlans_table[k] = true
    }
  })

  configs = configs.sort((a, b) => {
    return a.vlanid && !b.vlanid ? 1 : 0;
  })
  await Promise.all([
    interfaces_d.configure(configs),
  ])

}

exports.restartService = async () => {
  try {
    await execPromise('service networking restart')
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }
}
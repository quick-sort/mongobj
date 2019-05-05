var assert = require('assert');
var mongobj = require('./index');
describe('without arrayFilter', () => {
  it('set', () => {
    var a = {
      'l1': {
        '中文': {
          'tounset': '',
          'not_touch': 1
        }
      }
    }
    mongobj.update(a, {'$set': {'l1.中文.newset': 2}})
    assert.equal(a['l1']['中文']['newset'], 2)
  })
  it('set in undefined property', () => {
    var a = {
      'l1': {
      }
    }
    mongobj.update(a, {'$set': {'l1.中文.newset': 2}})
    assert.equal(a['l1']['中文']['newset'], 2)
  })
  it('unset', () => {
    var a = {
      'l1': {
        '中文': {
          'tounset': '',
          'not_touch': 1
        }
      }
    }
    mongobj.update(a, {'$unset': {'l1.中文.tounset': ''}})
    assert.equal(a['l1']['中文']['tounset'], undefined)
  })

  it('push one element', () => {
    var a = {
      'l1': {
        '中文': [
          {}
        ]
      }
    }
    mongobj.update(a, {'$push': {'l1.中文': {}}})
    assert.equal(a['l1']['中文'].length, 2)
  })

  it('push one element in undefined property', () => {
    var a = {
      'l1': {
      }
    }
    mongobj.update(a, {'$push': {'l1.中文': {}}})
    assert.equal(a['l1']['中文'].length, 1)
  })
  it('push multi elements', () => {
    var a = {
      'l1': {
        '中文': [
          {}
        ]
      }
    }
    mongobj.update(a, {'$push': {
      'l1.中文': {
        '$each':[{}, {}]
      }
    }})
    assert.equal(a['l1']['中文'].length, 3)
  })

  it('pull one element', () => {
    var a = {
      'l1': {
        '中文': {
          'l3': [{id:1}, {id:2}]
        }
      }
    }
    mongobj.update(a, {'$pull': {'l1.中文.l3': {id: 1}}})
    assert.equal(a['l1']['中文']['l3'][0].id, 2)
  })

  it('pull multi elements', () => {
    var a = {
      'l1': {
        '中文': {
          'l3': [{id:1}, {id:2}, {id: 3}]
        }
      }
    }
    mongobj.update(a, {'$pull': {'l1.中文.l3': {id: {'$in': [1, 2]}}}})
    assert.equal(a['l1']['中文']['l3'][0].id, 3)
  })

})
describe('with arrayFilter', () => {
  it('set', () => {
    var a = {
      'l1': {
        '中文': [{
          'id': 1,
          'tounset': '',
          'not_touch': 1
        }, {
          'id': 2,
          'tounset': '',
          'not_touch': 1
        }]
      }
    }
    mongobj.update(a, {'$set': {'l1.中文.$[i].newset': 2}}, {'arrayFilters': [{'i.id': 2}]})
    assert.equal(a['l1']['中文'][1]['newset'], 2)
  })

  it('unset', () => {
    var a = {
      'l1': {
        '中文': [{
          'id': 1,
          'tounset': '',
          'not_touch': 1
        }, {
          'id': 2,
          'tounset': '',
          'not_touch': 1
        }]
      }
    }
    mongobj.update(a, {'$unset': {'l1.中文.$[i].tounset': ''}}, {'arrayFilters': [{'i.id': 2}]})
    assert.equal(a['l1']['中文'][1]['tounset'], undefined)
  })

  it('push one element', () => {
    var a = {
      'l1': {
        '中文': [
          {
            id: 1,
            l3: []
          },
          {
            id: 2,
            l3: []
          }
        ]
      }
    }
    mongobj.update(a, {'$push': {'l1.中文.$[i].l3': {}}}, {'arrayFilters': [{'i.id': 2}]})
    assert.equal(a['l1']['中文'][1]['l3'].length, 1)
  })

  it('pull one element', () => {
    var a = {
      'l1': {
        '中文': [{
          'id': 1,
          'l3': [{id:1}, {id:2}]
        }, {
          'id': 2,
          'l3': [{id:1}, {id:2}]
        }]
      }
    }
    mongobj.update(a, {'$pull': {'l1.中文.$[i].l3': {id: 1}}}, {'arrayFilters': [{'i.id': 2}]})
    assert.equal(a['l1']['中文'][1]['l3'][0].id, 2)
  })

  it('pull multi elements', () => {
    var a = {
      'l1': {
        '中文': [{
          id: 1,
          'l3': [{id:1}, {id:2}, {id: 3}]
        }, {
          id: 2,
          'l3': [{id:1}, {id:2}, {id: 3}]
        }]
      }
    }
    mongobj.update(a, {'$pull': {'l1.中文.$[i].l3': {id: {'$in': [1, 2]}}}} , {'arrayFilters': [{'i.id': 2}]})
    assert.equal(a['l1']['中文'][1]['l3'][0].id, 3)
  })

})

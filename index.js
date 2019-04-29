const ArrayFilter = /^\$\[(.*)\]$/;
const ArrayIndex = /^[0-9]*$/;

function getAttr(obj, attrPath, arrayFilters, level = 0) {
  let tokens = attrPath.split('.');
  let parentObj = obj;
  while (tokens.length > level) {
    let attr = tokens.splice(0, 1)[0];
    let m = attr.match(ArrayFilter)
    if (m) {
      let filter = arrayFilters.find(f => Object.keys(f)[0].startsWith(m[1] + '.'));
      let key = Object.keys(filter)[0];
      let filterKey = key.substring(m[1].length + 1, key.length);
      let filterValue = Object.values(filter)[0];
      parentObj = parentObj.find(i => getAttr(i, filterKey) === filterValue);
    } else if (attr.match(ArrayIndex)) {
      parentObj = parentObj[parseInt(attr)];
    } else {
      if (!(attr in parentObj)) {
        parentObj[attr] = {};
      }
      parentObj = parentObj[attr];
    }
  }
  return parentObj;
}

function objectMatch(obj, filter) {
  for (let key in filter) {
    if (key.indexOf('.') >= 0) {
      console.log('nested attr path is not ready now');
    }
    if (typeof filter[key] !== 'object') {
      return obj[key] === filter[key];
    } else if (key === '$in') {
      return filter[key].includes(obj);
    } else {
      console.log('filter value is object, not ready now');
    }
  }
  return false;
}
function update(obj, changes, options = {}) {
  /*
  changes = {
    'set' | 'unset' | 'pull' | 'push': {
    "sections.$[i].title": updateValue,
    "sections.1.title": updateValue,
    "context.csv": updateValue
    }
  }
  options = {
    'arrayFilters': [{'i.title': searchValue}]
  }
  */
  for (let op in changes) {
    const patches = changes[op];
    for (let key in patches) {
      let tokens = key.split('.');
      let attr = null;
      let parent = null;
      switch (op) {
        case '$unset':
          parent = getAttr(obj, key, options.arrayFilters, 1);
          attr = tokens[tokens.length - 1];
          delete parent[attr];
          break;
        case '$pull':
          parent = getAttr(obj, key, options.arrayFilters);
          let idx = 0;
          if (typeof patches[key] === 'object') {
            while (idx >= 0) {
              idx = parent.findIndex(i => objectMatch(i, patches[key]));
              if (idx >= 0) {
                parent.splice(idx, 1);
              }
            }

          } else {
            while (idx >= 0) {
              idx = parent.indexOf(patches[key]);
              if (idx >= 0) {
                parent.splice(idx, 1);
              }
            }
          }

          break;
        case '$push':
          parent = getAttr(obj, key, options.arrayFilters);
          if (patches[key]['$each']) {
            patches[key]['$each'].forEach(i => {
              if ('$position' in patches[key]) {
                parent.splice(patches[key]['$position'], 0, i);
              } else {
                parent.push(i);
              }
            });
          } else {
            parent.push(patches[key]);
          }
          break;
        default:
          //set
          parent = getAttr(obj, key, options.arrayFilters, 1);
          attr = tokens[tokens.length - 1];
          parent[attr] = patches[key];
      }
    }
  }
  return obj;
}
module.exports = { update };

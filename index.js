const ArrayFilter = /^\$\[(.*)\]$/;
const ArrayIndex = /^[0-9]*$/;

function getProp({ obj, path, arrayFilters, level = 0, createOnNone = false }) {
  let tokens = path.split('.');
  let parent = obj;
  while (tokens.length > level) {
    let propName = tokens.splice(0, 1)[0];
    let m = propName.match(ArrayFilter)
    if (m) {
      let filter = arrayFilters.find(f => Object.keys(f)[0].startsWith(m[1] + '.'));
      if (!filter) {
        return null
      }
      let key = Object.keys(filter)[0];
      let filterKey = key.substring(m[1].length + 1, key.length);
      let filterValue = Object.values(filter)[0];
      parent = parent.find(i => getProp({ obj: i, path: filterKey }) === filterValue);
    } else if (propName.match(ArrayIndex)) {
      parent = parent[parseInt(propName)];
    } else {
      if (!(propName in parent)) {
        if (createOnNone !== false) {
          parent[propName] = createOnNone;
          parent = parent[propName]
        }
      } else {
        parent = parent[propName];
      }
    }
  }
  return parent;

}
function objectMatch(obj, filter) {
  if (typeof(filter) !== 'object') {
    return false
  }
  return Object.entries(filter).every(([key, value]) => {
    if (typeof(value) !== 'object') {
      return obj[key] === value
    } else if (key === '$in') {
      return value.includes(obj)
    } else {
      return objectMatch(obj[key], value)
    }
  })
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
          parent = getProp({
            obj,
            path: key,
            arrayFilters: options.arrayFilters,
            level: 1
          })
          attr = tokens[tokens.length - 1];
          delete parent[attr];
          break;
        case '$pull':
          parent = getProp({
            obj,
            path: key,
            arrayFilters: options.arrayFilters
          })
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
          parent = getProp({
            obj,
            path: key,
            arrayFilters: options.arrayFilters,
            createOnNone: []
          })
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
          parent = getProp({
            obj,
            path: key,
            arrayFilters: options.arrayFilters,
            level: 1,
            createOnNone: {}
          })
          attr = tokens[tokens.length - 1];
          parent[attr] = patches[key];
      }
    }
  }
  return obj;
}
module.exports = { update };

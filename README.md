MongObj
=======

MongObj is a Mongo-style api to update javascript object.

# Example
```js
import mongobj from 'mongobj'
let person = {
    "addresses": [
    {
        "country": "China",
        "city": "Shanghai",
        "street": [{
            "road": "Century Avenue",
            "room": "#201",
        }, {
            "road": "People Rd",
            "room": "#101"
        }]
    },
    {
        "country": "USA",
        "city": "Palo Alto"
    }
    ]
}
mongobj.update(person, {
    "$set": {
        "addresses.$[i].city": "Beijing"
    }
}, {
    "arrayFilters": [{"i.country": "China"}]
})

mongobj.update(person, {
    "$pull": {
        "addresses.$[i].street": { "road": "Century Avenue" }
    }
}, {
    "arrayFilters": [{"i.country": "China"}]
})

mongobj.update(person, {
    "$push": {
        "addresses": {
            "country": "France",
            "city": "Pairs"
        }
    }
})
mongobj.update(person, {
    "$unset": {
        "addresses.$[i].street": ""
    }
}, {
    "arrayFilters": [{"i.country": "China"}]
})
console.log(person)
```

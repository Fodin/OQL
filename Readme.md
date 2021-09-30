# Object Query Library

### What is it
OQL is small library without dependencies that applies specified changes to nested object like Redux store and returns new object keeps source object unchanged.

### Main concepts
OQL recieves two params: Single query or array of queries as first parameter and source object which will be used for new object as second one.

```javascript
result = oql(["set first", { second: 1}], { first: 0});
```

`result` will be `{first: { second: 1}}`

or

```javascript
result = oql(
  [
    ["set first", { second: 1}],
    ["set first.second", 2]
  ],
  { first: 0});
```

`result` will be `{first: { second: 2}}`

#### Query
Queries are used for describing what OQL have to do with source object.

Query consists of 2 parts: **command** and **data** and pass to OQL as array `[command, data]`.

The **command** string consists of **method** and **path** with space delimiter `"set first.second.id=1`

The **method** defines how the data changes will be applied to the source object.

The **path** is used to specify the point in the object where the changes will be applied.

#### Path examples
`"first"` choose property `first` in object `{ first: 1}`

`"first.second.third"` choose property `third` in object `{ first: { second: { third: 3}}}`

`"0"` choose first element of array or property `0` in object

`"-1"` choose last (first from the end) element of array

`"id=1"` choose element with property `id` equals `1` in array of objects `[{ id: 1}, { id: 2}]`

These approaches of choosing properties and elements can be combined to access any point in object.

#### Method

**Set** - replace data in the point chosen by `path` with new data.

**Add** - merge data in the point chosen by `path` with new data.

### Install
```bash
npm install -S oql-lib
```

### Usage
```javascript
import { oql } from 'oql-lib';
```

#### Set property of object

```javascript
result = oql(["set first.second", 2], { first: { second: 0}})
```

`result` will be `{ first: { second: 2}}`

### History of changes

v1.1.0 - implemented **set** method

v1.2.0 - implemented **add** method

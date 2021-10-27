type Query = [string, any];

export function oql(query: Query[] | Query, target: {}): {} {
  // Wrap single query to array
  let preparedQuery: Query[] = query;
  if (query.length === 2 && typeof query[0] === 'string') {
    preparedQuery = [preparedQuery as Query];
  }

  if (!isObject(target) && !isArray(target)) {
    throw Error('Target must be object or array');
  }

  let result = { ...target };

  preparedQuery.forEach((query) => {
    processQuery(query, result);
  });

  return result;
}

function processQuery(query: Query, target: {}): void {
  const [command, data] = query;
  const [method, path] = command.split(' ');

  let propsNames = path.split('.');
  let currentObject: { [index: string]: any } = target; // currentObject is always copy of source

  propsNames.forEach((prop, index) => {
    let realProp = prop;
    if (prop.includes('=')) {
      // Property is search expression
      if (isArray(currentObject)) {
        const [id, value] = prop.split('=');
        const foundIndex = currentObject.findIndex(
          (el: { id: string }) => isObject(el) && id in el && el.id === value,
        );
        if (~foundIndex) {
          realProp = foundIndex;
        } else {
          throw Error(`Prop or value ${prop} hasn't been found`);
        }
      } else {
        throw Error(`Trying to search '${path.split(prop)[0] + prop}' not in array!`);
      }
    } else {
      if (isArray(currentObject) && parseInt(prop) < 0) {
        // Negative index of array
        realProp = currentObject.length + parseInt(prop);
      }
    }

    const isLastProperty = index === propsNames.length - 1;
    if (isLastProperty) {
      switch (method) {
        case 'set':
          currentObject[realProp] = data;
          break;
        case 'add':
          addDelta(currentObject, realProp, data);
          break;
        case 'del':
          deleteElement(currentObject, realProp);
          break;
        default:
          throw Error('Invalid method. Method must be "set", "add" or "del"');
      }
    } else {
      currentObject = setDelta(currentObject, realProp);
    }
  });
}

function setDelta(target: { [index: string]: any }, index: string): any {
  target[index] = isObject(target[index]) ? { ...target[index] } : [...target[index]];
  return target[index];
}

function addDelta(target: { [index: string]: any }, index: string, data: any): any {
  if (isObject(target[index])) {
    if (isObject(data)) {
      target[index] = { ...target[index], ...data };
    } else {
      throw Error('You cannot merge array or primitive to object');
    }
  } else if (isArray(target[index])) {
    target[index] = [...target[index]].concat(data);
  } else {
    target[index] = data;
  }
}

function deleteElement(target: { [index: string]: any }, index: string): void {
  if (Array.isArray(target)) {
    target.splice(parseInt(index), 1);
  } else {
    delete target[index];
  }
}

function isObject(something: any): boolean {
  return Object.prototype.toString.call(something) === '[object Object]';
}

function isArray(something: any): boolean {
  return Array.isArray(something);
}

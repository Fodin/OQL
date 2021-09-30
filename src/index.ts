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

  if (!['set', 'add'].includes(method)) {
    throw Error('Invalid method. Method must be "set" or "add"');
  }

  let propsNames = path.split('.');
  let currentObject: { [index: string]: any } = target; // currentObject is always copy of source

  propsNames.forEach((prop, index) => {
    if (index === propsNames.length - 1) {
      // If the prop is last in path
      if (prop.includes('=')) {
        // Property is search expression
        if (isArray(currentObject)) {
          const [id, value] = prop.split('=');
          const foundIndex = currentObject.findIndex(
            (el: { id: string }) => isObject(el) && id in el && el.id === value,
          );
          if (~foundIndex) {
            if (method === 'set') {
              currentObject[foundIndex] = data;
            } else {
              addDelta(currentObject, foundIndex, data);
            }
          } else {
            throw Error(`Prop or value ${prop} hasn't been found`);
          }
        } else {
          throw Error('Current prop is not array!'); // TODO: Print which prop is bad
        }
      } else {
        if (isArray(currentObject) && parseInt(prop) < 0) {
          // Negative index of array
          if (method === 'set') {
            currentObject[currentObject.length + parseInt(prop)] = data;
          } else {
            addDelta(currentObject, currentObject.length + parseInt(prop), data);
          }
        } else {
          // Ordinary object
          if (method === 'set') {
            currentObject[prop] = data;
          } else {
            addDelta(currentObject, prop, data);
          }
        }
      }
    } else {
      if (prop.includes('=')) {
        // Property is search expression
        if (isArray(currentObject)) {
          const [id, value] = prop.split('=');
          const foundIndex = currentObject.findIndex(
            (el: { id: string }) => isObject(el) && id in el && el.id === value,
          );
          if (~foundIndex) {
            currentObject = setDelta(currentObject, foundIndex);
          } else {
            throw Error(`Prop or value ${prop} hasn't been found`);
          }
        } else {
          throw Error('Current prop is not array!'); // TODO: Print which prop is bad
        }
      } else {
        if (isArray(currentObject) && parseInt(prop) < 0) {
          // Negative index of array
          currentObject = setDelta(currentObject, currentObject.length + parseInt(prop));
        } else {
          currentObject = setDelta(currentObject, prop);
        }
      }
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

function isObject(something: any): boolean {
  return Object.prototype.toString.call(something) === '[object Object]';
}

function isArray(something: any): boolean {
  return Array.isArray(something);
}

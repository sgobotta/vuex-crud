
const [
  FETCH_LIST,
  FETCH_SINGLE,
  CREATE,
  UPDATE,
  REPLACE,
  DESTROY
] = ['FETCH_LIST', 'FETCH_SINGLE', 'CREATE', 'UPDATE', 'REPLACE', 'DESTROY'];

const isUsingCustomUrlGetter = typeof rootUrl === 'function';

const urlGetter = ({
  customUrl,
  customUrlFnArgs,
  id,
  type,
  rootUrl
}) => {
  if (typeof customUrl === 'string') {
    return customUrl;
  } else if (isUsingCustomUrlGetter) {
    const argsArray = Array.isArray(customUrlFnArgs) ? customUrlFnArgs : [customUrlFnArgs];
    const args = [id || null, type || null].concat(argsArray);
    return rootUrl(...args);
  }

  return id ? `${rootUrl}/${id}` : rootUrl;
};

function getIdKey({ resource, options }) {
  return (options[resource] && options[resource].id) || options.id || 'id';
}

export default (client, options = {}) => {
  // const usePatch = !!options.usePatch;
  const mapRequest = (type, resource, params) => {
    // const idKey = getIdKey({ resource, options });

    // const service = client.service(resource);
    // const query = {};

    const url = urlGetter({
      customUrl: params.customUrl,
      customUrlFnArgs: params.customUrlFnArgs,
      type,
      rootUrl: options.rootUrl
    });

    switch (type) {
      // case GET_MANY:
      //   const ids = params.ids || [];
      //   query[idKey] = { $in: ids };
      //   query.$limit = ids.length;
      //   return service.find({ query });
      // case GET_MANY_REFERENCE:
      //   if (params.target && params.id) {
      //     query[params.target] = params.id;
      //   }
      case FETCH_LIST:
      // parseList is not being used at the moment - sgobotta
        return client.get(url);
      // case FETCH_LIST:
      //   const { page, perPage } = params.pagination || {};
      //   const { field, order } = params.sort || {};
      //   if (perPage && page) {
      //     query.$limit = perPage;
      //     query.$skip = perPage * (page - 1);
      //   }
      //   if (order) {
      //     query.$sort = {
      //       [field === 'id' ? idKey : field]: order === 'DESC' ? -1 : 1,
      //     };
      //   }
      //   Object.assign(query, fetchUtils.flattenObject(params.filter));
      //   return service.find({ query });
      // case FETCH_SINGLE:
      //   return service.get(params.id);
      // case UPDATE:
      //   if (usePatch) {
      //     const data = params.previousData // use diff
      //     return service.patch(params.id, data);
      //   }
      //   return service.update(params.id, params.data);
      // case UPDATE_MANY:
      //   if (usePatch) {
      //     const data = params.previousData // use diff
      //     return Promise.all(params.ids.map(id => (service.patch(id, data))));
      //   }
      //   return Promise.all(params.ids.map(id => (service.update(id, params.data))));
      // case CREATE:
      //   return service.create(params.data);
      // case DESTROY:
      //   return service.remove(params.id);
      // case DELETE_MANY:
      //   return Promise.all(params.ids.map(id => (service.remove(id))));
      default:
        return Promise.reject(`Unsupported FeathersJS restClient action type ${type}`);
    }
  };

  const mapResponse = (response, type, resource, params) => {
    const idKey = getIdKey({ resource, options });
    switch (type) {
      case FETCH_SINGLE:
      case UPDATE:
      case DESTROY:
        return { data: { ...response, id: response[idKey] } };
      // case UPDATE_MANY:
      // case DELETE_MANY:
        // return { data: response.map(record => record[idKey]) };
      case CREATE:
        return { data: { ...params.data, ...response, id: response[idKey] } };
      // case GET_MANY_REFERENCE: // fix GET_MANY_REFERENCE missing id
      // case GET_MANY: // fix GET_MANY missing id
      //   case GET_LIST:
      //     response.data = response.data.map((_item) => {
      //       const item = _item;
      //       if (idKey !== 'id') {
      //         item.id = _item[idKey];
      //       }
      //       return _item;
      //     });
      //     return response;
      default:
        return response;
    }
  };

  return (type, resource, params) =>
    mapRequest(type, resource, params)
      .then(response => mapResponse(response, type, resource, params));
};

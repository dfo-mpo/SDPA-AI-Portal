/**
 * Get a single query parameter from the current URL.
 * @param {string} key - The name of the parameter.
 * @returns {string|null}
 */
export const getParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

/**
 * Get all query parameters as an object.
 * @returns {Object}
 */
export const getAllParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
};

/**
 * Updates the browser's URL search parameters without reloading the page.
 *
 * @param {Object} newParams - An object containing key-value pairs to set as URL parameters.
 *                             Only keys with non-empty string, non-null, and non-undefined values will be included.
 *                             Existing parameters are replaced entirely with the new set.
 *
 * @returns {void}
 */
export const updateURLParams = (newParams = {}) => {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams();

  // Only add defined values
  Object.entries(newParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  url.search = searchParams.toString();
  window.history.pushState({}, '', url.toString());
};

export const isURL = str => {
  return /(?:^\w+:|^)\/\/(?:[^\s\.]+\.\S{2}|localhost[\:?\d]*)/.test(str);
};

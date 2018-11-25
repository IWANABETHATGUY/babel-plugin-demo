let a = {
  name: 'ajck',
  test: 'bob',
  info: {
    age: 32,
    salary: 3333
  }
};
let res = safeGet(a, ["age", "info"]);
console.log(res);

function safeGet(obj, path) {
  try {
    return path.reduce((acc, cur) => acc[cur], obj);
  } catch (e) {
    return undefined;
  }
}

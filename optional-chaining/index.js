const { declare } = require('@babel/helper-plugin-utils');
const syntaxOptionalChaining = require('@babel/plugin-syntax-optional-chaining')
  .default;
const { types: t, parseSync } = require('@babel/core');

function getIdPath(node, idList) {
  let obj = node.object;
  let property = node.property;
  idList.unshift(property.name);
  if (
    obj.type === 'OptionalMemberExpression' ||
    obj.type === 'MemberExpression'
  ) {
    getIdPath(obj, idList);
  } else {
    idList.unshift(obj.name);
  }
}
let flag = false;
module.exports = declare((api, options) => {
  api.assertVersion(7);
  return {
    name: 'ast-transform',
    // not required
    inherits: syntaxOptionalChaining,
    visitor: {
      OptionalMemberExpression(path) {
        if (path.container.type !== 'OptionalMemberExpression') {
          let node = path.node;
          let idList = [];
          getIdPath(node, idList);
          path.replaceWith(
            t.CallExpression(t.Identifier('safeGet'), [
              t.Identifier(idList[0]),
              t.ArrayExpression(
                idList.slice(1).map(item => t.StringLiteral(item)),
              ),
            ]),
          );
          if (!flag) {
            flag = true;
            let program = path.findParent(p => p.isProgram());
            let ast = parseSync(`function safeGet(obj, path) {
  try {
    return path.reduce((acc, cur) => acc[cur], obj);
  } catch (e) {
    return undefined;
  }
}`);
            program.node.body.push(ast.program.body[0]);
          }
        }
      },
    },
  };
});

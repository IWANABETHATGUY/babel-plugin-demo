let index = 1;
let varMap = new Map();
export default function(babel) {
  const { types: t } = babel;

  return {
    name: 'ast-transform', // not required
    visitor: {
      Identifier(path) {
        let toVar = varMap.get(path.node.name);
        if (toVar) {
          path.node.name = toVar;
        }
      },
      VariableDeclarator(path) {
        let node = path.node;
        let toVarRes = getToVar(index);
        console.log(toVarRes);
        varMap.set(node.id.name, toVarRes);
        path.node.id = t.identifier(toVarRes);
        index++;
      },
      MemberExpression(path) {
        let isVariable = looksLike(path, {
          parent: p => p === null || p.type !== 'Memberexpression',
        });
        if (isVariable) {
          let name = path.node.object.name;
          let toVar = varMap.get(name);
          if (toVar) {
            path.node.object = t.identifier(toVar);
          }
        }
      },
    },
  };
}
function getToVar(num) {
  let list = [...'abcdefghijklmnopqrstuvwxyz'];
  let res = [];
  while (num > 0) {
    let mod = num % 26;

    num = Math.floor(num / 26);
    if (mod === 0) {
      mod = 26;
      num--;
    }
    res.unshift(list[mod - 1]);
  }
  return res.join('');
}
function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey];
      const aVal = a[bKey];
      if (typeof bVal === 'function') {
        return bVal(aVal);
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
    })
  );
}

function isPrimitive(val) {
  return val == null || /^[sbn]/.test(typeof val);
}

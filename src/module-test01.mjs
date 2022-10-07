import MyPerson, { a, f } from './Person.mjs';//要在最前面

const p2 = new MyPerson('Flora', 26);

console.log(p2.toString());
console.log({ a });
console.log(f(7));

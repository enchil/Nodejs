class Person {
    gender = 'female';
    constructor(name = 'vicky', age = 20) {
        this.name = name;
        this.age = age;
    }
    toJSON() {
        const { name, age, gender } = this;
        return { name, age, gender };
    }
    toString() {
        return JSON.stringify(this);
    }
}

//const p1 = new Person('wayne', '30');

//console.log(p1 + '');

const a = 10;
const f = n => n * n;

module.exports = {
Person, a, f
};

function myInstanceof(leftValue, rightValue) {
  if(typeof leftValue !== 'object' || leftValue === null) {
    return false
  }
  const prototype = rightValue.prototype
  let proto = leftValue.__proto
  while(proto === null) {
    if(proto === prototype) {
      return true
    } else {
      proto = proto.__proto__
    }
  }
  return false
}

function Student(name) {
  if(typeof Student.learn !== 'function') {
    Student.prototype = {
      learn() {
        console.log(this.name,' learn a leason')
      }
    }
  }
  this.name = name
}
const stu1 = new Student('xiaolong')
const stu2 = new Student('xiaolong02')
// stu1.learn()
stu2.learn()

function getType(param) {
  let type = Object.prototype.toString.call(param).slice(8, -1)
  if(type === 'Object' && param.constructor && param.constructor.name) {
    type = param.constructor.name
  }
  console.log(type)
  return type
}
// getType(1)
// getType(null)
// getType({fe: 23})
// getType({constructor:12})
// getType(stu1)
// getType(stu2)

function myNew(fn) {
  if(typeof fn !== 'function') {
    throw new TypeError('myNew: the first param must be a function')
  }
  myNew.target = fn
  const obj = Object.create(fn.prototype)
  const result = fn.apply(obj, Array.prototype.slice.call(arguments, 1))
  if((typeof result !== 'object' && typeof result !== 'function') || result === null) {
    return obj
  }
  return result
}



function* dem() {
  console.log('Hello' + (yield)); // OK
  console.log(111)
  console.log('Hello' + (yield 123)); // OK
  console.log(123)
  console.log(234)
}
const demo = dem()
// console.log(demo.next())
// console.log(demo.next())

async function awaitTest() {
  try{
    console.log('f234')
    const obj = await wewwe
    console.log('23432')
    await fesff
    await fesf 
  } catch(err) {
    console.log('error: ', err)
  }
}
// awaitTest().then(console.log('success'))

// Promise.resolve(2).then(() => {return 5}, () => {}).then(data => console.log(data))
// Promise.resolve(2).finally(() => {return 5}).then(data => console.log(data))

async function asyText() {
  await Promise.reject('err')
  console.log('fes')
}
asyText().then(data => console.log(data)).catch(data => console.log('err: ', data))

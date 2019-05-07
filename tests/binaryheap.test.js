const {BinaryHeap} = require("./../bin/lowlight.astar.js").Astar

test("Empty heap", () => {
  let heap = new BinaryHeap()
  expect(heap.size).toBe(0)
})

test("Add nodes", () => {
  let heap = new BinaryHeap(({value}) => value)
  heap.add({value:6})
  expect(heap.top().value).toBe(6)
  expect(heap.size).toBe(1)
  heap.add({value:12})
  expect(heap.top().value).toBe(6)
  expect(heap.size).toBe(2)
  heap.add({value:10}, {value:14})
  expect(heap.top().value).toBe(6)
  expect(heap.size).toBe(4)
  heap.add({value:2})
  expect(heap.top().value).toBe(2)
  expect(heap.size).toBe(5)
})

test("Delete nodes", () => {
  let heap = new BinaryHeap(({value}) => value), a, b, c, d, e
  heap.add(a = {value:6}, b = {value:12}, c = {value:10}, d = {value:14}, e = {value:2})
  expect(heap.top().value).toBe(2)
  expect(heap.size).toBe(5)
  heap.delete(e)
  expect(heap.top().value).toBe(6)
  expect(heap.size).toBe(4)
  heap.delete(a, b)
  heap.delete(a, b)
  expect(heap.top().value).toBe(10)
  expect(heap.size).toBe(2)
  heap.delete(c)
  expect(heap.top().value).toBe(14)
  expect(heap.size).toBe(1)
  heap.delete(d)
  expect(heap.size).toBe(0)

})

test("Set nodes", () => {
  let heap = new BinaryHeap(({value}) => value), a, b, c, d, e, f
  heap.add(a = {value:6}, b = {value:12}, c = {value:10}, d = {value:14}, e = {value:2})
  expect(heap.top().value).toBe(2)
  expect(heap.size).toBe(5)
  f = {value:1}
  heap.update(f)
  expect(heap.top().value).toBe(1)
  expect(heap.size).toBe(6)
  f.value = 3
  heap.update(f)
  expect(heap.top().value).toBe(2)
  expect(heap.size).toBe(6)
})

test("Pop nodes", () => {
  let heap = new BinaryHeap(({value}) => value)
  heap.add({value:6}, {value:12}, {value:10}, {value:14}, {value:2})
  expect(heap.pop().value).toBe(2)
  expect(heap.top().value).toBe(6)
  expect(heap.size).toBe(4)
  expect(heap.pop().value).toBe(6)
  expect(heap.top().value).toBe(10)
  expect(heap.size).toBe(3)
  expect(heap.pop().value).toBe(10)
  expect(heap.top().value).toBe(12)
  expect(heap.size).toBe(2)
  expect(heap.pop().value).toBe(12)
  expect(heap.top().value).toBe(14)
  expect(heap.size).toBe(1)
  expect(heap.pop().value).toBe(14)
  expect(heap.size).toBe(0)
})
const {Heuristics} = require("./../bin/lowlight.astar.js").Astar

test("Manhattan", () => {
  expect(Heuristics.manhattan({data:{x:5, y:5}}, {data:{x:7, y:9}})).toBe(6)
  expect(Heuristics.manhattan({data:{x:5, y:5}}, {data:{x:7, y:9}}, {torus:true, X:10, Y:10})).toBe(6)
  expect(Heuristics.manhattan({data:{x:1, y:9}}, {data:{x:9, y:9}}, {torus:true, X:10, Y:10})).toBe(2)
})

test("Diagonal", () => {
  expect(Heuristics.diagonal({data:{x:5, y:5}}, {data:{x:7, y:9}})).toBe(6 - 0.6 * 2)
  expect(Heuristics.diagonal({data:{x:5, y:5}}, {data:{x:7, y:9}}, {torus:true, X:10, Y:10})).toBe(6 - 0.6 * 2)
  expect(Heuristics.diagonal({data:{x:1, y:9}}, {data:{x:9, y:9}}, {torus:true, X:10, Y:10})).toBe(2 - 0.6 * 0)
})

test("Euclidian", () => {
  expect(Heuristics.euclidian({data:{x:5, y:5}}, {data:{x:7, y:9}})).toBe(Math.sqrt(20))
  expect(Heuristics.euclidian({data:{x:5, y:5}}, {data:{x:7, y:9}}, {torus:true, X:10, Y:10})).toBe(Math.sqrt(20))
  expect(Heuristics.euclidian({data:{x:1, y:9}}, {data:{x:9, y:9}}, {torus:true, X:10, Y:10})).toBe(Math.sqrt(4))
})

const {Graph} = require("./../bin/lowlight.astar.js").Astar

test("Create graph (no diagonals)", () => {
  let graph
  let map = [
    [0, 1, 0],
    [0, 2, 1],
    [0, 0, 0]
  ]

  graph = Graph.fromArray(map, {
    order:"yx",
    cost(a, b) { return a.data.v <= b.data.v ? 1 : NaN },
    torus:false,
    diagonals:false,
    cutting:false
  })

  expect(graph.get(2, 1).data.x).toBe(2)
  expect(graph.get(2, 1).data.y).toBe(1)

  expect(graph.get(0, 0).neighbors(graph).length).toBe(2)
  expect(graph.get(1, 0).neighbors(graph).length).toBe(1)
  expect(graph.get(2, 0).neighbors(graph).length).toBe(2)
  expect(graph.get(0, 1).neighbors(graph).length).toBe(3)
  expect(graph.get(1, 1).neighbors(graph).length).toBe(0)
  expect(graph.get(2, 1).neighbors(graph).length).toBe(1)
  expect(graph.get(0, 2).neighbors(graph).length).toBe(2)
  expect(graph.get(1, 2).neighbors(graph).length).toBe(3)
  expect(graph.get(2, 2).neighbors(graph).length).toBe(2)
})

test("Create graph (diagonals)", () => {
  let graph
  let map = [
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 2]
  ]

  let graphs = Graph.fromArray(map, {
    order:"yx",
    cost(a, b) { return a.data.v <= b.data.v ? 1 : NaN },
    torus:false,
    diagonals:true,
    layers:[
      {cutting:false},
      {cutting:true},
    ]
  })

  graph = graphs.shift()
  expect(graph.get(0, 0).neighbors(graph).length).toBe(3)
  expect(graph.get(1, 0).neighbors(graph).length).toBe(0)
  expect(graph.get(2, 0).neighbors(graph).length).toBe(3)
  expect(graph.get(0, 1).neighbors(graph).length).toBe(5)
  expect(graph.get(1, 1).neighbors(graph).length).toBe(8)
  expect(graph.get(2, 1).neighbors(graph).length).toBe(1)
  expect(graph.get(0, 2).neighbors(graph).length).toBe(3)
  expect(graph.get(1, 2).neighbors(graph).length).toBe(5)
  expect(graph.get(2, 2).neighbors(graph).length).toBe(0)

  graph = graphs.shift()
  expect(graph.get(0, 0).neighbors(graph).length).toBe(3)
  expect(graph.get(1, 0).neighbors(graph).length).toBe(1)
  expect(graph.get(2, 0).neighbors(graph).length).toBe(3)
  expect(graph.get(0, 1).neighbors(graph).length).toBe(5)
  expect(graph.get(1, 1).neighbors(graph).length).toBe(8)
  expect(graph.get(2, 1).neighbors(graph).length).toBe(2)
  expect(graph.get(0, 2).neighbors(graph).length).toBe(3)
  expect(graph.get(1, 2).neighbors(graph).length).toBe(5)
  expect(graph.get(2, 2).neighbors(graph).length).toBe(0)
})

test("Create graph (diagonals strict)", () => {
  let graph
  let map = [
    [0, 1, 0],
    [0, 1, 1],
    [1, 1, 1]
  ]

  graph = Graph.fromArray(map, {
    order:"yx",
    cost(a, b) { return a.data.v === b.data.v ? 1 : NaN },
    torus:false,
    diagonals:true,
    cutting:null
  })

  expect(graph.get(0, 0).neighbors(graph).length).toBe(1)
  expect(graph.get(1, 0).neighbors(graph).length).toBe(1)
  expect(graph.get(2, 0).neighbors(graph).length).toBe(0)
  expect(graph.get(0, 1).neighbors(graph).length).toBe(1)
  expect(graph.get(1, 1).neighbors(graph).length).toBe(4)
  expect(graph.get(2, 1).neighbors(graph).length).toBe(3)
  expect(graph.get(0, 2).neighbors(graph).length).toBe(1)
  expect(graph.get(1, 2).neighbors(graph).length).toBe(4)
  expect(graph.get(2, 2).neighbors(graph).length).toBe(3)
})

test("Create graph (torus, no diagonals)", () => {
  let graph
  let map = [
    [0, 1, 0],
    [0, 2, 1],
    [0, 0, 0]
  ]

  graph = Graph.fromArray(map, {
    order:"yx",
    cost(a, b) { return a.data.v <= b.data.v ? 1 : NaN },
    torus:true,
    diagonals:false,
    cutting:false
  })

  expect(graph.get(2, 1).data.x).toBe(2)
  expect(graph.get(2, 1).data.y).toBe(1)

  expect(graph.get(0, 0).neighbors(graph).length).toBe(4)
  expect(graph.get(1, 0).neighbors(graph).length).toBe(1)
  expect(graph.get(2, 0).neighbors(graph).length).toBe(4)
  expect(graph.get(0, 1).neighbors(graph).length).toBe(4)
  expect(graph.get(1, 1).neighbors(graph).length).toBe(0)
  expect(graph.get(2, 1).neighbors(graph).length).toBe(1)
  expect(graph.get(0, 2).neighbors(graph).length).toBe(4)
  expect(graph.get(1, 2).neighbors(graph).length).toBe(4)
  expect(graph.get(2, 2).neighbors(graph).length).toBe(4)
})

test("Create graph (torus, diagonals)", () => {
  let graph
  let map = [
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 2]
  ]

  let graphs = Graph.fromArray(map, {
    order:"yx",
    cost(a, b) { return a.data.v <= b.data.v ? 1 : NaN },
    torus:true,
    diagonals:true,
    layers:[
      {cutting:false},
      {cutting:true},
    ]
  })

  graph = graphs.shift()
  expect(graph.get(0, 0).neighbors(graph).length).toBe(8)
  expect(graph.get(1, 0).neighbors(graph).length).toBe(0)
  expect(graph.get(2, 0).neighbors(graph).length).toBe(8)
  expect(graph.get(0, 1).neighbors(graph).length).toBe(8)
  expect(graph.get(1, 1).neighbors(graph).length).toBe(8)
  expect(graph.get(2, 1).neighbors(graph).length).toBe(1)
  expect(graph.get(0, 2).neighbors(graph).length).toBe(8)
  expect(graph.get(1, 2).neighbors(graph).length).toBe(8)
  expect(graph.get(2, 2).neighbors(graph).length).toBe(0)

  graph = graphs.shift()
  expect(graph.get(0, 0).neighbors(graph).length).toBe(8)
  expect(graph.get(1, 0).neighbors(graph).length).toBe(2)
  expect(graph.get(2, 0).neighbors(graph).length).toBe(8)
  expect(graph.get(0, 1).neighbors(graph).length).toBe(8)
  expect(graph.get(1, 1).neighbors(graph).length).toBe(8)
  expect(graph.get(2, 1).neighbors(graph).length).toBe(2)
  expect(graph.get(0, 2).neighbors(graph).length).toBe(8)
  expect(graph.get(1, 2).neighbors(graph).length).toBe(8)
  expect(graph.get(2, 2).neighbors(graph).length).toBe(0)
})
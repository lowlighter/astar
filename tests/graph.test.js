const {Graph, Vertex} = require("./../bin/lowlight.astar.js").Astar

test("Vertex", () => {
  const data = {hello:"world"}
  const vertex = new Vertex(12, data)
  expect(vertex.id).toBe(12)
  expect(vertex.data.hello).toBe("world")
  data.hello = "universe"
  expect(vertex.data.hello).toBe("universe")
})

test("Vertex (inherit id)", () => {
  const data = {hello:"world", id:12}
  const vertex = new Vertex(data)
  expect(vertex.id).toBe(12)
  expect(vertex.data.hello).toBe("world")
  data.hello = "universe"
  expect(vertex.data.hello).toBe("universe")
})

test("Graph add vertices", () => {
  const graph = new Graph(new Vertex(1), new Vertex(2), new Vertex(3))
  expect(graph.size).toBe(3)
  graph.add(new Vertex(1))
  expect(graph.size).toBe(3)
})

test("Graph get vertices", () => {
  const graph = new Graph(new Vertex(1), new Vertex(2, {hello:"world"}), new Vertex(3))
  expect(graph.size).toBe(3)
  expect(graph.get(2).data.hello).toBe("world")
  expect(graph.get(5)).toBe(null)
})

test("Graph edge/cost vertices", () => {
  let a, b, c, d, e
  const graph = new Graph(a = new Vertex(1), b = new Vertex(2), c = new Vertex(3), d = new Vertex(4), e = new Vertex(5))
  expect(graph.size).toBe(5)
  graph.edge(a, b, {ab:1, ba:1})
  graph.edge(a, c, {ab:2, ba:3})
  graph.edge(a, d, {ab:4, ba:NaN})
  expect(graph.cost(a, b)).toBe(1)
  expect(graph.cost(b, a)).toBe(1)
  expect(graph.cost(a, c)).toBe(2)
  expect(graph.cost(c, a)).toBe(3)
  expect(graph.cost(a, d)).toBe(4)
  expect(graph.cost(d, a)).toBe(NaN)
  expect(graph.cost(a, e)).toBe(NaN)
  expect(graph.cost(e, a)).toBe(NaN)
})

test("Graph edge/adjacent vertices", () => {
  let a, b, c, d, e
  const graph = new Graph(a = new Vertex(1), b = new Vertex(2), c = new Vertex(3), d = new Vertex(4), e = new Vertex(5))
  expect(graph.size).toBe(5)
  graph.edge(a, b, {ab:1, ba:1})
  graph.edge(b, c, {ab:1, ba:1})
  graph.edge(c, d, {ab:1, ba:NaN})
  expect(graph.adjacent(a, b)).toBe(true)
  expect(graph.adjacent(a, c)).toBe(false)
  expect(graph.adjacent(a, d)).toBe(false)
  expect(graph.adjacent(a, e)).toBe(false)
  expect(graph.adjacent(b, a)).toBe(true)
  expect(graph.adjacent(b, c)).toBe(true)
  expect(graph.adjacent(b, d)).toBe(false)
  expect(graph.adjacent(b, e)).toBe(false)
  expect(graph.adjacent(c, a)).toBe(false)
  expect(graph.adjacent(c, b)).toBe(true)
  expect(graph.adjacent(c, d)).toBe(true)
  expect(graph.adjacent(c, e)).toBe(false)
  expect(graph.adjacent(d, a)).toBe(false)
  expect(graph.adjacent(d, b)).toBe(false)
  expect(graph.adjacent(d, c)).toBe(false)
  expect(graph.adjacent(d, e)).toBe(false)
  expect(graph.adjacent(e, a)).toBe(false)
  expect(graph.adjacent(e, b)).toBe(false)
  expect(graph.adjacent(e, c)).toBe(false)
  expect(graph.adjacent(e, d)).toBe(false)
})

test("Graph edge/connected vertices", () => {
  let a, b, c, d, e
  const graph = new Graph(a = new Vertex(1), b = new Vertex(2), c = new Vertex(3), d = new Vertex(4), e = new Vertex(5))
  expect(graph.size).toBe(5)
  graph.edge(a, b, {ab:1, ba:1})
  graph.edge(b, c, {ab:1, ba:1})
  graph.edge(c, d, {ab:1, ba:NaN})
  graph.connect()
  expect(graph.connected(a, b, true)).toBe(true)
  expect(graph.connected(a, c, true)).toBe(true)
  expect(graph.connected(a, d, true)).toBe(true)
  expect(graph.connected(a, e, true)).toBe(false)
  expect(graph.connected(b, a, true)).toBe(true)
  expect(graph.connected(b, c, true)).toBe(true)
  expect(graph.connected(b, d, true)).toBe(true)
  expect(graph.connected(b, e, true)).toBe(false)
  expect(graph.connected(c, a, true)).toBe(true)
  expect(graph.connected(c, b, true)).toBe(true)
  expect(graph.connected(c, d, true)).toBe(true)
  expect(graph.connected(c, e, true)).toBe(false)
  expect(graph.connected(d, a, true)).toBe(false)
  expect(graph.connected(d, b, true)).toBe(false)
  expect(graph.connected(d, c, true)).toBe(false)
  expect(graph.connected(d, e, true)).toBe(false)
  expect(graph.connected(e, a, true)).toBe(false)
  expect(graph.connected(e, b, true)).toBe(false)
  expect(graph.connected(e, c, true)).toBe(false)
  expect(graph.connected(e, d, true)).toBe(false)
})

test("Graph delete vertices", () => {
  let a, b, c
  const graph = new Graph(a = new Vertex(1), b = new Vertex(2), c = new Vertex(3))
  expect(graph.size).toBe(3)
  graph.edge(a, b, {ab:1, ba:1})
  graph.edge(b, c, {ab:1, ba:1})
  graph.connect()
  expect(graph.connected(a, b)).toBe(true)
  expect(graph.connected(b, c)).toBe(true)
  expect(graph.connected(a, c)).toBe(true)
  expect(graph.adjacent(a, c)).toBe(false)
  expect(a.neighbors(graph).length).toBe(1)
  expect(b.neighbors(graph).length).toBe(2)
  expect(c.neighbors(graph).length).toBe(1)
  graph.delete(b)
  graph.connect()
  expect(graph.connected(a, c)).toBe(false)
  expect(graph.adjacent(a, c)).toBe(false)
  expect(a.neighbors(graph).length).toBe(0)
  expect(c.neighbors(graph).length).toBe(0)
})

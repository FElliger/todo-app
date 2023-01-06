import { TodoClient } from "../../src/store/todo-client"
import { TodoDataStore } from "../../src/store/todo-data-store"
import { getTodo, getTodoClient } from "../test-object-factory"

describe("TodoDataStore", () => {
  let client: TodoClient
  let dataStore: TodoDataStore

  const username = "santa"

  beforeEach(() => {
    client = getTodoClient()
    dataStore = new TodoDataStore(client)
  })

  it("adds new todos", async () => {
    const todo = await dataStore.add(getTodo("I should do this", username))

    const list = await dataStore.list(username)

    expect(list).toStrictEqual([todo])
  })

  it("adds id to new todos", async () => {
    const todo = await dataStore.add(getTodo("Some new thing to do"))

    expect(todo.todoId).toBeDefined()
  })

  it("lists todos as according to the provided user", async () => {
    const todo1 = await dataStore.add(getTodo("making a list", username))
    const todo2 = await dataStore.add(getTodo("checking it twice", username))
    await dataStore.add(getTodo("mess around", "elfOnShelf"))

    const list = await dataStore.list(username)

    expect(list).toStrictEqual([todo1, todo2])
  })

  it("marks a todo as done", async () => {
    const todo = await dataStore.add(getTodo("find out who's naughty and nice", username))
    const key = { username: todo.username, todoId: `${todo.todoId}` }

    const updated = await dataStore.update(key, { done: true })
    const list = await dataStore.list(username)

    expect(updated.done).toBe(true)
    expect(updated.doneAt).toBeDefined()
    expect(list).toStrictEqual([updated])
  })

  it("marks a todo as undone", async () => {
    const todo = await dataStore.add(getTodo("not sure if have done this or not", username))
    const key = { username: todo.username, todoId: `${todo.todoId}` }
    await dataStore.update(key, { done: true })

    const undone = await dataStore.update(key, { done: false })
    const list = await dataStore.list(username)

    expect(undone.done).toBeFalsy()
    expect(undone.doneAt).not.toBeDefined()
    expect(list).toStrictEqual([undone])
  })
})

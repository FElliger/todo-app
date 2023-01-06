import { TodoClient } from "./todo-client"
import { Todo, TodoKey, TodoUpdate } from "./model"

export class TodoDataStore {
  constructor(private readonly client: TodoClient) {}

  async add(todo: Todo): Promise<Todo> {
    const todoItem = await this.client.create({ ...todo })
    return { ...todoItem }
  }

  async update(key: TodoKey, update: TodoUpdate): Promise<Todo> {
    const updatedTodo = await this.client.update({ ...key }, { ...update })
    return { ...updatedTodo }
  }

  async list(username: string): Promise<Todo[]> {
    const todoItems = await this.client.list(username)
    return todoItems.map((item) => {
      return { ...item } as Todo
    })
  }
}

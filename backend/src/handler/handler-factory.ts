import { getTodoDataStore } from "../store/store-factory"
import { TodoDataStore } from "../store/todo-data-store"
import { TodoHandler } from "./todo-handler"

export function getTodoHandler(todoDataStore: TodoDataStore = getTodoDataStore()): TodoHandler {
  return new TodoHandler(todoDataStore)
}

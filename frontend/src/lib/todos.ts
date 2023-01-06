import { writable } from "svelte/store"

const API_ENDPOINT = "api/todos"

export type Todo = {
  todoId: string
  text: string
  done?: boolean
}

type TodoDoneUpdate = {
  done: boolean
}
export type TodoUpdate = TodoDoneUpdate

export const todos = writable<Todo[]>([
  {
    text: "Loading your todo list...",
    todoId: "0",
  },
])

export async function addTodo(text: string) {
  const response = await fetch(API_ENDPOINT, { method: "POST", body: JSON.stringify({ text }) })
  if (!response.ok) {
    //TODO add some notification somewhere
    return
  }

  const newTodo = await response.json()

  todos.update((currentState) => {
    return [newTodo, ...currentState]
  })
}

export async function updateTodo(todoId: string, update: TodoUpdate) {
  const response = await fetch(`${API_ENDPOINT}/${todoId}`, { method: "PUT", body: JSON.stringify(update) })
  if (!response.ok) {
    //TODO add some notification somewhere
    return
  }

  const updatedTodo = await response.json()

  todos.update((currentState) => {
    const index = currentState.findIndex((todo) => todo.todoId === updatedTodo.todoId)

    return [
      ...currentState.slice(0, index),
      updatedTodo,
      ...(index + 1 < currentState.length ? currentState.slice(index + 1) : []),
    ]
  })
}

async function getTodos() {
  const response = await fetch(API_ENDPOINT)
  if (response.ok) {
    const body = await response.json()
    todos.set(body.todos)
  }
}

getTodos()

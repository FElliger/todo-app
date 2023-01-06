export type TodoKey = {
  username: string
  todoId: string
}

export type Todo = {
  todoId?: string
  username: string
  text: string
  done?: boolean
  doneAt?: number
}

export type TodoUpdate = {
  done: boolean
}

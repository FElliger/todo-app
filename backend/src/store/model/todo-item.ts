export type TodoItemKey = {
  username: string
  todoId: string
}

export type TodoItem = {
  username: string
  todoId?: string
  text: string
  done?: boolean
  doneAt?: number
  timeToLive?: number
}

export type TodoItemUpdate = {
  done?: boolean
}

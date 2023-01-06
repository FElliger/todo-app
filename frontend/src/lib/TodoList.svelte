<script lang="ts">
    import { todos, updateTodo, type Todo } from "./todos"
    import TodoItem from "./TodoItem.svelte"

    let todoItems: Todo[] = []
    let doneItems: Todo[] = []

    todos.subscribe((todos) => {
        todoItems = todos.filter((todo: Todo) => !todo.done)
        doneItems = todos.filter((todo: Todo) => todo.done)
    })

    function todoStatusChanged(event) {
        updateTodo(<string>event.detail.todoId, <Record<string, any>>event.detail.update)
    }
    
</script>

<ul>
    {#each todoItems as todo (todo.todoId)}
        <TodoItem {todo} on:toggleDone={todoStatusChanged}/>
    {/each}
</ul>

{#if doneItems.length > 0}
<h2>You have already done this</h2>
<ul>
    {#each doneItems as todo (todo.todoId)}
        <TodoItem {todo} on:toggleDone={todoStatusChanged}/>
    {/each}
</ul>
{/if}

<style>
    ul {
        display: table
    }
</style>

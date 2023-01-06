<script lang="ts">
  import NewTodo from "./lib/NewTodo.svelte"
  import TodoList from "./lib/TodoList.svelte"
</script>

<main>
  <h1>Your ToDo List</h1>

  <NewTodo/>

  <div class="card">
    <TodoList/>
  </div>

</main>

<style>
</style>

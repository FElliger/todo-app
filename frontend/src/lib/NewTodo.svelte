<script lang="ts">
  import { addTodo } from "./todos"
  let text = ""

  function handleKeyDown(event) {
    if (event.keyCode === 13) {
      handleSubmit()
    }
  }

  function handleSubmit() {
    if (text.trim()) {
      addTodo(text.trim())
      text = ""
    }
  }
</script>

<input bind:value={text} on:keydown={handleKeyDown}/>
<button on:click={handleSubmit}>Add</button>

<style>
    button {
        margin-left: 3em;
    }
</style>


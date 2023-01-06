<script lang="ts">
    import type { Todo } from "./todos"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    export let todo: Todo

    function toggleDone() {
      todo.done = !todo.done

      const eventDetail = {
        todoId: todo.todoId,
        update: {
          done: todo.done
        }
      }

      dispatch("toggleDone", eventDetail)
    }
</script>

<li>
    <span class="left" class:done="{todo.done}">{todo.text}</span>

    <span class="right">
        <button on:click={toggleDone}>
        {#if !todo.done}
            Done
        {:else}
            Undo
        {/if}
        </button>
    </span>
</li>

<style>
    li {
        display: block;
        list-style-type: none;
        padding: 0.5em;
    }

    li:hover {
        background-color: #6495ed;
    }

    span {
        display: inline-block;
    }

    span.left {
        text-align: left;
        width: 300px;
    }

    span.right {
        text-align: right;
    }

    .done {
        text-decoration: line-through;
        color: #777777;
    }

</style>

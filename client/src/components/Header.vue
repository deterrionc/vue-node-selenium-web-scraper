<template>
  <div class="row">
    <div class="col bg-dark">
      <a class="navbar-brand text-white">SPORTS BETTING SCRAPER</a>
      <div style="float:right">
        <button class="btn text-white" v-on:click='LOGOUT'>LOGOUT</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      LOGOUT: { type: Function }
    }
  }
</script>
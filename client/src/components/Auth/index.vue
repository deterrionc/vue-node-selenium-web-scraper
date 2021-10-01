<template>
  <div class="container-fluid">
    <div class="row" style='height: 100vh;'>
      <div class="col-md-8" style="background-color: #3f51b5;">
        <div style="display: flex; margin: auto; padding-top: 20%; align-items: center; width: 90%;">
          <i class="fa fa-futbol-o" style="color: white; font-size: 150px;"></i>
          <div style="display: flex; flex-direction: column; padding-left: 30px;">
            <h1 style="color: white;">Welcome To HERE!</h1>
            <h2 style="color: #999;">Here, You can get the greatest thing within you!</h2>
          </div>
        </div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      goLoginPage() {
        this.$router.push('/login')
      },
      goRegisterPage() {
        this.$router.push('/register')
      }
    }
  }
</script>
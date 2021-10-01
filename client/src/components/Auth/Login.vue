<template>
  <div class="col-md-4" style="display: flex; flex-direction: column; justify-content: center;">
    <label class="form-label">Email</label>
    <div class="form-group">
      <input placeholder="Input" name="email" type="text" class="form-control" v-model='email'>
    </div>
    <label class="form-label">Password</label>
    <div class="form-group">
      <input placeholder="Input" name="password" type="password" class="form-control" v-model='password'>
    </div>
    <br>
    <button type="button" class="btn-fill btn btn-primary" v-on:click='signin()'>Login</button>
    <br>
    <!-- <button type="button" class="btn-fill btn btn-primary" v-on:click='goRegisterPage()'>Register</button> -->
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'

  export default {
    data: function () {
      return {
        email: '',
        password: '',
      }
    },
    computed: {
      ...mapState({ authenticated: state => state.auth.authenticated }),
    },
    methods: {
      ...mapActions(['login', 'setCurrentMatch']),
      async signin() {
        await this.login({
          email: this.email,
          password: this.password
        })
        if (this.authenticated) {
          this.setCurrentMatch('bookmakers')
          this.$router.push('/')
        }
      },
      goRegisterPage() {
        this.$router.push('/auth/register')
      }
    },
  }
</script>
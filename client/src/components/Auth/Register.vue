<template>
  <div class="col-md-4" style="display: flex; flex-direction: column; justify-content: center;">
    <label class="form-label">Name</label>
    <div class="form-group">
      <input placeholder="name" name="name" type="text" class="form-control" v-model='name'>
    </div>
    <label class="form-label">Email</label>
    <div class="form-group">
      <input placeholder="email" name="email" type="text" class="form-control" v-model='email'>
    </div>
    <label class="form-label">Password</label>
    <div class="form-group">
      <input placeholder="password" name="password" type="password" class="form-control" v-model='password'>
    </div>
    <label class="form-label">Confirm Password</label>
    <div class="form-group">
      <input placeholder="confirm password" name="password2" type="password" class="form-control" v-model='password2'>
    </div>
    <br>
    <button type="button" class="btn-fill btn btn-primary" v-on:click='Register()'>Register</button>
    <br>
    <button type="button" class="btn-fill btn btn-primary" v-on:click='goLoginPage()'>Login</button>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'

  export default {
    data: function () {
      return {
        name: '',
        email: '',
        password: '',
        password2: ''
      }
    },
    computed: {
      ...mapState({ authenticated: state => state.auth.authenticated })
    },
    methods: {
      ...mapActions(['registerUser']),
      goLoginPage() {
        this.$router.push('/auth/login')
      },
      validateEmail() {
        if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
          return true
        } else {
          return false
        }
      },
      async Register() {
        if (this.password !== this.password2) {
          alert("Passwords don't match. Please try again.")
        } else if (!this.validateEmail(this.email)) {
          alert('Invalid Email')
        } else if (this.password.length < 6) {
          alert("Password should contain over 6 numbers or digits")
        } else if (this.name.length < 1 || this.email.length < 1) {
          alert("Invaild User Info")
        } else {
          await this.registerUser({
            name: this.name,
            email: this.email,
            password: this.password
          })
          if (this.authenticated) {
            this.$router.push('/')
          }
        }
      }
    }
  }
</script>
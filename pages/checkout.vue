<template>
  <section class="container">
    <div>
      <h1 class="mt-2">Checkout</h1>
      <div class="row">
        <div class="col-md-6 offset-md-3 mt-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Card</h5>
              <p class="card-text">{{ numberOfItems }} items selected:</p>
              <ul>
                <li v-for="product in selectedProducts" :key="product.id" class="card-text mb-2">
                  Name: {{ product.name }} (${{ product.price }}) ({{ product.quantity }})
                  <button class="btn btn-sm btn-success" @click="addToCard(product)">+</button>
                  <button class="btn btn-sm btn-warning ml-2" @click="removeFromCard(product)">-</button>
                </li>
              </ul>
              <h5 class="card-text">
                Total: ${{ price }}
              </h5>
              <p v-if="!selectedProducts.length">Please select some items.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 offset-md-3 mt-3">
          <form autocomplete="off" @submit.stop.prevent="handleSubmit">
            <div class="form-group">
              <label for="address">Address</label>
              <input
                id="address"
                v-model="address"
                type="text"
                autofocus="true"
                placeholder="Enter your address"
                required/>
            </div>
            <div class="form-group">
              <label for="postalCode">Postal Code</label>
              <input
                id="postalCode"
                v-model="postalCode"
                type="text"
                autofocus="true"
                placeholder="Enter your postal code"
                required/>
            </div>
            <div class="form-group">
              <label for="city">City</label>
              <input
                id="city"
                v-model="city"
                type="text"
                autofocus="true"
                placeholder="Enter your city"
                required/>
            </div>
            <div class="form-group">
              <label for="card">Card</label>
              <card
                class="form-control"
                stripe="pk_test_IngCLTu9rvg3MZGc40jmhaOc"
              />
            </div>
            <button :disabled="loading" type="submit" class="btn btn-primary btn-block mt-3">Submit</button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { Card, createToken } from 'vue-stripe-elements-plus'
import { mapMutations } from 'vuex'
import Strapi from 'strapi-sdk-javascript/build/main'
const apiUrl = process.env.API_URL || 'http://localhost:1337'
const strapi = new Strapi(apiUrl)
export default {
  components: {
    Card
  },
  data() {
    return {
      address: '',
      postalCode: '',
      city: '',
      loading: false
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    products() {
      return this.$store.getters['products/list']
    },
    selectedProducts() {
      return this.$store.getters['card/items']
    },
    price() {
      return this.$store.getters['card/price']
    },
    numberOfItems() {
      return this.$store.getters['card/numberOfItems']
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      let token
      try {
        const response = await createToken()
        token = response.token.id
      } catch (err) {
        alert('An error occurred.')
        this.loading = false
        return
      }
      try {
        await strapi.createEntry('order', {
          amount: this.$store.getters['card/price'],
          products: this.$store.getters['card/items'],
          address: this.address,
          postalCode: this.postalCode,
          city: this.city,
          token
        })
        alert('Your order have been successfully submitted.')
        this.emptyCard()
        this.$router.push('/')
      } catch (err) {
        this.loading = false
        alert('An error occurred.')
      }
    },
    ...mapMutations({
      addToCard: 'card/add',
      removeFromCard: 'card/remove',
      emptyCard: 'card/emptyList'
    })
  }
}
</script>
<template>
  <div>
    <div>
      <input v-model="query" type="text" class="form-control" placeholder="Search...">
    </div>
    <div>
      <div v-for="product in filteredList" :key="product.id">
        <img :src="product.image.url">
        <h4>{{ product.name }}</h4>
        <p>{{ product.description || 'No description provided' }}.</p>
        <p>{{ product.price }}</p>
        <button @click="addToCard(product)">Add to card</button>
      </div>
    </div>
    <div class="col-md-4">
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
          <button :disabled="!selectedProducts.length" class="btn btn-primary" @click="goToCheckout">Order</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Strapi from 'strapi-sdk-javascript/build/main'
const apiUrl = process.env.API_URL || 'http://localhost:1337'
const strapi = new Strapi(apiUrl)
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      query: '',
      complete: false
    }
  },
  computed: {
    selectedProducts() {
      return this.$store.getters['card/items']
    },
    price() {
      return this.$store.getters['card/price']
    },
    numberOfItems() {
      return this.$store.getters['card/numberOfItems']
    },
    filteredList() {
      return this.products.filter(product => {
        return product.name.toLowerCase().includes(this.query.toLowerCase())
      })
    },
    products() {
      return this.$store.getters['products/list']
    }
  },
  async fetch({ store }) {
    store.commit('products/emptyList')
    const response = await strapi.request('post', '/graphql', {
      data: {
        query: `query {
            products {
              _id
              name
              description
              price
              image {
                url
              }
            }
          }
          `
      }
    })
    response.data.products.forEach(product => {
      product.image.url = `${apiUrl}${product.image.url}`
      store.commit('products/add', {
        id: product.id || product._id,
        ...product
      })
    })
  },
  methods: {
    goToCheckout() {
      // Redirect to signin page if not logged in.
      const isConnected = this.$store.getters['auth/username']
      if (!isConnected) {
        this.$router.push('/signin')
        return
      }
      this.$router.push('/checkout')
    },
    ...mapMutations({
      addToCard: 'card/add',
      removeFromCard: 'card/remove',
      emptyCard: 'card/emptyList'
    })
  }
}
</script>

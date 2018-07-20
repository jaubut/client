export const state = () => ({
    list: []
  })
  
  export const mutations = {
    add(state, product) {
      state.list.push(product)
    },
    emptyList(state) {
      state.list = []
    }
  }
  
  export const getters = {
    list: state => {
      return state.list
    }
  }
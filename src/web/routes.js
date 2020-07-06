import Home from './home'
import Invoice from './invoice'

export default {
  '/': {
    OnEnter: (state) => {
      return Home.Init({...state, viewFn: Home.View})
    }
  },
  '/invoice/:id': {
    OnEnter: (state, params) => {
      console.log("OnEnter")
      return Invoice.Init({...state, viewFn: Invoice.View}, params.id)
    }
  }
}

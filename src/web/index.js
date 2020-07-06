import { app } from 'hyperapp'
import { interval } from '@hyperapp/time'
import withRouter from '@mrbarrysoftware/hyperapp-router'
import Main from './main'
import routes from './routes'
import { FetchInvoice, FetchInvoiceFx } from './invoice'

const Init = [
  {}
]

const container = document.getElementById('app')

withRouter(app)({
  router: {
    RouteAction: (state, {params, path}) => ({...state}),
    disableAnchorCapture: false,
    routes,
  },
  init: Init, 
  node: container,
  view: Main,
  subscriptions: state => {
    const subs = []
    subs.push(state.invoice ? interval([FetchInvoice,state.invoice._id], {delay:5000}) : false )
    console.log("SUBS",subs)
    return subs
  }
})


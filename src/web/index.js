import { app } from 'hyperapp'
import withRouter from '@mrbarrysoftware/hyperapp-router'
import Main from './main'
import routes from './routes'

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
    return []
  }
})


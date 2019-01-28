import { app } from 'hyperapp'

let unsubscribe
const main = require('./main').default
let state = main.state

const App = app(
  state,
  main.actions,
  main.view,
  document.body
)
if (unsubscribe) {
  unsubscribe()
}
unsubscribe = main.router.subscribe(App.location)

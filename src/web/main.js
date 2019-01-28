import { app, h } from 'hyperapp'
import { Switch, Route, Link, location as router, Redirect } from "@hyperapp/router"
import Invoice from './invoice'
import './main.scss'


const withProps = (Component, props) => (match, location) => {
  return <Component match={match} location={location} {...props}/>
}

const Home = _ => (
  <h1 class="is-1 title">DAIPAY</h1>
)
const actions = {
  location: router.actions,
  invoice: Invoice.actions
}

const state = {
  location: router.state,
  invoice: Invoice.state
}

const view = (state, actions) => {
  return <main>
    <section class="hero is-medium is-success is-bold is-fullheight">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="column is-4 is-offset-4">
            <Route path="/" render={Home} />
            <Route path="/invoice/:id" render={({match,location}) => withProps(Invoice.view, {state, actions})(match,location)} />
          </div>
        </div>
      </div>
      <div class="hero-foot">
        <div class="content has-text-centered">
          <p>
            <a href="https://makerdao.com/en/dai/" target="_blank">What is DAI?</a> | Powered by DAIPAY
          </p>
        </div>
      </div>
    </section>
  </main>
}

export default {
  actions,
  state,
  view,
  router
}


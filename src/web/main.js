import { h } from 'hyperapp'
import Invoice from './invoice'
import './main.scss'


export default state => {
  if (__DEV__)
    console.log('===== STATE ======',state)
  return <main>
    <section class="hero is-medium is-success is-bold is-fullheight">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="column is-4 is-offset-4">
            { state.viewFn ? state.viewFn(state) : 'Loading' }
          </div>
        </div>
      </div>
      <div class="hero-foot">
        <div class="content has-text-centered">
          <p>
            <a href="https://makerdao.com/en/dai/" target="_blank">What is DAI?</a> | <a href="https://github.com/codevet/daipay" target="_blank">Powered by DAIPAY</a>
          </p>
        </div>
      </div>
    </section>
  </main>
}


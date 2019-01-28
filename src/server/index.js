import app from './server'
import config from 'config'
import { runLastBlockJob } from './jobs/invoices'
import { runCallbackJob }  from './jobs/callbacks'

app.listen(config.listen, _ => console.log("Listening on port",config.listen))

runLastBlockJob()
runCallbackJob()

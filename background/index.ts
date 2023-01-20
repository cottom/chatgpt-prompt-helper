import { Storage } from '@plasmohq/storage'

import { PROMOT_KEY } from '../request'

const storage = new Storage({ area: 'local' })

storage.watch({
  [PROMOT_KEY]: (c) => {
    console.log(c.newValue)
  }
})
